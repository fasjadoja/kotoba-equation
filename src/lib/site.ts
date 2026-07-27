/**
 * 特定商取引法に基づく表記・問い合わせ先。
 * 本番公開前に環境変数（もしくはこの既定値）を実際の情報に置き換えてください。
 */
export const SITE = {
  name: "Formula Studio",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  operator: process.env.NEXT_PUBLIC_OPERATOR_NAME ?? "（運営者名を設定してください）",
  address: process.env.NEXT_PUBLIC_OPERATOR_ADDRESS ?? "（住所を設定してください）",
  phone: process.env.NEXT_PUBLIC_OPERATOR_PHONE ?? "（電話番号を設定してください）",
  email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@example.com",
};
