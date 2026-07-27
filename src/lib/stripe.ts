import Stripe from "stripe";

export const PRO_PRICE_JPY = Number(process.env.PRO_PRICE_JPY ?? 1980);

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(key, { apiVersion: "2024-12-18.acacia" });
}

export function getSiteUrl(requestUrl: string): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  return new URL(requestUrl).origin;
}
