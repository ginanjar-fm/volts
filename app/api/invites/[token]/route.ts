import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { organizationInvites } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { acceptInvite } from "@/lib/organizations";

type Params = { params: Promise<{ token: string }> };

/** GET /api/invites/:token — get invite details (public, for the accept page) */
export async function GET(_request: Request, { params }: Params) {
  const { token } = await params;

  const invite = await db.query.organizationInvites.findFirst({
    where: and(
      eq(organizationInvites.token, token),
      isNull(organizationInvites.acceptedAt),
    ),
    with: { organization: true },
  });

  if (!invite) {
    return NextResponse.json(
      { error: "Invite not found or already used" },
      { status: 404 },
    );
  }

  if (invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "Invite expired" }, { status: 410 });
  }

  return NextResponse.json({
    organization: { name: invite.organization.name, slug: invite.organization.slug },
    email: invite.email,
    role: invite.role,
    expiresAt: invite.expiresAt,
  });
}

/** POST /api/invites/:token — accept the invite */
export async function POST(_request: Request, { params }: Params) {
  const { token } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const org = await acceptInvite(token, session.user.id);
    return NextResponse.json({ success: true, organization: org });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to accept invite";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
