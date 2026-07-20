"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { getStripeClient, isStripeConfigured, priceIdForPlan, type PlanKey } from "@/lib/stripe";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function createCheckoutSession(plan: PlanKey) {
  const { userId } = await verifySession();

  if (!isStripeConfigured()) {
    return { error: "Billing isn't configured yet. Please check back soon." };
  }

  const priceId = priceIdForPlan(plan);
  if (!priceId) {
    return { error: `No price is configured for the ${plan} plan yet.` };
  }

  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
  const stripe = getStripeClient();

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email, name: user.name });
    customerId = customer.id;
    await db.user.update({ where: { id: userId }, data: { stripeCustomerId: customerId } });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${APP_URL}/dashboard?upgraded=1`,
    cancel_url: `${APP_URL}/pricing`,
  });

  if (!session.url) {
    return { error: "Couldn't start checkout. Please try again." };
  }

  redirect(session.url);
}

export async function createBillingPortalSession() {
  const { userId } = await verifySession();

  if (!isStripeConfigured()) {
    return { error: "Billing isn't configured yet." };
  }

  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.stripeCustomerId) {
    return { error: "You don't have a billing account yet." };
  }

  const stripe = getStripeClient();
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${APP_URL}/dashboard`,
  });

  redirect(session.url);
}
