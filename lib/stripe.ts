import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        "STRIPE_SECRET_KEY is not set. Add it to your .env.local file."
      );
    }
    _stripe = new Stripe(key, {
      apiVersion: "2026-02-25.clover",
      typescript: true,
    });
  }
  return _stripe;
}

export const PLANS = {
  starter: {
    name: "Starter",
    price: 14900, // cents
    priceDisplay: "$149",
    description: "Perfect for solo founders getting started",
    features: [
      "1 project",
      "Basic AI features",
      "Community support",
      "5,000 API calls/month",
    ],
  },
  pro: {
    name: "Pro",
    price: 24900,
    priceDisplay: "$249",
    description: "For growing teams that need more power",
    features: [
      "5 projects",
      "Advanced AI features",
      "Priority support",
      "50,000 API calls/month",
      "Custom integrations",
    ],
  },
  team: {
    name: "Team",
    price: 34900,
    priceDisplay: "$349",
    description: "For organizations that need it all",
    features: [
      "Unlimited projects",
      "Full AI suite",
      "Dedicated support",
      "Unlimited API calls",
      "Custom integrations",
      "SSO & advanced security",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.AUTH_URL) return process.env.AUTH_URL;
  return "http://localhost:3000";
}
