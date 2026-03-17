import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getOrganization,
  getMembership,
  hasRole,
  updateOrganization,
  deleteOrganization,
} from "@/lib/organizations";

type Params = { params: Promise<{ id: string }> };

/** GET /api/organizations/:id — get organization details */
export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await getMembership(id, session.user.id);
  if (!membership) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const org = await getOrganization(id);
  return NextResponse.json({ ...org, currentUserRole: membership.role });
}

/** PATCH /api/organizations/:id — update organization */
export async function PATCH(request: Request, { params }: Params) {
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
  const { name, slug, logo } = body;

  const updates: Record<string, string> = {};
  if (name) updates.name = name.trim();
  if (slug) updates.slug = slug.trim();
  if (logo !== undefined) updates.logo = logo;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 },
    );
  }

  try {
    const org = await updateOrganization(id, updates);
    return NextResponse.json(org);
  } catch {
    return NextResponse.json(
      { error: "Failed to update organization" },
      { status: 409 },
    );
  }
}

/** DELETE /api/organizations/:id — delete organization (owner only) */
export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await getMembership(id, session.user.id);
  if (!membership || !hasRole(membership.role, "owner")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await deleteOrganization(id);
  return NextResponse.json({ success: true });
}
