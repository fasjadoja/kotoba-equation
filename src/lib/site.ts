export const SITE = {
  name: "ことばの方程式",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://kotoba-equation.vercel.app",
  /** Stripe Payment Link などの寄付ページ。未設定なら寄付リンクは非表示。 */
  donateUrl:
    process.env.NEXT_PUBLIC_DONATE_URL ??
    "https://donate.stripe.com/dRm14o0cb0y92TQ9ones000?locale=ja",
  contactUrl: process.env.NEXT_PUBLIC_CONTACT_URL ?? "",
};

/** Official accounts. Listed in the page's JSON-LD so search engines can tell
 *  this brand apart from look-alike sites. */
export const SOCIAL = {
  tiktok: process.env.NEXT_PUBLIC_TIKTOK_URL ?? "",
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

