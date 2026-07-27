import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { PRO_PRICE_LABEL } from "@/lib/plan";

export const metadata: Metadata = { title: "特定商取引法に基づく表記" };

const ROWS: [string, string][] = [
  ["販売事業者", SITE.operator],
  ["所在地", SITE.address],
  ["電話番号", `${SITE.phone}（受付時間：平日10:00〜17:00）`],
  ["メールアドレス", SITE.email],
  ["販売価格", `${PRO_PRICE_LABEL}（税込）／買い切り`],
  ["商品代金以外の必要料金", "インターネット接続に必要な通信料金は利用者のご負担となります。"],
  ["支払方法", "クレジットカード決済（Stripe）"],
  ["支払時期", "ご注文時に即時決済されます。"],
  ["役務の提供時期", "決済完了後、ただちにライセンスキーを画面に表示します。"],
  [
    "返品・キャンセル",
    "デジタルコンテンツの性質上、購入後の返品・返金は原則お受けできません。ライセンスキーが発行されない等の不具合があった場合はメールにてご連絡ください。",
  ],
  ["動作環境", "最新版の Google Chrome / Safari / Microsoft Edge"],
];

export default function TokushohoPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-2xl font-bold">特定商取引法に基づく表記</h1>
      <p className="mt-2 text-sm text-amber-700">
        ※ 公開前に運営者情報（事業者名・住所・電話番号）を必ず実際の情報に差し替えてください。
      </p>
      <dl className="mt-8 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
        {ROWS.map(([label, value]) => (
          <div key={label} className="grid gap-1 p-5 sm:grid-cols-[200px_1fr]">
            <dt className="text-sm font-semibold text-slate-700">{label}</dt>
            <dd className="text-sm leading-relaxed text-slate-600">{value}</dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
