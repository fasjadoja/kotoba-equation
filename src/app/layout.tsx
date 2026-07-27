import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { SITE } from "@/lib/site";
import { jpMonoFont, jpSansFont, monoFont, uiFont } from "@/lib/fonts";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "formula.studio｜思考式・方程式画像ジェネレーター（無料）",
    template: "%s｜formula.studio",
  },
  description:
    "「人生の成果＝能力×熱量×考え方」のような四則演算の思考式を、ブラウザだけで画像にできる無料ジェネレーター。X・note・Instagram・TikTok（9:16）向けのサイズに対応し、登録不要でPNGを保存できます。",
  keywords: [
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
    siteName: "formula.studio",
    title: "formula.studio｜思考式・方程式画像ジェネレーター",
    description: "四則演算で語る思考式を1枚の画像に。登録不要・無料。X / note / 正方形に対応。",
    images: [{ url: "/og.png", width: 1200, height: 675 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "formula.studio｜思考式・方程式画像ジェネレーター",
    description: "四則演算で語る思考式を1枚の画像に。登録不要・無料。",
    images: ["/og.png"],
  },
  alternates: { canonical: SITE.url },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B0D10",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ja"
      className={`${uiFont.variable} ${monoFont.variable} ${jpSansFont.variable} ${jpMonoFont.variable}`}
    >
      <body className="antialiased">
        {children}
        <footer className="mt-12 border-t border-line py-6">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-5 gap-y-2 px-4 text-[11px] text-faint">
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
                Buy me a coffee
              </a>
            )}
            <span className="ml-auto font-mono uppercase tracking-[0.14em]">
              © {new Date().getFullYear()} formula.studio
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
