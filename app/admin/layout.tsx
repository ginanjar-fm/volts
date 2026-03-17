import { requireAdmin } from "@/lib/admin-guard";
import { AdminNav } from "./admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
