import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "利用規約" };

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "第1条（適用）",
    body: [
      `本規約は、${SITE.operator}（以下「当方」）が提供する ${SITE.name}（以下「本サービス」）の利用条件を定めるものです。利用者は本サービスを利用した時点で本規約に同意したものとみなします。`,
    ],
  },
  {
    title: "第2条（生成物の権利）",
    body: [
      "利用者が本サービスで生成した画像の権利は利用者に帰属します。SNS投稿・記事・スライド・商用利用を含め、用途の制限はありません。",
      "ただし、第三者の権利を侵害する内容、公序良俗に反する内容の作成・公開は禁止します。",
    ],
  },
  {
    title: "第3条（Proライセンス）",
    body: [
      "Proライセンスは買い切り型で、購入者本人による利用に限り許諾されます。ライセンスキーの再配布・販売は禁止します。",
      "不正利用が確認された場合、当方は当該ライセンスを無効化することがあります。",
    ],
  },
  {
    title: "第4条（免責事項）",
    body: [
      "本サービスは現状有姿で提供され、特定目的への適合性・完全性・可用性を保証しません。",
      "本サービスの利用または利用不能により生じた損害について、当方は責任を負いません。",
    ],
  },
  {
    title: "第5条（サービスの変更・終了）",
    body: [
      "当方は、利用者への事前通知なく本サービスの内容を変更、または提供を終了することがあります。",
    ],
  },
  {
    title: "第6条（準拠法・管轄）",
    body: ["本規約は日本法に準拠し、紛争が生じた場合は当方所在地を管轄する裁判所を専属的合意管轄とします。"],
  },
];

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-2xl font-bold">利用規約</h1>
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
