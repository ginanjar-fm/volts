import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { subscriptions, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session);
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdated(subscription);
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeleted(subscription);
      break;
    }
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const plan = session.metadata?.plan;

  if (!userId || !plan || !session.customer) return;

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer.id;

  // For one-time payments, store the purchase record
  await db.insert(subscriptions).values({
    // Use a placeholder org ID — in production this would be the user's org
    organizationId: userId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: session.id, // session ID for one-time payments
    stripePriceId: plan,
    status: "active",
    currentPeriodStart: new Date(),
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const subId = subscription.id;
  const status = mapStripeStatus(subscription.status);

  const firstItem = subscription.items?.data?.[0];
  const periodStart = firstItem
    ? new Date(firstItem.current_period_start * 1000)
    : undefined;
  const periodEnd = firstItem
    ? new Date(firstItem.current_period_end * 1000)
    : undefined;

  await db
    .update(subscriptions)
    .set({
      status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      ...(periodStart && { currentPeriodStart: periodStart }),
      ...(periodEnd && { currentPeriodEnd: periodEnd }),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subId));
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await db
    .update(subscriptions)
    .set({ status: "canceled" })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
}

function mapStripeStatus(
  status: Stripe.Subscription.Status,
): "active" | "canceled" | "past_due" | "trialing" | "incomplete" | "paused" {
  const map: Record<string, "active" | "canceled" | "past_due" | "trialing" | "incomplete" | "paused"> = {
    active: "active",
    canceled: "canceled",
    past_due: "past_due",
    trialing: "trialing",
    incomplete: "incomplete",
    incomplete_expired: "canceled",
    paused: "paused",
    unpaid: "past_due",
  };
  return map[status] ?? "incomplete";
}
