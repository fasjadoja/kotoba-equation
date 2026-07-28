import type { Metadata } from "next";
import LegalPage from "../LegalPage";

export const metadata: Metadata = { title: "プライバシーポリシー" };

const SECTIONS = [
  {
    title: "1. 入力内容の取り扱い",
    body: [
      "本サービスで入力したテキストおよび生成した画像は、すべて利用者のブラウザ内で処理され、運営者のサーバーに送信・保存されることはありません。",
    ],
  },
  {
    title: "2. ローカルストレージ",
    body: [
      "直近60件の作成履歴、入力中の内容（下書き）、および寄付後のサポーター特典の有効期限を、利用者のブラウザのローカルストレージに保存します。これらは利用者の端末内にのみ保存され、運営者が参照することはできません。「入力をリセット」やブラウザの設定からいつでも削除できます。",
    ],
  },
  {
    title: "3. アクセス解析",
    body: [
      "サービス改善のため、Vercel Analytics によるアクセス解析を利用しています。ページの表示回数・参照元・端末の種類などの統計情報のみを取得し、Cookieや個人を識別する情報は使用しません。入力したテキストや作成した画像が送信されることはありません。",
    ],
  },
  {
    title: "4. 外部サービス",
    body: [
      "寄付ページ（Stripe の決済ページ）およびXへの共有では、遷移先の各サービスのプライバシーポリシーが適用されます。決済はStripeが処理し、カード情報を運営者が取得することはありません。",
    ],
  },
];

export default function PrivacyPage() {
  return <LegalPage title="プライバシーポリシー" sections={SECTIONS} />;
}
