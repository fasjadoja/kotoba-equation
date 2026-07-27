import Editor from "@/components/Editor";
import { FREE_FEATURES, PRO_FEATURES, PRO_PRICE_LABEL } from "@/lib/plan";

const FAQ = [
  {
    q: "無料で使えますか？",
    a: "はい。方程式画像の作成とダウンロードは無料で無制限に行えます。無料版の画像には Formula Studio の透かしが入ります。",
  },
  {
    q: "作った画像を商用利用できますか？",
    a: "できます。生成した画像の著作権は利用者に帰属し、SNS投稿・note・スライド・広告など用途の制限はありません。",
  },
  {
    q: "Proは月額ですか？",
    a: `いいえ。${PRO_PRICE_LABEL}の買い切りです。購入後に発行されるライセンスキーを入力すると、透かし削除・全テーマ・全サイズ・2倍解像度が解放されます。`,
  },
  {
    q: "入力した内容はサーバーに送信されますか？",
    a: "送信されません。画像はすべてブラウザ内（Canvas）で生成しており、テキストや画像がサーバーに保存されることはありません。",
  },
];

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Formula Studio",
    applicationCategory: "DesignApplication",
    operatingSystem: "Web",
    description:
      "四則演算の「思考の方程式」画像をブラウザだけで作成できるジェネレーター。X・Instagram向けの高画質PNGを無料で書き出せます。",
    offers: [
      { "@type": "Offer", price: "0", priceCurrency: "JPY", name: "Free" },
      {
        "@type": "Offer",
        price: String(PRO_PRICE_LABEL.replace(/[^\d]/g, "")),
        priceCurrency: "JPY",
        name: "Pro（買い切り）",
      },
    ],
    mainEntity: {
      "@type": "FAQPage",
      mainEntity: FAQ.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-6xl px-4 pt-12">
        <header className="mb-10 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white shadow-lg shadow-blue-600/20">
            ×
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            思考の方程式を、そのまま画像に。
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            「成果 ＝ 能力 × 熱量 × 考え方」——バズる四則演算フレームワーク画像を数十秒で作成。登録不要・無料。
          </p>
        </header>

        <Editor />

        <section className="mt-20" id="features">
          <h2 className="text-center text-xl font-bold">なぜ方程式画像は伸びるのか</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                title: "一目で理解できる",
                body: "長い文章より、掛け算1本のほうが速く伝わる。タイムラインで指を止めさせます。",
              },
              {
                title: "保存・引用されやすい",
                body: "「考え方の型」は保存され、引用RTで二次拡散します。フォロワー獲得の起点になります。",
              },
              {
                title: "アカウント名が残る",
                body: "画像内にクレジットを入れられるので、拡散されるほど発信者の名前が広がります。",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="mb-1.5 font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20" id="pricing">
          <h2 className="text-center text-xl font-bold">料金</h2>
          <p className="mt-1 text-center text-sm text-slate-500">
            まずは無料で。物足りなくなったら買い切りのProへ。
          </p>
          <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold">Free</h3>
              <p className="mt-1 text-3xl font-bold">¥0</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {FREE_FEATURES.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span className="text-slate-400">・</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-blue-600 bg-white p-6 shadow-lg shadow-blue-600/10">
              <h3 className="font-semibold text-blue-700">Pro（買い切り）</h3>
              <p className="mt-1 text-3xl font-bold">{PRO_PRICE_LABEL}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                {PRO_FEATURES.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span className="text-emerald-500">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-20 max-w-3xl" id="faq">
          <h2 className="text-center text-xl font-bold">よくある質問</h2>
          <div className="mt-8 space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="rounded-xl border border-slate-200 bg-white p-5 [&_summary]:cursor-pointer"
              >
                <summary className="font-medium text-slate-900">{item.q}</summary>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
