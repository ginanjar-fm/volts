import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { getMembership, getUserOrganizations } from "@/lib/organizations";

const ORG_COOKIE = "volts-org-id";

/** Get the current organization ID from the cookie */
export async function getCurrentOrgId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ORG_COOKIE)?.value ?? null;
}

/** Set the current organization ID cookie */
export async function setCurrentOrgId(orgId: string) {
  const cookieStore = await cookies();
  cookieStore.set(ORG_COOKIE, orgId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
}

/**
 * Server-side: get the current org context for a protected page.
 * Returns the org ID and the user's role, or null if no org is selected.
 * If the stored org is invalid (user not a member), falls back to first org.
 */
export async function requireOrgContext() {
  const session = await auth();
  if (!session?.user?.id) return null;

  let orgId = await getCurrentOrgId();

  // Validate current org
  if (orgId) {
    const membership = await getMembership(orgId, session.user.id);
    if (!membership) orgId = null;
  }

  // Fall back to first org
  if (!orgId) {
    const memberships = await getUserOrganizations(session.user.id);
    if (memberships.length > 0) {
      orgId = memberships[0].organizationId;
    }
  }

  if (!orgId) return null;

  const membership = await getMembership(orgId, session.user.id);
  return membership
    ? { orgId, role: membership.role, userId: session.user.id }
    : null;
}
