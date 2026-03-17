import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getMembership,
  hasRole,
  updateMemberRole,
  removeMember,
} from "@/lib/organizations";

type Params = { params: Promise<{ id: string; memberId: string }> };

/** PATCH /api/organizations/:id/members/:memberId — update member role */
export async function PATCH(request: Request, { params }: Params) {
  const { id, memberId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const myMembership = await getMembership(id, session.user.id);
  if (!myMembership || !hasRole(myMembership.role, "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const targetMembership = await getMembership(id, memberId);
  if (!targetMembership) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // Cannot change owner's role
  if (targetMembership.role === "owner") {
    return NextResponse.json(
      { error: "Cannot change the owner's role" },
      { status: 403 },
    );
  }

  const body = await request.json();
  const { role } = body;

  if (!role || !["admin", "member"].includes(role)) {
    return NextResponse.json(
      { error: "Role must be 'admin' or 'member'" },
      { status: 400 },
    );
  }

  const updated = await updateMemberRole(id, memberId, role);
  return NextResponse.json(updated);
}

/** DELETE /api/organizations/:id/members/:memberId — remove member */
export async function DELETE(_request: Request, { params }: Params) {
  const { id, memberId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Users can remove themselves; admins+ can remove others
  if (memberId !== session.user.id) {
    const myMembership = await getMembership(id, session.user.id);
    if (!myMembership || !hasRole(myMembership.role, "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const targetMembership = await getMembership(id, memberId);
  if (!targetMembership) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // Cannot remove the owner
  if (targetMembership.role === "owner") {
    return NextResponse.json(
      { error: "Cannot remove the organization owner" },
      { status: 403 },
    );
  }

  await removeMember(id, memberId);
  return NextResponse.json({ success: true });
}
