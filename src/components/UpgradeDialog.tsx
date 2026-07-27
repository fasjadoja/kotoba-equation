"use client";

import { useState } from "react";
import { PRO_FEATURES, PRO_PRICE_LABEL } from "@/lib/plan";

type Props = {
  open: boolean;
  onClose: () => void;
  onActivate: (key: string) => Promise<boolean>;
};

export default function UpgradeDialog({ open, onClose, onActivate }: Props) {
  const [licenseKey, setLicenseKey] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const startCheckout = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data: { url?: string; message?: string } = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setMessage(data.message ?? "決済を開始できませんでした。時間をおいてお試しください。");
    } catch {
      setMessage("通信エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  const activate = async () => {
    setLoading(true);
    setMessage(null);
    const ok = await onActivate(licenseKey);
    setLoading(false);
    if (ok) {
      setMessage("ライセンスを認証しました。Pro機能が使えます。");
      window.setTimeout(onClose, 1200);
    } else {
      setMessage("ライセンスキーが正しくありません。");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Formula Studio Pro</h3>
            <p className="text-sm text-slate-500">{PRO_PRICE_LABEL}・買い切り / 追加課金なし</p>
          </div>
          <button
            onClick={onClose}
            aria-label="閉じる"
            className="rounded-md px-2 py-1 text-slate-400 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <ul className="mb-5 space-y-2 text-sm text-slate-700">
          {PRO_FEATURES.map((feature) => (
            <li key={feature} className="flex gap-2">
              <span className="text-emerald-500">✓</span>
              {feature}
            </li>
          ))}
        </ul>

        <button
          onClick={() => void startCheckout()}
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {PRO_PRICE_LABEL}で購入する
        </button>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            ライセンスキーをお持ちの方
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              placeholder="FS1-XXXX-XXXX-XXXX-..."
              className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white"
            />
            <button
              onClick={() => void activate()}
              disabled={loading || licenseKey.length === 0}
              className="shrink-0 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              認証
            </button>
          </div>
        </div>

        {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}
      </div>
    </div>
  );
}
