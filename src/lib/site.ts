export const SITE = {
  name: "ことばの方程式",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://kotoba-equation.vercel.app",
  contactUrl: process.env.NEXT_PUBLIC_CONTACT_URL ?? "",
};

export type DonateTier = {
  amount: number;
  /** Shown under the amount so the choice reads as an intent, not a price. */
  note: string;
  url: string;
};

/** Stripe Payment Link ごとの金額。URLが未設定の金額は表示しません。 */
const DONATE_LINKS: [number, string, string | undefined][] = [
  [
    50,
    "気持ちだけ",
    process.env.NEXT_PUBLIC_DONATE_URL_50 ??
      "https://buy.stripe.com/3cI00k1gfa8JcuqfMLes001",
  ],
  [
    100,
    "ちょっと応援",
    process.env.NEXT_PUBLIC_DONATE_URL_100 ??
      "https://buy.stripe.com/dRmeVe3on1Cd0LIdEDes002",
  ],
  [
    300,
    "ひとこと分の応援",
    process.env.NEXT_PUBLIC_DONATE_URL_300 ??
      "https://buy.stripe.com/fZu9AUf7580B6622ZZes003",
  ],
  [
    500,
    "しっかり応援",
    process.env.NEXT_PUBLIC_DONATE_URL ??
      "https://donate.stripe.com/dRm14o0cb0y92TQ9ones000?locale=ja",
  ],
];

/** 金額をStripeの決済ページで選ぶリンク。50円の個数で金額が決まります。 */
export const DONATE_CUSTOM_URL =
  process.env.NEXT_PUBLIC_DONATE_URL_CUSTOM ??
  "https://buy.stripe.com/14AfZi0cb2GhdyueIHes004";

/** Bounds configured on the custom-amount payment link. Stripe will not charge
 *  less than ¥50 per payment, so that is the floor, and the link is capped at
 *  2,000 units of ¥50. */
export const DONATE_MIN = 50;
export const DONATE_MAX = 100000;
/** The custom link charges ¥50 per unit, so amounts move in ¥50 steps. */
export const DONATE_STEP = 50;

export const DONATE_TIERS: DonateTier[] = DONATE_LINKS.filter(
  (tier): tier is [number, string, string] => Boolean(tier[2]),
).map(([amount, note, url]) => ({ amount, note, url }));

/** Amount highlighted as the default choice. */
export const DONATE_SUGGESTED = 500;

/** Anchor used by the header and footer buttons. */
export const DONATE_ANCHOR = "donate";

export const DONATE_ENABLED = DONATE_TIERS.length > 0 || !!DONATE_CUSTOM_URL;

/** Official accounts. Listed in the page's JSON-LD so search engines can tell
 *  this brand apart from look-alike sites. */
export const SOCIAL = {
  tiktok:
    process.env.NEXT_PUBLIC_TIKTOK_URL ?? "https://www.tiktok.com/@yuusuusr0ar",
};

export const SHARE_HASHTAGS = ["ことばの方程式"];

/**
 * Token appended to the donation page's thank-you redirect
 * (`{SITE.url}/?thanks={SUPPORTER_KEY}`). It only gates a cosmetic logo, so a
 * shared secret in the bundle is a deliberate trade-off against needing a
 * backend and payment webhooks.
 */
export const SUPPORTER_KEY =
  process.env.NEXT_PUBLIC_SUPPORTER_KEY ?? "coffee-thanks";

/** How long the supporter logo stays unlocked after coming back. */
export const SUPPORTER_WINDOW_MS = 24 * 60 * 60 * 1000;

