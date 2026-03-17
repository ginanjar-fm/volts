import { db } from "@/lib/db";
import {
  organizations,
  organizationMembers,
  organizationInvites,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

/** Generate a URL-safe slug from a name */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Create an organization and add the creator as owner */
export async function createOrganization(
  name: string,
  userId: string,
  slug?: string,
) {
  const orgSlug = slug || slugify(name) + "-" + crypto.randomBytes(3).toString("hex");

  const [org] = await db.insert(organizations).values({ name, slug: orgSlug }).returning();

  await db.insert(organizationMembers).values({
    organizationId: org.id,
    userId,
    role: "owner",
  });

  return org;
}

/** Get all organizations a user belongs to */
export async function getUserOrganizations(userId: string) {
  return db.query.organizationMembers.findMany({
    where: eq(organizationMembers.userId, userId),
    with: { organization: true },
  });
}

/** Get a single organization by ID */
export async function getOrganization(orgId: string) {
  return db.query.organizations.findFirst({
    where: eq(organizations.id, orgId),
    with: { members: { with: { user: true } } },
  });
}

/** Get a user's membership in an organization */
export async function getMembership(orgId: string, userId: string) {
  return db.query.organizationMembers.findFirst({
    where: and(
      eq(organizationMembers.organizationId, orgId),
      eq(organizationMembers.userId, userId),
    ),
  });
}

/** Check if user has at least the given role in an org */
export function hasRole(
  memberRole: string,
  requiredRole: "owner" | "admin" | "member",
): boolean {
  const hierarchy = { owner: 3, admin: 2, member: 1 };
  return (hierarchy[memberRole as keyof typeof hierarchy] ?? 0) >= hierarchy[requiredRole];
}

/** Update an organization */
export async function updateOrganization(
  orgId: string,
  data: { name?: string; slug?: string; logo?: string },
) {
  const [updated] = await db
    .update(organizations)
    .set(data)
    .where(eq(organizations.id, orgId))
    .returning();
  return updated;
}

/** Delete an organization */
export async function deleteOrganization(orgId: string) {
  await db.delete(organizations).where(eq(organizations.id, orgId));
}

/** Create an invite */
export async function createInvite(
  orgId: string,
  email: string,
  role: "admin" | "member",
  invitedBy: string,
) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const [invite] = await db
    .insert(organizationInvites)
    .values({
      organizationId: orgId,
      email,
      role,
      token,
      invitedBy,
      expiresAt,
    })
    .returning();

  return invite;
}

/** Accept an invite by token */
export async function acceptInvite(token: string, userId: string) {
  const invite = await db.query.organizationInvites.findFirst({
    where: and(
      eq(organizationInvites.token, token),
    ),
    with: { organization: true },
  });

  if (!invite) throw new Error("Invite not found");
  if (invite.acceptedAt) throw new Error("Invite already accepted");
  if (invite.expiresAt < new Date()) throw new Error("Invite expired");

  // Check if already a member
  const existing = await getMembership(invite.organizationId, userId);
  if (existing) throw new Error("Already a member of this organization");

  // Add as member
  await db.insert(organizationMembers).values({
    organizationId: invite.organizationId,
    userId,
    role: invite.role,
  });

  // Mark invite as accepted
  await db
    .update(organizationInvites)
    .set({ acceptedAt: new Date() })
    .where(eq(organizationInvites.id, invite.id));

  return invite.organization;
}

/** Remove a member from an organization */
export async function removeMember(orgId: string, userId: string) {
  await db
    .delete(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, orgId),
        eq(organizationMembers.userId, userId),
      ),
    );
}

/** Update a member's role */
export async function updateMemberRole(
  orgId: string,
  userId: string,
  role: "admin" | "member",
) {
  const [updated] = await db
    .update(organizationMembers)
    .set({ role })
    .where(
      and(
        eq(organizationMembers.organizationId, orgId),
        eq(organizationMembers.userId, userId),
      ),
    )
    .returning();
  return updated;
}
