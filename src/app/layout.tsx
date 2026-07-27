import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Formula Studio｜方程式・図解画像ジェネレーター（無料）",
    template: "%s｜Formula Studio",
  },
  description:
    "「人生の成果＝能力×熱量×考え方」のような四則演算の方程式画像を、ブラウザだけで数十秒で作成。X（旧Twitter）やInstagramでそのまま使える高画質PNGを無料でダウンロードできます。",
  keywords: [
    "方程式 画像 作成",
    "図解 ジェネレーター",
    "X 画像 作成",
    "Twitter 図解",
    "フレームワーク 画像",
    "Formula Studio",
  ],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: siteUrl,
    siteName: "Formula Studio",
    title: "Formula Studio｜方程式・図解画像ジェネレーター",
    description:
      "四則演算で語る「思考の方程式」画像を数十秒で。Xでそのまま使える高画質PNGを無料生成。",
    images: [{ url: "/og.png", width: 1200, height: 675 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Formula Studio｜方程式・図解画像ジェネレーター",
    description: "四則演算の方程式画像を数十秒で作成。Xでそのまま使える高画質PNGを無料生成。",
    images: ["/og.png"],
  },
  alternates: { canonical: siteUrl },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
        <footer className="mt-16 border-t border-slate-200 bg-white py-8">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 text-center text-xs text-slate-500">
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/legal/terms" className="hover:text-slate-800">
                利用規約
              </Link>
              <Link href="/legal/privacy" className="hover:text-slate-800">
                プライバシーポリシー
              </Link>
              <Link href="/legal/tokushoho" className="hover:text-slate-800">
                特定商取引法に基づく表記
              </Link>
            </div>
            <p>© {new Date().getFullYear()} Formula Studio</p>
          </div>
        </footer>
        {adsenseClient && (
          <Script
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
          />
        )}
      </body>
    </html>
  );
}
