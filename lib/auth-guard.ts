import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Server-side auth guard for protected pages.
 * Call at the top of any server component or layout that requires auth.
 *
 * @example
 * export default async function DashboardPage() {
 *   const session = await requireAuth();
 *   return <div>Hello {session.user.name}</div>;
 * }
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }
  return session;
}
