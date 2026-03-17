"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function BillingActions({
  hasSubscription,
}: {
  hasSubscription: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  }

  if (!hasSubscription) {
    return (
      <Link href="/pricing">
        <Button size="lg">View Plans</Button>
      </Link>
    );
  }

  return (
    <div className="flex gap-3">
      <Button onClick={openPortal} disabled={loading} variant="outline">
        {loading ? "Opening..." : "Manage Billing"}
      </Button>
      <Link href="/pricing">
        <Button variant="outline">Upgrade Plan</Button>
      </Link>
    </div>
  );
}
