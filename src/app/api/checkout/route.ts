import { NextResponse } from "next/server";
import { getSiteUrl, getStripe, isStripeConfigured, PRO_PRICE_JPY } from "@/lib/stripe";
import { isLicensingConfigured } from "@/lib/license";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isStripeConfigured() || !isLicensingConfigured()) {
    return NextResponse.json(
      { error: "not_configured", message: "決済は現在準備中です。" },
      { status: 503 },
    );
  }

  const siteUrl = getSiteUrl(request.url);
  const stripe = getStripe();
  const priceId = process.env.STRIPE_PRICE_ID;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      priceId
        ? { price: priceId, quantity: 1 }
        : {
            quantity: 1,
            price_data: {
              currency: "jpy",
              unit_amount: PRO_PRICE_JPY,
              product_data: {
                name: "Formula Studio Pro（買い切り）",
                description: "透かし削除・全テーマ・全サイズ・2倍解像度の書き出し",
              },
            },
          },
    ],
    success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/?checkout=cancel`,
    allow_promotion_codes: true,
  });

  if (!session.url) {
    return NextResponse.json({ error: "checkout_failed" }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
