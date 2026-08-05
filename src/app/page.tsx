import Link from "next/link";
import Editor from "@/components/Editor";
import Reveal from "@/components/Reveal";
import SiteHeader from "@/components/SiteHeader";
import { donateButtonClass } from "@/components/DonateButton";
import { BoltIcon, FreeIcon, ShieldIcon } from "@/components/icons";
import {
  DONATE_ANCHOR,
  DONATE_CUSTOM_URL,
  DONATE_ENABLED,
  DONATE_LARGE,
  DONATE_MAX,
  DONATE_MIN,
  DONATE_STEP,
  DONATE_SUGGESTED,
  DONATE_TIERS,
  SITE,
  SOCIAL,
} from "@/lib/site";
import { galleryEnabled } from "@/lib/gallery";

const POINTS = [
  {
    icon: <BoltIcon size={17} />,
    title: "入力するとすぐ反映",
    body: "打ち込んだそばからプレビューが変わります。書き出しはワンタップ。",
  },
  {
    icon: <ShieldIcon size={17} />,
    title: "入力はこの端末だけ",
    body: galleryEnabled
      ? "画像の生成も履歴もブラウザ内で完結。自分で「みんなの式に載せる」を押さない限り、どこにも送られません。"
      : "画像の生成も履歴もブラウザ内で完結。入力した内容はどこにも送られません。",
  },
  {
    icon: <FreeIcon size={17} />,
    title: "無料・商用OK",
    body: "回数制限も透かしの強制もなし。SNSでも資料でも自由に使えます。",
  },
];

const STEPS = [
  {
    title: "ことばを入れる",
    body: "結果と、その理由になることばを入れるだけ。テンプレートから選んでも作れます。",
  },
  {
    title: "見た目をととのえる",
    body: "記号・書体・配色・サイズを選ぶと、プレビューがその場で変わります。",
  },
  {
    title: "保存して投稿する",
    body: "PNGで保存するか画像をコピーして、X・Instagram・note・TikTokにそのまま投稿できます。",
  },
];

const USES = [
  "考えていることを1枚にまとめて投稿したいとき",
  "note やブログの見出し画像がほしいとき",
  "自己紹介やプロフィール用に、自分を表す式を作りたいとき",
  "スライドや資料に、要点を1枚で示す図を入れたいとき",
];

const FAQ = [
  {
    q: "無料で使えますか？",
    a: "はい。すべての機能を無料で、回数制限なく使えます。広告も登録もありません。気に入った方の任意のチップだけで運営しています。",
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
    q: "なぜ「数式」ではなく「方程式」なのですか？",
    a: "数学の言葉では、未知数を解く式が「方程式」で、ここで作るのはどちらかというと「数式」に近いものです。ただ日本語の「成功の方程式」のように、方程式には“物事の成り立ちを表す式”という意味が定着しているため、この名前にしています。",
  },
  {
    q: "テンプレートは変わりますか？",
    a: "「今日のテンプレート」は1日に1回入れ替わります。「別のテンプレを見る」を押せば、その場でまだ見ていない候補に切り替わります。",
  },
  {
    q: "作りたい式をことばから探せますか？",
    a: "「式をさがす」に気になることばを入れると、テンプレートとこの端末の履歴からまとめて候補が出ます。ひらがな・カタカナ・漢字の違いや、1文字くらいの打ち間違いは自動で吸収します。",
  },
  {
    q: "入力した内容はサーバーに送られますか？",
    a: galleryEnabled
      ? "「画像を書き出す」の「みんなの式に載せる」を押したときだけ、その式のことばが保存・公開されます。それ以外は送られず、画像の生成も履歴の保存もブラウザ内で完結します。"
      : "送られません。画像の生成も履歴の保存もブラウザ内で完結します。入力した文字がサーバーに保存されることはありません。",
  },
  ...(galleryEnabled
    ? [
        {
          q: "ほかの人の式は見られますか？",
          a: "入力欄の下の「みんなの式」に、公開された式が並びます。読みやすさを自動で採点して、埋め字のような式やリンク・連絡先を含むものは表示しません。クリックすると自分の下書きとして読み込めます。",
        },
      ]
    : []),
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
        publisher: { "@id": `${SITE.url}/#brand` },
      },
      {
        "@type": "Brand",
        "@id": `${SITE.url}/#brand`,
        name: SITE.name,
        alternateName: ["言葉の方程式", "Kotoba Equation"],
        url: SITE.url,
        logo: `${SITE.url}/icon.svg`,
        ...(SOCIAL.tiktok ? { sameAs: [SOCIAL.tiktok] } : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE.url}/#website`,
        name: SITE.name,
        alternateName: "言葉の方程式",
        url: SITE.url,
        inLanguage: "ja",
        publisher: { "@id": `${SITE.url}/#brand` },
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

      <main className="mx-auto max-w-[1120px] px-4 pb-10 sm:px-6">
        {/* Apple-style opening: one big line, one grey line, then the tool. */}
        <div className="pb-8 pt-10 text-center sm:pb-12 sm:pt-16">
          {/* The brand name carries the h1 so a search for it lands here. */}
          <h1 className="text-[34px] font-semibold leading-[1.1] text-fg sm:text-[52px]">
            ことばの方程式
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[17px] font-medium leading-relaxed text-muted sm:mt-4 sm:text-[21px]">
            思っていることを、1枚の画像に。
          </p>
          <p className="mx-auto mt-2.5 max-w-xl text-balance text-[14px] leading-relaxed text-muted sm:text-[15px]">
            「元気＝睡眠＋ごはん＋日光」のような式も、「今日＞昨日」のような比較も。登録不要・無料・広告なしで、そのままXやInstagramに投稿できます。
          </p>
        </div>

        <Editor />

        {/* Three quiet lines instead of a boxed feature grid. */}
        <ul className="mx-auto mt-16 grid max-w-4xl gap-8 text-center sm:grid-cols-3 sm:gap-10">
          {POINTS.map((point) => (
            <li key={point.title} className="flex flex-col items-center gap-2">
              <span className="text-accent" aria-hidden>
                {point.icon}
              </span>
              <span className="text-[15px] font-semibold text-fg">{point.title}</span>
              <span className="max-w-xs text-[13px] leading-relaxed text-muted">
                {point.body}
              </span>
            </li>
          ))}
        </ul>

        <Reveal className="mt-16">
          <section className="rounded-card bg-panel p-7 shadow-card sm:p-10">
            <h2 className="text-[24px] font-semibold text-fg sm:text-[28px]">
              ことばの方程式とは
            </h2>
            <p className="mt-3 max-w-3xl text-[15px] leading-[1.8] text-muted">
              「ことばの方程式」は、思っていることを「元気＝睡眠＋ごはん＋日光」のような式や「今日＞昨日」のような比較のかたちにして、SNSにそのまま投稿できる画像にする無料のツールです。登録も、アプリのインストールも、料金もいりません。画像づくりはすべてブラウザの中で行われ、入力したことばはこの端末から出ません。
            </p>
            <h3 className="mt-9 text-[17px] font-semibold text-fg">使い方</h3>
            <ol className="mt-3 grid gap-3 text-[14px] leading-relaxed text-muted sm:grid-cols-3">
              {STEPS.map((step, index) => (
                <li key={step.title} className="rounded-2xl bg-raised px-5 py-4">
                  <span className="block text-[15px] font-semibold text-fg">
                    <span className="mr-1.5 text-accent">{index + 1}</span>
                    {step.title}
                  </span>
                  <span className="mt-1.5 block text-[13px] leading-relaxed">{step.body}</span>
                </li>
              ))}
            </ol>
            <h3 className="mt-9 text-[17px] font-semibold text-fg">こんなときに</h3>
            <ul className="mt-3 grid gap-2 text-[15px] leading-relaxed text-muted sm:grid-cols-2">
              {USES.map((use) => (
                <li key={use} className="flex gap-2">
                  <span className="text-accent" aria-hidden>
                    ・
                  </span>
                  <span>{use}</span>
                </li>
              ))}
            </ul>
            <p className="mt-7 text-[14px] text-muted">
              <Link href="/about" className="font-medium text-accent transition hover:underline">
                名前の由来と運営の方針 →
              </Link>
            </p>
          </section>
        </Reveal>

        <Reveal className="mt-5">
          {/* Folded away by default: the answers are for the few who look for
              them, and the donation section should stay within reach. */}
          <details className="group rounded-card bg-panel shadow-card">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-7 py-5 sm:px-10">
              <h2 className="text-[24px] font-semibold text-fg sm:text-[28px]">よくある質問</h2>
              <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted transition group-hover:text-accent">
                <span className="group-open:hidden">ひらく</span>
                <span className="hidden group-open:inline">とじる</span>
                <span className="transition-transform group-open:rotate-180" aria-hidden>
                  ▼
                </span>
              </span>
            </summary>
            <dl className="grid gap-7 border-t border-line px-7 py-7 sm:grid-cols-2 sm:px-10">
              {FAQ.map((item) => (
                <div key={item.q}>
                  <dt className="text-[15px] font-semibold text-fg">{item.q}</dt>
                  <dd className="mt-2 text-[14px] leading-[1.8] text-muted">{item.a}</dd>
                </div>
              ))}
            </dl>
          </details>
        </Reveal>

        {DONATE_ENABLED && (
          <Reveal className="mt-5" delay={80}>
          <section
            id={DONATE_ANCHOR}
            className="scroll-mt-20 rounded-card bg-panel p-7 shadow-card sm:p-10"
          >
            <h2 className="text-[24px] font-semibold text-fg sm:text-[28px]">
              このサイトにチップを送る
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-[1.8] text-muted">
              広告も、ログインも、有料プランもありません。運営費はチップだけでまかなっています（1回限り・見返りの商品はありません）。金額を選んでください。
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
              {DONATE_TIERS.map((tier) => (
                <a
                  key={tier.amount}
                  href={tier.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    tier.amount === DONATE_SUGGESTED
                      ? `${donateButtonClass} flex-col gap-0.5 px-5 py-3`
                      : "inline-flex flex-col items-center justify-center gap-0.5 rounded-full bg-raised px-5 py-3 font-semibold text-fg transition hover:bg-coffee/25"
                  }
                >
                  <span className="text-[16px]">
                    {tier.amount.toLocaleString("ja-JP")}円
                    {tier.amount === DONATE_SUGGESTED && (
                      <span className="ml-1.5 text-[11px] font-medium">おすすめ</span>
                    )}
                  </span>
                  <span className="text-[12px] font-normal opacity-80">{tier.note}</span>
                </a>
              ))}
            </div>
            {DONATE_CUSTOM_URL && (
              <a
                href={DONATE_CUSTOM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 inline-flex w-full items-center justify-center rounded-full border border-dashed border-control px-5 py-3 text-[14px] font-semibold text-fg transition hover:border-coffeeDark hover:bg-coffee/15 sm:w-auto"
              >
                自分で金額を決める（{DONATE_MIN}円〜{DONATE_MAX.toLocaleString("ja-JP")}円）
              </a>
            )}
            {DONATE_CUSTOM_URL && (
              <p className="mt-2.5 text-[12px] leading-relaxed text-muted">
                金額はStripeの決済ページで、{DONATE_STEP}円の個数を変えて決められます（例：個数20で{(DONATE_STEP * 20).toLocaleString("ja-JP")}円）。
                {" "}
                <a
                  href={DONATE_LARGE.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 transition hover:text-fg"
                >
                  {DONATE_LARGE.amount.toLocaleString("ja-JP")}円で支える
                </a>
                こともできます。
              </p>
            )}
            <p className="mt-3 text-[12px] leading-relaxed text-muted">
              決済はStripeのページで行われ、カード番号はこのサイトには届きません。チップは任意で、送らなくてもすべての機能を制限なく使えます。
            </p>
          </section>
          </Reveal>
        )}
      </main>
    </div>
  );
}
