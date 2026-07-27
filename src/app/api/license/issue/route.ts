import { NextResponse } from "next/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { isLicensingConfigured, issueLicenseKey } from "@/lib/license";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isStripeConfigured() || !isLicensingConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "missing_session_id" }, { status: 400 });
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    return NextResponse.json({ error: "not_paid" }, { status: 402 });
  }

  return NextResponse.json({
    key: issueLicenseKey(session.id),
    email: session.customer_details?.email ?? null,
  });
}
