import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { SITE } from "@/lib/site";
import { LogoMark } from "@/components/Logo";
import { jpMonoFont, jpSansFont, monoFont, uiFont } from "@/lib/fonts";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "ことばの方程式｜思考を方程式の画像にする無料ツール",
    template: "%s｜ことばの方程式",
  },
  description:
    "「元気＝睡眠＋ごはん＋日光」「今日＞昨日」のようなことばの方程式を、ブラウザだけで画像にできる無料ツール。スマホ投稿の王道サイズ（4:5）を既定に、Instagram・X・TikTok（9:16）にも対応。登録不要でPNGを保存できます。",
  keywords: [
    "ことばの方程式",
    "思考式 ジェネレーター",
    "方程式 画像 作成",
    "図解 ジェネレーター",
    "X 画像 作成",
    "note アイキャッチ 作成",
    "フレームワーク 画像",
    "TikTok 縦画像 作成",
  ],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: SITE.url,
    siteName: "ことばの方程式",
    title: "ことばの方程式｜思考を方程式の画像にする無料ツール",
    description: "思っていることを1枚の方程式画像に。登録不要・無料。スマホ投稿向けのサイズを既定に用意。",
    images: [{ url: "/og.png", width: 1200, height: 675 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ことばの方程式｜思考を方程式の画像にする無料ツール",
    description: "思っていることを1枚の方程式画像に。登録不要・無料。",
    images: ["/og.png"],
  },
  alternates: { canonical: SITE.url },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F1F4F8",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ja"
      className={`${uiFont.variable} ${monoFont.variable} ${jpSansFont.variable} ${jpMonoFont.variable}`}
    >
      <body className="antialiased">
        {children}
        <footer className="mt-14 border-t border-line bg-panel/80 py-7 backdrop-blur">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-5 gap-y-2 px-4 text-[11px] text-faint">
            <span className="flex items-center gap-2 text-[11px] font-medium text-muted">
              <LogoMark width={26} />
              ことばの方程式
            </span>
            <Link href="/legal/terms" className="transition hover:text-fg">
              利用規約
            </Link>
            <Link href="/legal/privacy" className="transition hover:text-fg">
              プライバシー
            </Link>
            {SITE.donateUrl && (
              <a
                href={SITE.donateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-fg"
              >
                このサイトを応援する
              </a>
            )}
            <span className="ml-auto">
              © {new Date().getFullYear()} ことばの方程式
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
