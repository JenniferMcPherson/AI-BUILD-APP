import "server-only";

import Stripe from "stripe";

export type PlanKey = "PRO" | "BUSINESS";

export const PLAN_LIMITS: Record<"FREE" | "PRO" | "BUSINESS" | "ENTERPRISE", number | null> = {
  FREE: 3,
  PRO: 25,
  BUSINESS: 100,
  ENTERPRISE: null,
};

export const PLANS: Record<
  PlanKey,
  { name: string; price: string; description: string; features: string[] }
> = {
  PRO: {
    name: "Pro",
    price: "$19/mo",
    description: "For builders shipping real projects.",
    features: ["25 projects", "Priority AI generations", "GitHub export", "Email support"],
  },
  BUSINESS: {
    name: "Business",
    price: "$49/mo",
    description: "For small teams building together.",
    features: ["100 projects", "Team collaboration (soon)", "Priority support", "Everything in Pro"],
  },
};

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

let client: Stripe | null = null;

export function getStripeClient() {
  if (!isStripeConfigured()) {
    throw new Error("Stripe is not configured.");
  }
  if (!client) {
    client = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return client;
}

export function priceIdForPlan(plan: PlanKey): string | null {
  const key = plan === "PRO" ? "STRIPE_PRICE_ID_PRO" : "STRIPE_PRICE_ID_BUSINESS";
  return process.env[key] ?? null;
}

export function planForPriceId(priceId: string): "PRO" | "BUSINESS" | null {
  if (priceId === process.env.STRIPE_PRICE_ID_PRO) return "PRO";
  if (priceId === process.env.STRIPE_PRICE_ID_BUSINESS) return "BUSINESS";
  return null;
}
