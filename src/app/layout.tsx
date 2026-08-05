import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { DONATE_ANCHOR, DONATE_ENABLED, SITE, SOCIAL } from "@/lib/site";
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
  // Set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION to the token Search Console gives
  // for the "HTML tag" method; without it no meta tag is emitted.
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? {
        verification: {
          google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        },
      }
    : {}),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F5F5F7",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ja"
      className={`${uiFont.variable} ${monoFont.variable} ${jpSansFont.variable} ${jpMonoFont.variable}`}
    >
      <body className="antialiased">
        {children}
        <footer className="mt-16 border-t border-line py-8">
          <div className="mx-auto flex max-w-[1120px] flex-wrap items-center gap-x-6 gap-y-3 px-4 text-[12px] text-faint sm:px-6">
            <span className="flex items-center gap-2 text-[12px] font-medium text-muted">
              <LogoMark width={26} />
              ことばの方程式
            </span>
            <Link href="/about" className="transition hover:text-fg">
              このサイトについて
            </Link>
            <Link href="/legal/terms" className="transition hover:text-fg">
              利用規約
            </Link>
            <Link href="/legal/privacy" className="transition hover:text-fg">
              プライバシー
            </Link>
            {SOCIAL.tiktok && (
              <a
                href={SOCIAL.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-fg"
              >
                TikTok
              </a>
            )}
            {DONATE_ENABLED && (
              <a href={`/#${DONATE_ANCHOR}`} className="transition hover:text-fg">
                チップを送る
              </a>
            )}
            <span className="ml-auto">
              © {new Date().getFullYear()} ことばの方程式
            </span>
          </div>
        </footer>
        {/* Page counts only: no cookies and no per-visitor identifier, so the
            privacy page stays accurate. */}
        <Analytics />
      </body>
    </html>
  );
}
