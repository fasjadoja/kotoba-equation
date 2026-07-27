import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "プライバシーポリシー" };

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "取得する情報",
    body: [
      "本サービスで入力したテキストや生成した画像は、すべて利用者のブラウザ内で処理され、当方のサーバーに送信・保存されることはありません。",
      "Proライセンスの購入時には、決済代行事業者である Stripe がメールアドレス・決済情報を取得します。当方はカード情報を保持しません。",
    ],
  },
  {
    title: "アクセス解析・広告",
    body: [
      "本サービスでは、サービス改善のためアクセス解析ツールを利用する場合があります。これらは Cookie を使用して匿名の利用状況を収集します。",
      "第三者配信の広告サービス（Google AdSense 等）を利用する場合、Cookie を用いて利用者の興味に応じた広告が配信されることがあります。ブラウザ設定により Cookie を無効化できます。",
    ],
  },
  {
    title: "第三者提供",
    body: ["法令に基づく場合を除き、取得した情報を第三者に提供することはありません。"],
  },
  {
    title: "お問い合わせ",
    body: [`本ポリシーに関するお問い合わせは ${SITE.email} までご連絡ください。`],
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-2xl font-bold">プライバシーポリシー</h1>
      <div className="mt-8 space-y-8">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="font-semibold text-slate-900">{section.title}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="mt-2 text-sm leading-relaxed text-slate-600">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}
