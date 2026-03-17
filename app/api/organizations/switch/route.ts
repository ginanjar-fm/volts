import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMembership } from "@/lib/organizations";
import { setCurrentOrgId } from "@/lib/org-context";

/** POST /api/organizations/switch — switch to a different org */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { organizationId } = body;

  if (!organizationId) {
    return NextResponse.json(
      { error: "organizationId is required" },
      { status: 400 },
    );
  }

  const membership = await getMembership(organizationId, session.user.id);
  if (!membership) {
    return NextResponse.json(
      { error: "Not a member of this organization" },
      { status: 403 },
    );
  }

  await setCurrentOrgId(organizationId);

  return NextResponse.json({ success: true, organizationId });
}
