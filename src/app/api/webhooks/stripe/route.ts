import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { getStripeClient, isStripeConfigured, planForPriceId } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  if (!isStripeConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 501 });
  }

  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const stripe = getStripeClient();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.customer && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        await syncSubscription(session.customer as string, subscription);
      }
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await syncSubscription(subscription.customer as string, subscription);
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await db.user.updateMany({
        where: { stripeCustomerId: subscription.customer as string },
        data: {
          planTier: "FREE",
          stripeSubscriptionId: null,
          stripePriceId: null,
          stripeCurrentPeriodEnd: null,
        },
      });
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

async function syncSubscription(customerId: string, subscription: Stripe.Subscription) {
  const priceId = subscription.items.data[0]?.price.id;
  if (!priceId) return;

  const plan = planForPriceId(priceId);
  if (!plan) return;

  const currentPeriodEnd = subscription.items.data[0]?.current_period_end;

  await db.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      planTier: plan,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      stripeCurrentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null,
    },
  });
}
