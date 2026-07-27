"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLicense } from "@/hooks/useLicense";

export default function SuccessClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { activate } = useLicense();
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setError("購入情報が見つかりませんでした。");
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`/api/license/issue?session_id=${encodeURIComponent(sessionId)}`);
        const data: { key?: string } = await res.json();
        if (cancelled) return;
        if (!res.ok || !data.key) {
          setError("ライセンスの発行に失敗しました。サポートまでご連絡ください。");
          return;
        }
        setLicenseKey(data.key);
        await activate(data.key);
      } catch {
        if (!cancelled) setError("通信エラーが発生しました。");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, activate]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h1 className="text-xl font-bold">ご購入ありがとうございます</h1>

      {licenseKey && (
        <>
          <p className="mt-2 text-sm text-slate-600">
            Pro機能を有効化しました。ライセンスキーは大切に保管してください。
          </p>
          <code className="mt-5 block break-all rounded-lg bg-slate-100 px-4 py-3 text-sm font-semibold tracking-wide text-slate-800">
            {licenseKey}
          </code>
          <button
            onClick={() => {
              void navigator.clipboard.writeText(licenseKey);
              setCopied(true);
            }}
            className="mt-3 text-xs font-medium text-blue-600 hover:underline"
          >
            {copied ? "コピーしました" : "キーをコピー"}
          </button>
        </>
      )}

      {!licenseKey && !error && <p className="mt-4 text-sm text-slate-500">ライセンスを発行しています...</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <Link
        href="/"
        className="mt-8 inline-block rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
      >
        エディタに戻る
      </Link>
    </div>
  );
}
