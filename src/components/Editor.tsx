"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PRESETS, type Preset } from "@/lib/presets";
import { THEMES } from "@/lib/themes";
import { drawFormula, getAspect, renderToBlob } from "@/lib/render";
import {
  ASPECTS,
  DEFAULT_CONFIG,
  OPERATORS,
  type AspectId,
  type FormulaConfig,
  type Operator,
} from "@/lib/types";
import { useLicense } from "@/hooks/useLicense";
import UpgradeDialog from "@/components/UpgradeDialog";

const MAX_ELEMENTS = 6;

export default function Editor() {
  const { isPro, checking, activate, deactivate } = useLicense();
  const [config, setConfig] = useState<FormulaConfig>(DEFAULT_CONFIG);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const aspect = useMemo(() => getAspect(config.aspectId), [config.aspectId]);
  const effectiveConfig = useMemo<FormulaConfig>(
    () => ({ ...config, showWatermark: isPro ? config.showWatermark : true }),
    [config, isPro],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = aspect.width;
    canvas.height = aspect.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawFormula(ctx, effectiveConfig, aspect.width, aspect.height);
  }, [effectiveConfig, aspect]);

  useEffect(() => {
    if (!status) return;
    const timer = window.setTimeout(() => setStatus(null), 4000);
    return () => window.clearTimeout(timer);
  }, [status]);

  const requirePro = useCallback(() => {
    setUpgradeOpen(true);
  }, []);

  const applyPreset = (preset: Preset) => {
    if (preset.pro && !isPro) {
      requirePro();
      return;
    }
    setConfig((prev) => ({
      ...prev,
      resultText: preset.resultText,
      subNote: preset.subNote,
      elements: preset.elements.map((e) => ({ ...e })),
    }));
  };

  const updateElement = (index: number, patch: Partial<{ op: Operator | ""; text: string }>) => {
    setConfig((prev) => ({
      ...prev,
      elements: prev.elements.map((el, i) => (i === index ? { ...el, ...patch } : el)),
    }));
  };

  const addElement = () => {
    setConfig((prev) =>
      prev.elements.length >= MAX_ELEMENTS
        ? prev
        : { ...prev, elements: [...prev.elements, { op: "×", text: "" }] },
    );
  };

  const removeElement = (index: number) => {
    setConfig((prev) => {
      const elements = prev.elements.filter((_, i) => i !== index);
      if (elements.length > 0) elements[0] = { ...elements[0], op: "" };
      return { ...prev, elements };
    });
  };

  const download = async (scale: number) => {
    if (scale > 1 && !isPro) {
      requirePro();
      return;
    }
    const blob = await renderToBlob(effectiveConfig, scale);
    if (!blob) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${config.resultText || "formula"}_formula.png`;
    link.click();
    URL.revokeObjectURL(link.href);
    setStatus("画像をダウンロードしました");
  };

  const copyToClipboard = async () => {
    const blob = await renderToBlob(effectiveConfig, 1);
    if (!blob) return;
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setStatus("画像をコピーしました。Xの投稿欄に貼り付けできます");
    } catch {
      setStatus("このブラウザではコピーできません。ダウンロードをご利用ください");
    }
  };

  const shareOnX = () => {
    const formula = config.elements
      .map((el, i) => (i === 0 ? el.text : `${el.op} ${el.text}`))
      .join(" ");
    const text = `${config.resultText} ＝ ${formula}\n\n${config.subNote}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            テンプレート
          </h2>
          {!checking &&
            (isPro ? (
              <button
                onClick={deactivate}
                className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
              >
                PRO 有効
              </button>
            ) : (
              <button
                onClick={requirePro}
                className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Proにする
              </button>
            ))}
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {PRESETS.map((preset) => {
            const locked = preset.pro && !isPro;
            return (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                  locked
                    ? "border-slate-200 bg-slate-50 text-slate-400 hover:border-blue-300 hover:text-blue-600"
                    : "border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
                title={locked ? "Pro限定テンプレート" : preset.label}
              >
                {locked ? `🔒 ${preset.label}` : preset.label}
              </button>
            );
          })}
        </div>

        <Field label="① 結果（＝の左側）">
          <input
            type="text"
            value={config.resultText}
            onChange={(e) => setConfig({ ...config, resultText: e.target.value })}
            className={inputClass}
          />
        </Field>

        <Field label="② 方程式の要素">
          <div className="space-y-2">
            {config.elements.map((element, index) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 ? (
                  <select
                    value={element.op}
                    onChange={(e) => updateElement(index, { op: e.target.value as Operator })}
                    className={`${fieldBaseClass} w-[72px] shrink-0`}
                  >
                    {OPERATORS.map((op) => (
                      <option key={op} value={op}>
                        {op}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="w-[72px] shrink-0" />
                )}
                <input
                  type="text"
                  value={element.text}
                  placeholder={`要素 ${index + 1}`}
                  onChange={(e) => updateElement(index, { text: e.target.value })}
                  className={`${fieldBaseClass} min-w-0 flex-1`}
                />
                {config.elements.length > 1 && (
                  <button
                    onClick={() => removeElement(index)}
                    aria-label={`要素 ${index + 1} を削除`}
                    className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-400 transition hover:border-red-300 hover:bg-red-50 hover:text-red-500"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          {config.elements.length < MAX_ELEMENTS && (
            <button
              onClick={addElement}
              className="mt-2 w-full rounded-md border border-dashed border-slate-300 bg-slate-50 py-2.5 text-sm font-medium text-slate-500 transition hover:border-slate-400 hover:text-slate-800"
            >
              + 要素を追加
            </button>
          )}
        </Field>

        <Field label="③ 補足メッセージ">
          <input
            type="text"
            value={config.subNote}
            onChange={(e) => setConfig({ ...config, subNote: e.target.value })}
            className={inputClass}
          />
        </Field>

        <Field label="④ アカウント名 / クレジット">
          <input
            type="text"
            value={config.author}
            onChange={(e) => setConfig({ ...config, author: e.target.value })}
            className={inputClass}
          />
        </Field>

        <Field label="⑤ テーマ">
          <div className="flex flex-wrap gap-2">
            {THEMES.map((theme) => {
              const locked = theme.pro && !isPro;
              const active = config.themeId === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() =>
                    locked ? requirePro() : setConfig({ ...config, themeId: theme.id })
                  }
                  className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                    active
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-slate-300"
                    style={{ background: theme.background }}
                  />
                  {locked ? `🔒 ${theme.name}` : theme.name}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="⑥ サイズ">
          <div className="flex flex-wrap gap-2">
            {ASPECTS.map((item) => {
              const locked = item.pro && !isPro;
              const active = config.aspectId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() =>
                    locked
                      ? requirePro()
                      : setConfig({ ...config, aspectId: item.id as AspectId })
                  }
                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                    active
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                  title={item.hint}
                >
                  {locked ? `🔒 ${item.label}` : item.label}
                  <span className="ml-1 text-[10px] text-slate-400">{item.hint}</span>
                </button>
              );
            })}
          </div>
        </Field>

        <label className="mt-4 flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={effectiveConfig.showWatermark}
            disabled={!isPro}
            onChange={(e) => setConfig({ ...config, showWatermark: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300"
          />
          透かし（Formula Studio）を表示
          {!isPro && <span className="text-xs text-slate-400">Proで削除できます</span>}
        </label>

        <div className="mt-6 space-y-2">
          <button
            onClick={() => void download(1)}
            className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            PNGをダウンロード（等倍）
          </button>
          <button
            onClick={() => void download(2)}
            className="w-full rounded-lg border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {isPro ? "高解像度（2倍）でダウンロード" : "🔒 高解像度（2倍）ダウンロード"}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => void copyToClipboard()}
              className="rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              画像をコピー
            </button>
            <button
              onClick={shareOnX}
              className="rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Xで投稿
            </button>
          </div>
        </div>

        {status && <p className="mt-3 text-center text-xs text-emerald-600">{status}</p>}
      </section>

      <section className="space-y-3">
        <canvas
          ref={canvasRef}
          className="w-full rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5"
        />
        <p className="text-center text-xs text-slate-500">
          {aspect.width} × {aspect.height}px / {isPro ? "透かしなしで書き出せます" : "無料版は透かし付きで書き出されます"}
        </p>
      </section>

      <UpgradeDialog
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        onActivate={activate}
      />
    </div>
  );
}

const fieldBaseClass =
  "rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10";

const inputClass = `${fieldBaseClass} w-full`;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}
