"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PLANS, type PlanKey } from "@/lib/stripe";

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<PlanKey | null>(null);

  async function handleCheckout(plan: PlanKey) {
    if (!session?.user) {
      router.push("/auth/signin?callbackUrl=/pricing");
      return;
    }

    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Checkout error:", data.error);
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="mb-3 text-4xl font-bold tracking-tight">
          Simple, transparent pricing
        </h1>
        <p className="text-lg text-muted-foreground">
          One-time payment. Lifetime access. No recurring fees.
        </p>
      </div>

      <div className="grid max-w-5xl gap-6 md:grid-cols-3">
        {(Object.entries(PLANS) as [PlanKey, (typeof PLANS)[PlanKey]][]).map(
          ([key, plan]) => (
            <Card
              key={key}
              className={
                key === "pro"
                  ? "relative ring-2 ring-primary"
                  : ""
              }
            >
              {key === "pro" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    {plan.priceDisplay}
                  </span>
                  <span className="ml-1 text-muted-foreground">one-time</span>
                </div>
                <ul className="space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="size-4 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  size="lg"
                  variant={key === "pro" ? "default" : "outline"}
                  onClick={() => handleCheckout(key)}
                  disabled={loading !== null}
                >
                  {loading === key ? "Redirecting..." : `Get ${plan.name}`}
                </Button>
              </CardFooter>
            </Card>
          ),
        )}
      </div>
    </div>
  );
}
