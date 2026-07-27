"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PRESETS, type Preset } from "@/lib/presets";
import { THEMES } from "@/lib/themes";
import { CANVAS_FONTS, type CanvasFontId } from "@/lib/fonts";
import { drawFormula, renderToBlob, type RenderOptions } from "@/lib/render";
import {
  DEFAULT_CONFIG,
  LIMITS,
  MAX_ELEMENTS,
  OPERATORS,
  SIZES,
  getSize,
  type FormulaConfig,
  type Operator,
} from "@/lib/types";
import { SHARE_HASHTAGS } from "@/lib/site";
import { useHistory, type HistoryEntry } from "@/hooks/useHistory";

const RENDER_OPTIONS: Record<CanvasFontId, RenderOptions> = {
  mincho: { fontStack: CANVAS_FONTS.mincho.stack, strongWeight: "600", normalWeight: "400" },
  gothic: { fontStack: CANVAS_FONTS.gothic.stack, strongWeight: "700", normalWeight: "400" },
};

/**
 * Japanese webfonts are served in many unicode-range slices, and the browser
 * only fetches the slices used by the DOM. Canvas silently falls back to a
 * system font otherwise, so the glyphs are requested explicitly before drawing.
 */
async function ensureFont(config: FormulaConfig) {
  if (typeof document === "undefined" || !document.fonts) return;
  const family = CANVAS_FONTS[config.fontId].primary;
  const text = [
    config.resultText,
    config.subNote,
    config.author,
    ...config.elements.map((element) => `${element.op}${element.text}`),
  ].join("");
  const options = RENDER_OPTIONS[config.fontId];
  try {
    await Promise.all([
      document.fonts.load(`${options.strongWeight} 48px ${family}`, text),
      document.fonts.load(`${options.normalWeight} 20px ${family}`, `${text} FORMULASTUDIO©`),
    ]);
  } catch {
    // Fall back to whatever the stack resolves to.
  }
}

function countOf(value: string) {
  return Array.from(value).length;
}

export default function Editor() {
  const [config, setConfig] = useState<FormulaConfig>(DEFAULT_CONFIG);
  const [status, setStatus] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [canCopy, setCanCopy] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { entries, save, clear, summarize } = useHistory();

  const size = useMemo(() => getSize(config.sizeId), [config.sizeId]);
  const renderOptions = RENDER_OPTIONS[config.fontId];

  useEffect(() => {
    setCanCopy(
      typeof window !== "undefined" &&
        typeof window.ClipboardItem !== "undefined" &&
        typeof navigator.clipboard?.write === "function",
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas || cancelled) return;
      canvas.width = size.width;
      canvas.height = size.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      drawFormula(ctx, config, size.width, size.height, renderOptions);
    };
    draw();
    void ensureFont(config).then(draw);
    return () => {
      cancelled = true;
    };
  }, [config, size, renderOptions]);

  useEffect(() => {
    if (!status) return;
    const timer = window.setTimeout(() => setStatus(null), 4000);
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
    await ensureFont(config);
    const blob = await renderToBlob(config, renderOptions);
    if (!blob) return false;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const supportsDownload = "download" in link;
    if (supportsDownload) {
      link.href = url;
      link.download = `${config.resultText || "formula"}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } else {
      // iOS Safari < 13 and in-app browsers: show the image so it can be long-pressed.
      window.open(url, "_blank");
    }
    window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
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
    await ensureFont(config);
    try {
      const item = new ClipboardItem({
        "image/png": renderToBlob(config, renderOptions).then((blob) => {
          if (!blob) throw new Error("render failed");
          return blob;
        }),
      });
      await navigator.clipboard.write([item]);
      save(config);
      setStatus("画像をコピーしました");
    } catch {
      setStatus("このブラウザではコピーできません。保存をご利用ください");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-start lg:gap-14">
      <div className="min-w-0 lg:sticky lg:top-10">
        <div className="flex w-full items-center justify-center bg-stage p-4 sm:p-8">
          <canvas
            ref={canvasRef}
            aria-label="生成された思考式の画像"
            className="max-h-[52vh] w-auto max-w-full bg-white shadow-[0_1px_24px_rgba(27,26,22,0.08)] lg:max-h-[64vh]"
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-faint">
          <span>
            {size.width} × {size.height}px — 書き出しは2倍解像度
          </span>
          {status && <span className="text-ink">{status}</span>}
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() => void handleShare()}
            className="flex-1 bg-ink px-5 py-3.5 text-[13px] tracking-[0.08em] text-paper transition hover:opacity-80"
          >
            画像を保存して X でシェア
          </button>
          <button
            onClick={() => void handleDownload()}
            className="border border-line px-5 py-3.5 text-[13px] tracking-[0.08em] text-muted transition hover:border-ink hover:text-ink"
          >
            保存のみ
          </button>
          {canCopy && (
            <button
              onClick={() => void handleCopy()}
              className="border border-line px-5 py-3.5 text-[13px] tracking-[0.08em] text-muted transition hover:border-ink hover:text-ink"
            >
              コピー
            </button>
          )}
        </div>
      </div>

      <div className="min-w-0 space-y-8 text-sm">
        <Section label="Format">
          <div className="grid grid-cols-3 gap-px bg-line">
            {SIZES.map((item) => (
              <button
                key={item.id}
                onClick={() => update({ sizeId: item.id })}
                className={`bg-paper px-2 py-2.5 text-center transition ${
                  config.sizeId === item.id ? "text-ink" : "text-faint hover:text-muted"
                }`}
              >
                <span className="block text-xs tracking-[0.1em]">{item.label}</span>
                <span className="mt-0.5 block text-[10px] text-faint">{item.hint}</span>
              </button>
            ))}
            <span className="bg-paper" aria-hidden />
          </div>
        </Section>

        <Section label="Result">
          <Field
            value={config.resultText}
            onChange={(value) => update({ resultText: value })}
            placeholder="人生の成果"
            limit={LIMITS.resultText}
          />
        </Section>

        <Section label="Elements">
          <div className="space-y-2">
            {config.elements.map((element, index) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 ? (
                  <select
                    value={element.op}
                    onChange={(e) => updateElement(index, { op: e.target.value as Operator })}
                    aria-label={`要素 ${index + 1} の演算子`}
                    className={`${fieldClass} w-12 shrink-0 appearance-none px-1 text-center`}
                  >
                    {OPERATORS.map((op) => (
                      <option key={op} value={op}>
                        {op}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="w-12 shrink-0" />
                )}
                <input
                  type="text"
                  value={element.text}
                  placeholder={`要素 ${index + 1}`}
                  maxLength={LIMITS.element}
                  onChange={(e) => updateElement(index, { text: e.target.value })}
                  className={`${fieldClass} min-w-0 flex-1`}
                />
                <button
                  onClick={() => removeElement(index)}
                  disabled={config.elements.length <= 1}
                  aria-label={`要素 ${index + 1} を削除`}
                  className="w-6 shrink-0 text-faint transition hover:text-ink disabled:invisible"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          {config.elements.length < MAX_ELEMENTS && (
            <button
              onClick={addElement}
              className="mt-2 w-full border border-dashed border-line py-2 text-[11px] tracking-[0.1em] text-faint transition hover:border-muted hover:text-muted"
            >
              要素を追加（最大{MAX_ELEMENTS}）
            </button>
          )}
        </Section>

        <Section label="Note">
          <Field
            value={config.subNote}
            onChange={(value) => update({ subNote: value })}
            placeholder="※補足メッセージ"
            limit={LIMITS.subNote}
          />
        </Section>

        <Section label="Credit">
          <Field
            value={config.author}
            onChange={(value) => update({ author: value })}
            placeholder="@your_account"
            limit={LIMITS.author}
          />
          <div className="mt-3 space-y-2">
            <Toggle
              checked={config.showCopyright}
              onChange={(checked) => update({ showCopyright: checked })}
              label={`© 表記を付ける（© ${new Date().getFullYear()} ${config.author || "you"}）`}
            />
            <Toggle
              checked={config.showWatermark}
              onChange={(checked) => update({ showWatermark: checked })}
              label="FORMULA STUDIO のロゴを入れる"
            />
          </div>
        </Section>

        <Section label="Typeface">
          <div className="grid grid-cols-2 gap-px bg-line">
            {(Object.keys(CANVAS_FONTS) as CanvasFontId[]).map((id) => (
              <button
                key={id}
                onClick={() => update({ fontId: id })}
                className={`bg-paper px-3 py-2.5 text-xs tracking-[0.1em] transition ${
                  config.fontId === id ? "text-ink" : "text-faint hover:text-muted"
                }`}
              >
                {CANVAS_FONTS[id].label}
              </button>
            ))}
          </div>
        </Section>

        <Section label="Palette">
          <div className="grid grid-cols-3 gap-px bg-line">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => update({ themeId: theme.id })}
                className={`flex items-center justify-center gap-2 bg-paper px-2 py-2.5 text-[11px] tracking-[0.1em] transition ${
                  config.themeId === theme.id ? "text-ink" : "text-faint hover:text-muted"
                }`}
              >
                <span
                  className="h-2.5 w-2.5 border border-line"
                  style={{ backgroundColor: theme.swatch }}
                />
                {theme.name}
              </button>
            ))}
          </div>
        </Section>

        <Section label="Templates">
          <div className="flex flex-wrap gap-x-3 gap-y-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className="text-xs text-faint underline-offset-4 transition hover:text-ink hover:underline"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </Section>

        <Section label="History">
          {entries.length === 0 ? (
            <p className="text-[11px] text-faint">保存すると直近5件がここに残ります。</p>
          ) : (
            <>
              <button
                onClick={() => setHistoryOpen((open) => !open)}
                className="text-[11px] tracking-[0.08em] text-muted underline-offset-4 hover:text-ink hover:underline"
              >
                {historyOpen ? "閉じる" : `直近の${entries.length}件を表示`}
              </button>
              {historyOpen && (
                <ul className="mt-2 space-y-1">
                  {entries.map((entry) => (
                    <li key={entry.id}>
                      <button
                        onClick={() => restore(entry)}
                        className="w-full truncate border border-line px-3 py-2 text-left text-[11px] text-muted transition hover:border-ink hover:text-ink"
                        title={summarize(entry)}
                      >
                        {summarize(entry)}
                      </button>
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={clear}
                      className="text-[11px] text-faint underline-offset-4 hover:text-ink hover:underline"
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

// text-base on mobile keeps iOS Safari from zooming in when a field is focused.
const fieldClass =
  "border border-line bg-paper px-3 py-2 text-base text-ink outline-none transition placeholder:text-faint focus:border-ink sm:text-sm";

function Field({
  value,
  onChange,
  placeholder,
  limit,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  limit: number;
}) {
  const count = countOf(value);
  return (
    <div>
      <input
        type="text"
        value={value}
        maxLength={limit}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${fieldClass} w-full`}
      />
      <p
        className={`mt-1 text-right text-[10px] ${
          count >= limit ? "text-ink" : "text-faint"
        }`}
      >
        {count} / {limit}
      </p>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 text-[11px] text-muted">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3.5 w-3.5 accent-ink"
      />
      {label}
    </label>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2.5 text-[10px] uppercase tracking-[0.28em] text-faint">{label}</h2>
      {children}
    </section>
  );
}
