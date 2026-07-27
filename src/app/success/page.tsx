import { Suspense } from "react";
import type { Metadata } from "next";
import SuccessClient from "./SuccessClient";

export const metadata: Metadata = {
  title: "ご購入ありがとうございます",
  robots: { index: false },
};

export default function SuccessPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-20">
      <Suspense fallback={<p className="text-sm text-slate-500">読み込み中...</p>}>
        <SuccessClient />
      </Suspense>
    </main>
  );
}
