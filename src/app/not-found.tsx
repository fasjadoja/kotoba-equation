import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";

export const metadata: Metadata = {
  title: "ページが見つかりません",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-[520px] flex-col items-center justify-center px-4 text-center">
      <LogoMark width={44} />
      <h1 className="mt-4 text-[20px] font-semibold tracking-tight text-fg">
        ページが見つかりません
      </h1>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">
        URLが変わったか、削除された可能性があります。トップページから式づくりを続けられます。
      </p>
      <Link
        href="/"
        className="mt-5 inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-accentDark"
      >
        トップページへ
      </Link>
    </main>
  );
}
