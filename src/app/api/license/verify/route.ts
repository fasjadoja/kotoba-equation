import { NextResponse } from "next/server";
import { isLicensingConfigured, verifyLicenseKey } from "@/lib/license";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isLicensingConfigured()) {
    return NextResponse.json({ valid: false, error: "not_configured" }, { status: 503 });
  }

  let key: unknown;
  try {
    const body: unknown = await request.json();
    key = (body as { key?: unknown }).key;
  } catch {
    return NextResponse.json({ valid: false, error: "invalid_body" }, { status: 400 });
  }

  if (typeof key !== "string" || key.length > 128) {
    return NextResponse.json({ valid: false, error: "invalid_key" }, { status: 400 });
  }

  return NextResponse.json({ valid: verifyLicenseKey(key) });
}
