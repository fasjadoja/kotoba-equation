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
  [300, "ひとこと分の応援", process.env.NEXT_PUBLIC_DONATE_URL_300],
  [
    500,
    "コーヒー1杯",
    process.env.NEXT_PUBLIC_DONATE_URL ??
      "https://donate.stripe.com/dRm14o0cb0y92TQ9ones000?locale=ja",
  ],
  [1000, "しっかり応援", process.env.NEXT_PUBLIC_DONATE_URL_1000],
  [3000, "サーバー代の足しに", process.env.NEXT_PUBLIC_DONATE_URL_3000],
];

export const DONATE_TIERS: DonateTier[] = DONATE_LINKS.filter(
  (tier): tier is [number, string, string] => Boolean(tier[2]),
).map(([amount, note, url]) => ({ amount, note, url }));

/** Amount highlighted as the default choice. */
export const DONATE_SUGGESTED = 500;

/** Anchor used by the header and footer buttons. */
export const DONATE_ANCHOR = "donate";

export const DONATE_ENABLED = DONATE_TIERS.length > 0;

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

