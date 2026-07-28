import Editor from "@/components/Editor";
import Reveal from "@/components/Reveal";
import SiteHeader from "@/components/SiteHeader";
import { CoffeeIcon, donateButtonClass } from "@/components/DonateButton";
import { SITE } from "@/lib/site";

const FAQ = [
  {
    q: "無料で使えますか？",
    a: "はい。すべての機能を無料で、回数制限なく使えます。広告も登録もありません。気に入った方の任意の応援（500円）だけで運営しています。",
  },
  {
    q: "作った画像は商用利用できますか？",
    a: "できます。X・note・ブログ・資料など、用途の制限はありません。著作は作った方のものです。クレジットや © 表記も画像に入れられます。",
  },
  {
    q: "＝以外の記号は使えますか？",
    a: "使えます。＞ ＜ ≧ ≦ ≠ ≒ → から選べるので、「今日＞昨日」のような比較も作れます。好きな記号を1文字だけ直接入力することもできます。",
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
    q: "どのサイズで作ればいいですか？",
    a: "迷ったら既定の 4:5（1080×1350）のままで OK です。スマホのタイムラインで大きく表示され、X でも Instagram でもそのまま使えます。ストーリーや TikTok なら 9:16、ブログなら 16:9 にあとから変えられます。",
  },
  {
    q: "テンプレートは変わりますか？",
    a: "「今日のテンプレート」は1日に1回入れ替わります。過去の分も含めて、「すべてのテンプレート」からいつでも選べます。",
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
          "「元気＝睡眠＋ごはん＋日光」「今日＞昨日」のようなことばの方程式を無料で画像にできるツール。スマホ投稿向けの 4:5 を既定に、Instagram・X・TikTok にも対応。",
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
                className="absolute inset-x-0 bottom-0.5 -z-10 h-2.5 rounded-sm bg-gradient-to-r from-[#74B2FF]/30 to-[#8C65FF]/30"
                aria-hidden
              />
            </span>
            にする。
          </h1>
          <p className="mx-auto mt-2.5 max-w-2xl text-[13px] leading-relaxed text-muted">
            「元気＝睡眠＋ごはん＋日光」のような式も、「今日＞昨日」のような比較も、スマホに合うサイズの1枚に。
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
          <section className="flex flex-col gap-5 rounded-2xl border border-line bg-panel p-6 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <h2 className="text-[15px] font-semibold text-fg">このサイトを応援する</h2>
              <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-muted">
                広告も、ログインも、有料プランもありません。続けられるかどうかは、使ってくれた方の気持ち次第です（500円・1回限り）。
              </p>
            </div>
            <a
              href={SITE.donateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${donateButtonClass} shrink-0 px-6 py-3.5 text-[14px]`}
            >
              <CoffeeIcon size={17} />
              500円で応援する
            </a>
          </section>
          </Reveal>
        )}
      </main>
    </div>
  );
}
