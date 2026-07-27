import type { Metadata } from "next";
import LegalPage from "../LegalPage";

export const metadata: Metadata = { title: "プライバシーポリシー" };

const SECTIONS = [
  {
    title: "1. 入力内容の取り扱い",
    body: [
      "本サービスで入力したテキストおよび生成した画像は、すべて利用者のブラウザ内で処理されます。運営者のサーバーに送信・保存されることはありません。",
    ],
  },
  {
    title: "2. ローカルストレージ",
    body: [
      "直近5件の作成履歴を、利用者のブラウザのローカルストレージに保存します。これは利用者の端末内にのみ保存され、運営者が参照することはできません。ブラウザの設定からいつでも削除できます。",
    ],
  },
  {
    title: "3. アクセス解析",
    body: [
      "サービス改善のためアクセス解析ツールを利用する場合があります。取得する情報は個人を特定しない統計情報に限られます。",
    ],
  },
  {
    title: "4. 外部サービス",
    body: [
      "寄付ページ（Buy Me a Coffee 等）およびXへの共有では、遷移先の各サービスのプライバシーポリシーが適用されます。決済情報を運営者が取得することはありません。",
    ],
  },
];

export default function PrivacyPage() {
  return <LegalPage title="プライバシーポリシー" sections={SECTIONS} />;
}
