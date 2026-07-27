import Editor from "@/components/Editor";
import Reveal from "@/components/Reveal";
import SiteHeader from "@/components/SiteHeader";
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
    q: "＝以外の記号は使えますか？",
    a: "使えます。＞ ＜ ≧ ≦ ≠ ≒ → から選べるので、「思い出＞お金」のような価値観の比較も作れます。好きな記号を1文字だけ直接入力することもできます。",
  },
  {
    q: "「1＜2」のような短い式もきれいに作れますか？",
    a: "作れます。レイアウトを「自動」にしておくと、短い式は横一列（1 ＜ 2）で、要素の多い式は上下に分けて配置されます。「横1行」「上下」に固定することもできます。",
  },
  {
    q: "ハッシュタグや長めの補足も入れられますか？",
    a: "入れられます。補足は140文字まで、ハッシュタグは画像の左下に入ります。どちらも自動で折り返し・縮小されるのでレイアウトは崩れません。",
  },
  {
    q: "TikTokやリールにも使えますか？",
    a: "使えます。9:16（1080×1920）と4:5（1080×1350）の縦サイズに対応しています。",
  },
  {
    q: "入力した内容はサーバーに送られますか？",
    a: "送られません。画像の生成も履歴の保存もブラウザ内で完結します。例外は「みんなの作品に載せる」にチェックしたときだけで、その場合に限り式の文字が公開ギャラリーに保存されます。",
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
          "「暑さ＝気温×湿度」「思い出＞お金」のようなことばの方程式を無料で画像にできるツール。X・note・TikTok向けのサイズに対応。",
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

      <SiteHeader />

      <main className="mx-auto max-w-[1400px] px-4 pb-6 pt-2">
        <div className="mb-7 text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-panel/70 px-3 py-1 text-[11px] font-medium text-muted shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
            登録不要・無料・広告なし
          </p>
          <h1 className="mt-3 text-[24px] font-semibold tracking-tight text-fg sm:text-[32px]">
            思っていることを、
            <span className="relative whitespace-nowrap">
              方程式
              <span
                className="absolute inset-x-0 bottom-0.5 -z-10 h-2.5 rounded-sm bg-accent/15"
                aria-hidden
              />
            </span>
            にする。
          </h1>
          <p className="mx-auto mt-2.5 max-w-2xl text-[13px] leading-relaxed text-muted">
            「暑さ＝気温×湿度」のような式も、「思い出＞お金」のような比較も、1枚の画像に。
          </p>
        </div>

        <Editor />

        <Reveal className="mt-16">
          <section className="rounded-2xl border border-line bg-panel p-6 shadow-card sm:p-8">
            <h2 className="mb-5 text-[15px] font-semibold text-fg">よくある質問</h2>
            <dl className="grid gap-6 sm:grid-cols-2">
              {FAQ.map((item) => (
                <div key={item.q}>
                  <dt className="text-[13px] font-medium text-fg">{item.q}</dt>
                  <dd className="mt-1.5 text-[13px] leading-relaxed text-muted">{item.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        </Reveal>

        {SITE.donateUrl && (
          <Reveal className="mt-4" delay={80}>
          <section className="rounded-2xl border border-line bg-panel p-6 shadow-card sm:p-8">
            <p className="max-w-2xl text-[13px] leading-relaxed text-muted">
              このツールは無料で公開しています。広告も、ログインも、有料プランもありません。
              続けられるかどうかは、使ってくれた方の気持ち次第です。
            </p>
            <a
              href={SITE.donateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-coffee px-4 py-2.5 text-[13px] font-semibold text-[#3B2A12] shadow-[0_2px_10px_rgba(255,169,43,0.35)] transition hover:brightness-105 active:translate-y-px"
            >
              <span aria-hidden>☕</span>
              開発者にコーヒーをおごる
            </a>
          </section>
          </Reveal>
        )}
      </main>
    </div>
  );
}
