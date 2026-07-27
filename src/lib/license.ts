import { createHash, createHmac, timingSafeEqual } from "crypto";

const PREFIX = "FS1";
const ID_LENGTH = 12;
const SIG_LENGTH = 12;

function getSecret(): string {
  const secret = process.env.LICENSE_SECRET;
  if (!secret) {
    throw new Error("LICENSE_SECRET is not configured");
  }
  return secret;
}

function sign(id: string): string {
  return createHmac("sha256", getSecret()).update(id).digest("hex").slice(0, SIG_LENGTH).toUpperCase();
}

function group(value: string): string {
  return value.match(/.{1,4}/g)?.join("-") ?? value;
}

/** Deterministically derives a license key from a purchase identifier. */
export function issueLicenseKey(seed: string): string {
  const id = createHash("sha256")
    .update(`${getSecret()}:${seed}`)
    .digest("hex")
    .slice(0, ID_LENGTH)
    .toUpperCase();
  return `${PREFIX}-${group(id)}-${group(sign(id))}`;
}

export function verifyLicenseKey(key: string): boolean {
  const normalized = key.trim().toUpperCase().replace(/[\s-]/g, "");
  if (!normalized.startsWith(PREFIX)) return false;

  const body = normalized.slice(PREFIX.length);
  if (body.length !== ID_LENGTH + SIG_LENGTH) return false;

  const id = body.slice(0, ID_LENGTH);
  const signature = body.slice(ID_LENGTH);
  if (!/^[0-9A-F]+$/.test(body)) return false;

  const expected = Buffer.from(sign(id));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

export function isLicensingConfigured(): boolean {
  return Boolean(process.env.LICENSE_SECRET);
}
