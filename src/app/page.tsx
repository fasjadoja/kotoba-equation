import Editor from "@/components/Editor";
import { SITE } from "@/lib/site";

const FAQ = [
  {
    q: "無料で使えますか？",
    a: "はい。すべての機能を無料で、回数制限なく使えます。気に入ったら開発者にコーヒーを1杯おごってください。",
  },
  {
    q: "作った画像は商用利用できますか？",
    a: "できます。X・note・ブログ・資料など、用途の制限はありません。著作は作った方のものです。クレジットや © 表記も画像に入れられます。",
  },
  {
    q: "TikTokやリールにも使えますか？",
    a: "使えます。9:16（1080×1920）と4:5（1080×1350）の縦サイズに対応しています。",
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
          "四則演算で思考を表す方程式画像を無料で作成できるジェネレーター。X・note・TikTok向けのサイズに対応。",
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
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-8 sm:px-8 sm:pt-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6 sm:mb-14">
        <div>
          <p className="text-[13px] uppercase tracking-brand text-ink">FORMULA</p>
          <p className="mt-1 text-[13px] uppercase tracking-brand text-faint">STUDIO</p>
        </div>
        <div className="flex items-end gap-6">
          <h1 className="max-w-xs text-[11px] leading-relaxed text-muted">
            四則演算で、思考を1枚の画像に。
            <br />
            無料・ログイン不要・広告なし。
          </h1>
          {SITE.donateUrl && (
            <a
              href={SITE.donateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 border-b border-line pb-1 text-[11px] tracking-[0.1em] text-muted transition hover:border-ink hover:text-ink"
            >
              Buy me a coffee
            </a>
          )}
        </div>
      </header>

      <Editor />

      <section className="mt-24 border-t border-line pt-10">
        <h2 className="mb-6 text-[10px] uppercase tracking-[0.28em] text-faint">FAQ</h2>
        <dl className="grid max-w-4xl gap-6 sm:grid-cols-2">
          {FAQ.map((item) => (
            <div key={item.q}>
              <dt className="text-[13px] text-ink">{item.q}</dt>
              <dd className="mt-1.5 text-[13px] leading-relaxed text-muted">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {SITE.donateUrl && (
        <section className="mt-14 max-w-2xl border-t border-line pt-10">
          <p className="text-[13px] leading-relaxed text-muted">
            このツールは無料で公開しています。広告も、ログインも、有料プランもありません。
            続けられるかどうかは、使ってくれた方の気持ち次第です。
          </p>
          <a
            href={SITE.donateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-block border border-ink px-5 py-2.5 text-[12px] tracking-[0.1em] text-ink transition hover:bg-ink hover:text-paper"
          >
            開発者にコーヒーをおごる
          </a>
        </section>
      )}
    </div>
  );
}
