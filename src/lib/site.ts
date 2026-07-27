export const SITE = {
  name: "Formula Studio",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** Buy Me a Coffee / OFUSE などの投げ銭ページ。未設定なら寄付リンクは非表示。 */
  donateUrl: process.env.NEXT_PUBLIC_DONATE_URL ?? "",
  contactUrl: process.env.NEXT_PUBLIC_CONTACT_URL ?? "",
};

export const SHARE_HASHTAGS = ["思考式ジェネレーター"];
