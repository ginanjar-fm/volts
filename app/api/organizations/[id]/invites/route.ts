import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { organizationInvites } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getMembership, hasRole, createInvite } from "@/lib/organizations";

type Params = { params: Promise<{ id: string }> };

/** GET /api/organizations/:id/invites — list pending invites */
export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await getMembership(id, session.user.id);
  if (!membership || !hasRole(membership.role, "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const invites = await db.query.organizationInvites.findMany({
    where: eq(organizationInvites.organizationId, id),
    with: { inviter: true },
    orderBy: (inv, { desc }) => [desc(inv.createdAt)],
  });

  return NextResponse.json(invites);
}

/** POST /api/organizations/:id/invites — send an invite */
export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await getMembership(id, session.user.id);
  if (!membership || !hasRole(membership.role, "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { email, role = "member" } = body;

  if (!email || typeof email !== "string") {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 },
    );
  }

  if (!["admin", "member"].includes(role)) {
    return NextResponse.json(
      { error: "Role must be 'admin' or 'member'" },
      { status: 400 },
    );
  }

  const invite = await createInvite(id, email.toLowerCase().trim(), role, session.user.id);

  // In production, send an email here with the invite link
  // For now, return the token so it can be shared
  return NextResponse.json(invite, { status: 201 });
}
