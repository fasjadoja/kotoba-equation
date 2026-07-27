import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "formula.studio｜思考式・方程式画像ジェネレーター（無料）",
    template: "%s｜formula.studio",
  },
  description:
    "「人生の成果＝能力×熱量×考え方」のような四則演算の思考式を、ブラウザだけで画像にできる無料ジェネレーター。X・note・Instagram向けのサイズに対応し、登録不要でPNGを保存できます。",
  keywords: [
    "思考式 ジェネレーター",
    "方程式 画像 作成",
    "図解 ジェネレーター",
    "X 画像 作成",
    "note アイキャッチ 作成",
    "フレームワーク 画像",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
        <footer className="border-t border-neutral-100 py-8">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-5 gap-y-2 px-6 text-xs text-neutral-400">
            <Link href="/legal/terms" className="hover:text-neutral-900">
              利用規約
            </Link>
            <Link href="/legal/privacy" className="hover:text-neutral-900">
              プライバシー
            </Link>
            {SITE.donateUrl && (
              <a
                href={SITE.donateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neutral-900"
              >
                コーヒーをおごる
              </a>
            )}
            <span className="ml-auto">© {new Date().getFullYear()} formula.studio</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
