import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { PLANS, type PlanKey } from "@/lib/stripe";
import { BillingActions } from "./billing-actions";

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const userSubs = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.organizationId, session.user.id))
    .orderBy(desc(subscriptions.createdAt));

  const activeSub = userSubs.find((s) => s.status === "active");
  const planKey = activeSub?.stripePriceId as PlanKey | undefined;
  const plan = planKey ? PLANS[planKey] : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Billing</h1>

      {activeSub && plan ? (
        <div className="space-y-6">
          <div className="rounded-xl border p-6">
            <div className="mb-1 text-sm text-muted-foreground">
              Current Plan
            </div>
            <div className="text-2xl font-semibold">{plan.name}</div>
            <div className="mt-1 text-muted-foreground">
              {plan.priceDisplay} &mdash; one-time purchase
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                Active
              </span>
              <span className="text-xs text-muted-foreground">
                Purchased{" "}
                {activeSub.createdAt.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            <ul className="mt-6 space-y-2">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <span className="text-primary">&#10003;</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <BillingActions hasSubscription />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-xl border p-6 text-center">
            <div className="mb-2 text-lg font-medium">No active plan</div>
            <p className="text-sm text-muted-foreground">
              You haven&apos;t purchased a plan yet. Choose a plan to get
              started.
            </p>
          </div>

          <BillingActions hasSubscription={false} />
        </div>
      )}

      {userSubs.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 text-lg font-semibold">Purchase History</h2>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2.5 text-left font-medium">Plan</th>
                  <th className="px-4 py-2.5 text-left font-medium">Status</th>
                  <th className="px-4 py-2.5 text-left font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {userSubs.map((sub) => (
                  <tr key={sub.id} className="border-b last:border-0">
                    <td className="px-4 py-2.5 capitalize">
                      {sub.stripePriceId ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 capitalize">{sub.status}</td>
                    <td className="px-4 py-2.5">
                      {sub.createdAt.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
