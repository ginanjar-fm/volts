import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  users,
  organizationMembers,
  organizations,
  subscriptions,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { logAuditEvent } from "@/lib/audit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.systemRole !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
    columns: {
      id: true,
      email: true,
      name: true,
      image: true,
      systemRole: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const memberships = await db
    .select({
      organizationId: organizationMembers.organizationId,
      role: organizationMembers.role,
      joinedAt: organizationMembers.createdAt,
      orgName: organizations.name,
      orgSlug: organizations.slug,
      subscriptionStatus: subscriptions.status,
    })
    .from(organizationMembers)
    .innerJoin(
      organizations,
      eq(organizationMembers.organizationId, organizations.id),
    )
    .leftJoin(
      subscriptions,
      eq(organizations.id, subscriptions.organizationId),
    )
    .where(eq(organizationMembers.userId, id));

  return NextResponse.json({ user, memberships });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.systemRole !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const updateData: Record<string, unknown> = {};
  if (body.name !== undefined) {
    updateData.name = body.name;
  }
  if (body.systemRole !== undefined) {
    if (!["user", "admin"].includes(body.systemRole)) {
      return NextResponse.json(
        { error: "Invalid systemRole" },
        { status: 400 },
      );
    }
    updateData.systemRole = body.systemRole;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 },
    );
  }

  const [updated] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      systemRole: users.systemRole,
      updatedAt: users.updatedAt,
    });

  if (!updated) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (body.systemRole !== undefined) {
    await logAuditEvent({
      actorId: session.user.id,
      action: "user.systemRole.changed",
      targetType: "user",
      targetId: id,
      metadata: { newRole: body.systemRole },
    });
  }

  return NextResponse.json({ user: updated });
}
