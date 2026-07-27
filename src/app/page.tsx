import Editor from "@/components/Editor";
import { SITE } from "@/lib/site";

const FAQ = [
  {
    q: "無料で使えますか？",
    a: "はい。すべての機能を無料で、回数制限なく使えます。気に入ったら開発者にコーヒーを1杯おごってください。",
  },
  {
    q: "作った画像は商用利用できますか？",
    a: "できます。X・note・ブログ・資料など、用途の制限はありません。クレジット表記も任意です。",
  },
  {
    q: "入力した内容はサーバーに送られますか？",
    a: "送られません。画像の生成も履歴の保存もすべてブラウザ内で完結します。",
  },
];

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: SITE.name,
        url: SITE.url,
        applicationCategory: "DesignApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
        description:
          "四則演算で思考を表す方程式画像を無料で作成できるジェネレーター。X・note向けのサイズに対応。",
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="mb-10 flex items-baseline justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-tight text-neutral-900">formula.studio</p>
          <h1 className="mt-1 text-xs text-neutral-400">
            四則演算で思考を1枚の画像にする、無料のジェネレーター
          </h1>
        </div>
        {SITE.donateUrl && (
          <a
            href={SITE.donateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 border border-neutral-200 px-3 py-1.5 text-xs text-neutral-500 transition hover:border-neutral-900 hover:text-neutral-900"
          >
            ☕ コーヒーをおごる
          </a>
        )}
      </header>

      <Editor />

      <section className="mt-24 border-t border-neutral-100 pt-10">
        <h2 className="mb-6 text-[11px] uppercase tracking-[0.18em] text-neutral-400">FAQ</h2>
        <dl className="max-w-2xl space-y-5">
          {FAQ.map((item) => (
            <div key={item.q}>
              <dt className="text-sm text-neutral-900">{item.q}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-neutral-500">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {SITE.donateUrl && (
        <section className="mt-16 max-w-2xl border-t border-neutral-100 pt-10">
          <p className="text-sm leading-relaxed text-neutral-500">
            このツールは無料で公開しています。広告も、ログインも、有料プランもありません。
            続けられるかどうかは、使ってくれた方の気持ち次第です。
          </p>
          <a
            href={SITE.donateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block border border-neutral-900 px-4 py-2 text-sm text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
          >
            ☕ 開発者にコーヒーをおごる
          </a>
        </section>
      )}
    </div>
  );
}
