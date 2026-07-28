import type { Metadata } from "next";
import Link from "next/link";
import { donateButtonClass } from "@/components/DonateButton";
import { LogoMark } from "@/components/Logo";
import { DONATE_ANCHOR, DONATE_ENABLED, SITE, SOCIAL } from "@/lib/site";

export const metadata: Metadata = {
  title: "このサイトについて",
  description:
    "「ことばの方程式」は、思いついたことばを1枚の画像にするために個人で作った無料のツールです。名前の由来、運営の方針、作り手について。",
  alternates: { canonical: `${SITE.url}/about` },
};

const SECTIONS = [
  {
    title: "何をするサイトか",
    body: [
      "「元気＝睡眠＋ごはん＋日光」「今日＞昨日」のように、頭の中にあることばの関係を1枚の画像にするツールです。書き出した画像は X・Instagram・note・TikTok・資料など、どこで使っても構いません。",
      "登録もログインも要りません。入力した内容は端末の中だけで処理され、サーバーには送られません。",
    ],
  },
  {
    title: "名前について",
    body: [
      "数学の言葉としては、未知数を解くものが「方程式」、値を並べたものが「数式」です。このサイトが作るのは後者に近いのですが、日本語の「成功の方程式」「幸せの方程式」のように、方程式には“物事の成り立ちを表す式”という意味が定着しています。ことばの関係を書き出すという目的にはこちらの語感が合うため、「ことばの方程式」を名前にしています。",
    ],
  },
  {
    title: "運営の方針",
    body: [
      "広告を貼らず、有料プランも作らず、機能を制限しません。運営費はサーバー代とドメイン代くらいなので、任意のチップ（50円〜・1回限り）だけでまかなっています。",
      "使ってくれた方の入力を広告やAIの学習に売ることはしません。運営が続けられなくなった場合は、事前に告知したうえで終了します。",
    ],
  },
  {
    title: "作り手",
    body: [
      "個人でつくって、個人で運営しています。要望や不具合の報告はSNSからいただければ、できる範囲で反映します。テンプレートも少しずつ増やしています。",
    ],
  },
  {
    title: "名前とロゴについて",
    body: [
      "サービス名「ことばの方程式」、ロゴ、画面デザイン、テンプレートの文言は運営者に帰属します。生成した画像はご自由にお使いいただけますが、同じ名前・ロゴ・デザインを使った別のサービスを作ることはご遠慮ください。",
    ],
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 pb-24 pt-8 sm:px-8 sm:pt-12">
      <Link
        href="/"
        className="text-[12px] font-medium text-accent transition hover:underline"
      >
        ← ことばの方程式
      </Link>

      <div className="mt-10 flex items-center gap-3 border-b border-line pb-5">
        <LogoMark width={34} />
        <h1 className="text-base text-fg">このサイトについて</h1>
      </div>

      <div className="mt-8 space-y-8">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-[13px] text-fg">{section.title}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="mt-2 text-[13px] leading-relaxed text-muted">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-6">
        {DONATE_ENABLED && (
          <a
            href={`/#${DONATE_ANCHOR}`}
            className={`${donateButtonClass} px-4 py-2 text-[12px]`}
          >
            チップを送る
          </a>
        )}
        {SOCIAL.tiktok && (
          <a
            href={SOCIAL.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] font-medium text-muted transition hover:text-accent"
          >
            TikTok
          </a>
        )}
      </div>
    </div>
  );
}
