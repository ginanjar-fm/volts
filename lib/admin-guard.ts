import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Server-side guard for admin-only pages.
 * Redirects non-admin users to the dashboard.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }
  if (session.user.systemRole !== "admin") {
    redirect("/dashboard");
  }
  return session;
}
