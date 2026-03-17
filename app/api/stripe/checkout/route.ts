import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStripe, PLANS, getBaseUrl, type PlanKey } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const plan = body.plan as PlanKey;

  if (!plan || !PLANS[plan]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const baseUrl = getBaseUrl();
  const selectedPlan = PLANS[plan];

  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: session.user.email,
    metadata: {
      userId: session.user.id,
      plan,
    },
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Volts ${selectedPlan.name}`,
            description: selectedPlan.description,
          },
          unit_amount: selectedPlan.price,
        },
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/checkout/cancel`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
