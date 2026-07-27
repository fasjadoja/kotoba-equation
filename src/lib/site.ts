export const SITE = {
  name: "ことばの方程式",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://kotoba-equation.vercel.app",
  /** Buy Me a Coffee / OFUSE などの投げ銭ページ。未設定なら寄付リンクは非表示。 */
  donateUrl: process.env.NEXT_PUBLIC_DONATE_URL ?? "https://buymeacoffee.com/yu19sfvga",
  contactUrl: process.env.NEXT_PUBLIC_CONTACT_URL ?? "",
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

