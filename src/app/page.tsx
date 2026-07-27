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
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="sticky top-0 z-10 border-b border-line bg-ink/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="h-4 w-4 rounded-[3px] border border-edge bg-raised" aria-hidden />
            <span className="font-mono text-[12px] uppercase tracking-brand text-fg">
              formula<span className="text-faint">.studio</span>
            </span>
          </div>
          <h1 className="order-last w-full text-[11px] text-muted sm:order-none sm:w-auto">
            四則演算で、思考を1枚の画像に。無料・ログイン不要・広告なし。
          </h1>
          {SITE.donateUrl && (
            <a
              href={SITE.donateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-line bg-raised px-3 py-1.5 text-[11px] text-muted transition hover:border-edge hover:text-fg"
            >
              Buy me a coffee
            </a>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 py-4">
        <Editor />

        <section className="mt-16 rounded-lg border border-line bg-panel p-6">
          <h2 className="mb-5 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">FAQ</h2>
          <dl className="grid gap-6 sm:grid-cols-2">
            {FAQ.map((item) => (
              <div key={item.q}>
                <dt className="text-[13px] text-fg">{item.q}</dt>
                <dd className="mt-1.5 text-[13px] leading-relaxed text-muted">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        {SITE.donateUrl && (
          <section className="mt-4 rounded-lg border border-line bg-panel p-6">
            <p className="max-w-2xl text-[13px] leading-relaxed text-muted">
              このツールは無料で公開しています。広告も、ログインも、有料プランもありません。
              続けられるかどうかは、使ってくれた方の気持ち次第です。
            </p>
            <a
              href={SITE.donateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded-md border border-line bg-raised px-4 py-2 text-[12px] text-muted transition hover:border-edge hover:text-fg"
            >
              開発者にコーヒーをおごる
            </a>
          </section>
        )}
      </main>
    </div>
  );
}
