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
  /** Lockup unlocked by this amount, shown as a thank-you on the buttons. */
  rank: UnlockRank;
};

/** Stripe Payment Link ごとの金額。URLが未設定の金額は表示しません。 */
const DONATE_LINKS: [number, string, string | undefined, UnlockRank][] = [
  [
    50,
    "気持ちだけ",
    process.env.NEXT_PUBLIC_DONATE_URL_50 ??
      "https://buy.stripe.com/3cI00k1gfa8JcuqfMLes001?locale=ja",
    "supporter",
  ],
  [
    100,
    "ちょっと応援",
    process.env.NEXT_PUBLIC_DONATE_URL_100 ??
      "https://buy.stripe.com/dRmeVe3on1Cd0LIdEDes002?locale=ja",
    "supporter",
  ],
  [
    300,
    "このサイトを応援",
    process.env.NEXT_PUBLIC_DONATE_URL_300 ??
      "https://buy.stripe.com/fZu9AUf7580B6622ZZes003?locale=ja",
    "premium",
  ],
  [
    500,
    "しっかり応援",
    process.env.NEXT_PUBLIC_DONATE_URL ??
      "https://donate.stripe.com/dRm14o0cb0y92TQ9ones000?locale=ja",
    "premium",
  ],
];

/** Kept off the amount row: next to ¥50–¥500 it reads as a price tag rather
 *  than a tip, so it sits in the fine print for the few who want it. */
export const DONATE_LARGE = {
  amount: 10000,
  url:
    process.env.NEXT_PUBLIC_DONATE_URL_10000 ??
    "https://buy.stripe.com/4gMaEY1gfdkV9ie6cbes005?locale=ja",
};

/** 金額をStripeの決済ページで選ぶリンク。50円の個数で金額が決まります。 */
export const DONATE_CUSTOM_URL =
  process.env.NEXT_PUBLIC_DONATE_URL_CUSTOM ??
  "https://buy.stripe.com/14AfZi0cb2GhdyueIHes004?locale=ja";

/** Bounds configured on the custom-amount payment link. Stripe will not charge
 *  less than ¥50 per payment, so that is the floor, and the link is capped at
 *  600 units of ¥50. */
export const DONATE_MIN = 50;
export const DONATE_MAX = 30000;
/** The custom link charges ¥50 per unit, so amounts move in ¥50 steps. */
export const DONATE_STEP = 50;

export const DONATE_TIERS: DonateTier[] = DONATE_LINKS.filter(
  (tier): tier is [number, string, string, UnlockRank] => Boolean(tier[2]),
).map(([amount, note, url, rank]) => ({ amount, note, url, rank }));

/** Amount highlighted as the default choice. */
export const DONATE_SUGGESTED = 300;

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

/** Ranks a donation can unlock, cheapest first. */
export type UnlockRank = "supporter" | "premium" | "elite";

export const UNLOCK_ORDER: UnlockRank[] = ["supporter", "premium", "elite"];

/**
 * Tokens appended to each payment link's thank-you redirect
 * (`{SITE.url}/?thanks={token}`). They only gate a cosmetic logo, so shared
 * secrets in the bundle are a deliberate trade-off against needing a backend
 * and payment webhooks.
 */
export const UNLOCK_TOKENS: Record<UnlockRank, string> = {
  supporter: process.env.NEXT_PUBLIC_SUPPORTER_KEY ?? "coffee-thanks",
  premium: process.env.NEXT_PUBLIC_PREMIUM_KEY ?? "premium-thanks",
  elite: process.env.NEXT_PUBLIC_ELITE_KEY ?? "patron-thanks",
};

export type UnlockRule = {
  /** How long the unlock survives in the browser. */
  windowMs: number;
  /** Images that may carry the lockup; null means "as many as you like". */
  exports: number | null;
  label: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The paid lockups are a thank-you, not a product: they last a few days and a
 * handful of images, then the normal brand logo comes back.
 */
export const UNLOCK_RULES: Record<UnlockRank, UnlockRule> = {
  supporter: { windowMs: DAY_MS, exports: null, label: "ゴールドロゴ" },
  premium: { windowMs: 3 * DAY_MS, exports: 3, label: "プレミアムロゴ" },
  elite: { windowMs: 3 * DAY_MS, exports: 3, label: "パトロンロゴ" },
};

export function unlockDays(rank: UnlockRank): number {
  return Math.round(UNLOCK_RULES[rank].windowMs / DAY_MS);
}

/** Amount that unlocks each rank, used for the copy on the donation section. */
export const UNLOCK_THRESHOLDS: Record<UnlockRank, number> = {
  supporter: 50,
  premium: 300,
  elite: 10000,
};

