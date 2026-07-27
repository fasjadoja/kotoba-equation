"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PRESETS, type Preset } from "@/lib/presets";
import { THEMES } from "@/lib/themes";
import { drawFormula, renderToBlob } from "@/lib/render";
import {
  DEFAULT_CONFIG,
  MAX_ELEMENTS,
  OPERATORS,
  SIZES,
  getSize,
  type FormulaConfig,
  type Operator,
  type SizeId,
} from "@/lib/types";
import { SHARE_HASHTAGS } from "@/lib/site";
import { useHistory, type HistoryEntry } from "@/hooks/useHistory";

export default function Editor() {
  const [config, setConfig] = useState<FormulaConfig>(DEFAULT_CONFIG);
  const [status, setStatus] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { entries, save, clear, summarize } = useHistory();

  const size = useMemo(() => getSize(config.sizeId), [config.sizeId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = size.width;
    canvas.height = size.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawFormula(ctx, config, size.width, size.height);
  }, [config, size]);

  useEffect(() => {
    if (!status) return;
    const timer = window.setTimeout(() => setStatus(null), 3500);
    return () => window.clearTimeout(timer);
  }, [status]);

  const update = useCallback((patch: Partial<FormulaConfig>) => {
    setConfig((previous) => ({ ...previous, ...patch }));
  }, []);

  const applyPreset = (preset: Preset) => {
    update({
      resultText: preset.resultText,
      subNote: preset.subNote,
      elements: preset.elements.map((element) => ({ ...element })),
    });
  };

  const restore = (entry: HistoryEntry) => {
    update({
      resultText: entry.resultText,
      subNote: entry.subNote,
      author: entry.author,
      elements: entry.elements.map((element) => ({ ...element })),
    });
    setHistoryOpen(false);
    setStatus("履歴から復元しました");
  };

  const updateElement = (index: number, patch: Partial<{ op: Operator | ""; text: string }>) => {
    setConfig((previous) => ({
      ...previous,
      elements: previous.elements.map((element, i) =>
        i === index ? { ...element, ...patch } : element,
      ),
    }));
  };

  const addElement = () => {
    setConfig((previous) =>
      previous.elements.length >= MAX_ELEMENTS
        ? previous
        : { ...previous, elements: [...previous.elements, { op: "×", text: "" }] },
    );
  };

  const removeElement = (index: number) => {
    setConfig((previous) => {
      const elements = previous.elements.filter((_, i) => i !== index);
      if (elements.length > 0) elements[0] = { ...elements[0], op: "" };
      return { ...previous, elements };
    });
  };

  const downloadImage = async () => {
    const blob = await renderToBlob(config);
    if (!blob) return false;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${config.resultText || "formula"}.png`;
    link.click();
    URL.revokeObjectURL(link.href);
    save(config);
    return true;
  };

  const formulaText = () =>
    config.elements
      .map((element, index) => (index === 0 ? element.text : `${element.op} ${element.text}`))
      .join(" ");

  const handleDownload = async () => {
    const ok = await downloadImage();
    setStatus(ok ? "画像を保存しました" : "画像を生成できませんでした");
  };

  const handleShare = async () => {
    const text = `${config.resultText} ＝ ${formulaText()}${
      config.subNote ? `\n\n${config.subNote}` : ""
    }`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text,
    )}&hashtags=${encodeURIComponent(SHARE_HASHTAGS.join(","))}`;
    const shareWindow = window.open(url, "_blank", "noopener,noreferrer");
    const ok = await downloadImage();
    if (!shareWindow) {
      setStatus("ポップアップがブロックされました。保存した画像を手動で投稿してください");
      return;
    }
    setStatus(ok ? "画像を保存しました。Xの投稿画面に貼り付けてください" : null);
  };

  const handleCopy = async () => {
    const blob = await renderToBlob(config);
    if (!blob) return;
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      save(config);
      setStatus("画像をコピーしました");
    } catch {
      setStatus("このブラウザではコピーできません。保存をご利用ください");
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_340px] lg:items-start">
      <div className="space-y-3">
        <canvas ref={canvasRef} className="h-auto w-full border border-neutral-200" />
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
          <span>
            {size.width} × {size.height}px（書き出しは2倍解像度）
          </span>
          {status && <span className="text-neutral-900">{status}</span>}
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => void handleShare()}
            className="flex-1 border border-neutral-900 bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-700"
          >
            画像を保存してXでシェア
          </button>
          <button
            onClick={() => void handleDownload()}
            className="border border-neutral-300 px-4 py-3 text-sm text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
          >
            保存のみ
          </button>
          <button
            onClick={() => void handleCopy()}
            className="border border-neutral-300 px-4 py-3 text-sm text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
          >
            コピー
          </button>
        </div>
      </div>

      <div className="space-y-7 text-sm">
        <Section label="サイズ">
          <div className="flex gap-2">
            {SIZES.map((item) => (
              <button
                key={item.id}
                onClick={() => update({ sizeId: item.id as SizeId })}
                className={`flex-1 border px-2 py-2 text-xs transition ${
                  config.sizeId === item.id
                    ? "border-neutral-900 text-neutral-900"
                    : "border-neutral-200 text-neutral-400 hover:border-neutral-400"
                }`}
              >
                {item.label}
                <span className="mt-0.5 block text-[10px] text-neutral-400">
                  {item.width}×{item.height}
                </span>
              </button>
            ))}
          </div>
        </Section>

        <Section label="結果">
          <input
            type="text"
            value={config.resultText}
            onChange={(e) => update({ resultText: e.target.value })}
            className={inputClass}
            placeholder="人生の成果"
          />
        </Section>

        <Section label="要素">
          <div className="space-y-2">
            {config.elements.map((element, index) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 ? (
                  <select
                    value={element.op}
                    onChange={(e) => updateElement(index, { op: e.target.value as Operator })}
                    aria-label={`要素 ${index + 1} の演算子`}
                    className={`${fieldClass} w-14 shrink-0 px-2 text-center`}
                  >
                    {OPERATORS.map((op) => (
                      <option key={op} value={op}>
                        {op}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="w-14 shrink-0" />
                )}
                <input
                  type="text"
                  value={element.text}
                  placeholder={`要素 ${index + 1}`}
                  onChange={(e) => updateElement(index, { text: e.target.value })}
                  className={`${fieldClass} min-w-0 flex-1`}
                />
                <button
                  onClick={() => removeElement(index)}
                  disabled={config.elements.length <= 1}
                  aria-label={`要素 ${index + 1} を削除`}
                  className="w-7 shrink-0 text-neutral-300 transition hover:text-neutral-900 disabled:invisible"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          {config.elements.length < MAX_ELEMENTS && (
            <button
              onClick={addElement}
              className="mt-2 w-full border border-dashed border-neutral-200 py-2 text-xs text-neutral-400 transition hover:border-neutral-400 hover:text-neutral-700"
            >
              要素を追加
            </button>
          )}
        </Section>

        <Section label="補足">
          <input
            type="text"
            value={config.subNote}
            onChange={(e) => update({ subNote: e.target.value })}
            className={inputClass}
            placeholder="※補足メッセージ"
          />
        </Section>

        <Section label="クレジット">
          <input
            type="text"
            value={config.author}
            onChange={(e) => update({ author: e.target.value })}
            className={inputClass}
            placeholder="@your_account"
          />
        </Section>

        <Section label="テーマ">
          <div className="flex items-center gap-2">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => update({ themeId: theme.id })}
                className={`flex-1 border px-3 py-2 text-xs transition ${
                  config.themeId === theme.id
                    ? "border-neutral-900 text-neutral-900"
                    : "border-neutral-200 text-neutral-400 hover:border-neutral-400"
                }`}
              >
                {theme.name}
              </button>
            ))}
          </div>
          <label className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
            <input
              type="checkbox"
              checked={config.showWatermark}
              onChange={(e) => update({ showWatermark: e.target.checked })}
              className="h-3.5 w-3.5 accent-neutral-900"
            />
            ロゴを表示する
          </label>
        </Section>

        <Section label="テンプレート">
          <div className="flex flex-wrap gap-x-3 gap-y-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className="text-xs text-neutral-400 underline-offset-4 transition hover:text-neutral-900 hover:underline"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </Section>

        <Section label="履歴">
          {entries.length === 0 ? (
            <p className="text-xs text-neutral-400">保存すると直近5件がここに残ります。</p>
          ) : (
            <>
              <button
                onClick={() => setHistoryOpen((open) => !open)}
                className="text-xs text-neutral-500 underline-offset-4 hover:text-neutral-900 hover:underline"
              >
                {historyOpen ? "閉じる" : `直近の${entries.length}件を表示`}
              </button>
              {historyOpen && (
                <ul className="mt-2 space-y-1">
                  {entries.map((entry) => (
                    <li key={entry.id}>
                      <button
                        onClick={() => restore(entry)}
                        className="w-full truncate border border-neutral-200 px-3 py-2 text-left text-xs text-neutral-600 transition hover:border-neutral-900 hover:text-neutral-900"
                        title={summarize(entry)}
                      >
                        {summarize(entry)}
                      </button>
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={clear}
                      className="text-xs text-neutral-400 underline-offset-4 hover:text-neutral-900 hover:underline"
                    >
                      履歴を削除
                    </button>
                  </li>
                </ul>
              )}
            </>
          )}
        </Section>
      </div>
    </div>
  );
}

const fieldClass =
  "border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-300 focus:border-neutral-900";

const inputClass = `${fieldClass} w-full`;

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-[11px] uppercase tracking-[0.18em] text-neutral-400">{label}</h2>
      {children}
    </section>
  );
}
