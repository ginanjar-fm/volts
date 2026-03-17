import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOrganization, getUserOrganizations } from "@/lib/organizations";

/** GET /api/organizations — list user's organizations */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const memberships = await getUserOrganizations(session.user.id);
  const orgs = memberships.map((m) => ({
    ...m.organization,
    role: m.role,
  }));

  return NextResponse.json(orgs);
}

/** POST /api/organizations — create a new organization */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, slug } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json(
      { error: "Organization name is required" },
      { status: 400 },
    );
  }

  try {
    const org = await createOrganization(name.trim(), session.user.id, slug);
    return NextResponse.json(org, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error && error.message.includes("unique")
        ? "An organization with this slug already exists"
        : "Failed to create organization";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
