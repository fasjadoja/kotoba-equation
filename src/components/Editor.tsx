"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PRESETS, type Preset } from "@/lib/presets";
import { THEMES } from "@/lib/themes";
import { CANVAS_FONTS, type CanvasFontId } from "@/lib/fonts";
import { WORDMARK, drawFormula, renderToBlob, type RenderOptions } from "@/lib/render";
import {
  DEFAULT_CONFIG,
  LAYOUTS,
  LIMITS,
  MAX_ELEMENTS,
  OPERATORS,
  RELATIONS,
  SIZES,
  getSize,
  type FormulaConfig,
  type Operator,
} from "@/lib/types";
import { SHARE_HASHTAGS } from "@/lib/site";
import { useHistory, type HistoryEntry } from "@/hooks/useHistory";

const RENDER_OPTIONS: Record<CanvasFontId, RenderOptions> = {
  sans: {
    fontStack: CANVAS_FONTS.sans.stack,
    strongWeight: "600",
    normalWeight: "400",
  },
  mono: {
    fontStack: CANVAS_FONTS.mono.stack,
    strongWeight: "500",
    normalWeight: "400",
  },
};

const CUSTOM_OP = "__custom__";

/**
 * Japanese webfonts are served in many unicode-range slices, and the browser
 * only fetches the slices used by the DOM. Canvas silently falls back to a
 * system font otherwise, so the glyphs are requested explicitly before drawing.
 */
async function ensureFont(config: FormulaConfig) {
  if (typeof document === "undefined" || !document.fonts) return;
  const { families } = CANVAS_FONTS[config.fontId];
  const text = [
    config.resultText,
    config.relation,
    config.subNote,
    config.author,
    ...config.elements.map((element) => `${element.op}${element.text}`),
  ].join("");
  const options = RENDER_OPTIONS[config.fontId];
  try {
    await Promise.all(
      families.flatMap((family) => [
        document.fonts.load(`${options.strongWeight} 48px ${family}`, text),
        document.fonts.load(
          `${options.normalWeight} 20px ${family}`,
          `${text}${WORDMARK}©`,
        ),
      ]),
    );
  } catch {
    // Fall back to whatever the stack resolves to.
  }
}

function countOf(value: string) {
  return Array.from(value).length;
}

function isPresetOperator(op: Operator) {
  return (OPERATORS as readonly string[]).includes(op);
}

function isPresetRelation(relation: string) {
  return (RELATIONS as readonly string[]).includes(relation);
}

export default function Editor() {
  const [config, setConfig] = useState<FormulaConfig>(DEFAULT_CONFIG);
  const [status, setStatus] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [canCopy, setCanCopy] = useState(false);
  const [customOps, setCustomOps] = useState<boolean[]>([]);
  const [customRelation, setCustomRelation] = useState(false);
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
      relation: preset.relation ?? "＝",
      subNote: preset.subNote,
      elements: preset.elements.map((element) => ({ ...element })),
    });
    setCustomOps([]);
    setCustomRelation(!isPresetRelation(preset.relation ?? "＝"));
  };

  const restore = (entry: HistoryEntry) => {
    update({
      resultText: entry.resultText,
      relation: entry.relation || "＝",
      subNote: entry.subNote,
      author: entry.author,
      elements: entry.elements.map((element) => ({ ...element })),
    });
    setCustomOps(
      entry.elements.map(
        (element) => !!element.op && !isPresetOperator(element.op),
      ),
    );
    setCustomRelation(!isPresetRelation(entry.relation || "＝"));
    setHistoryOpen(false);
    setStatus("履歴から復元しました");
  };

  const updateElement = (
    index: number,
    patch: Partial<{ op: Operator; text: string }>,
  ) => {
    setConfig((previous) => ({
      ...previous,
      elements: previous.elements.map((element, i) =>
        i === index ? { ...element, ...patch } : element,
      ),
    }));
  };

  const setOperatorMode = (index: number, custom: boolean) => {
    setCustomOps((previous) => {
      const next = [...previous];
      next[index] = custom;
      return next;
    });
  };

  const addElement = () => {
    setConfig((previous) =>
      previous.elements.length >= MAX_ELEMENTS
        ? previous
        : {
            ...previous,
            elements: [...previous.elements, { op: "×", text: "" }],
          },
    );
  };

  const removeElement = (index: number) => {
    setConfig((previous) => {
      const elements = previous.elements.filter((_, i) => i !== index);
      if (elements.length > 0) elements[0] = { ...elements[0], op: "" };
      return { ...previous, elements };
    });
    setCustomOps((previous) => previous.filter((_, i) => i !== index));
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
      .map((element, index) =>
        index === 0 ? element.text : `${element.op} ${element.text}`,
      )
      .join(" ");

  const handleDownload = async () => {
    const ok = await downloadImage();
    setStatus(ok ? "画像を保存しました" : "画像を生成できませんでした");
  };

  const handleShare = async () => {
    const text = `${config.resultText} ${config.relation || "＝"} ${formulaText()}${
      config.subNote ? `\n\n${config.subNote}` : ""
    }`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text,
    )}&hashtags=${encodeURIComponent(SHARE_HASHTAGS.join(","))}`;
    const shareWindow = window.open(url, "_blank", "noopener,noreferrer");
    const ok = await downloadImage();
    if (!shareWindow) {
      setStatus(
        "ポップアップがブロックされました。保存した画像を手動で投稿してください",
      );
      return;
    }
    setStatus(
      ok ? "画像を保存しました。Xの投稿画面に貼り付けてください" : null,
    );
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
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[404px_minmax(0,1fr)] lg:items-start">
      <div className="order-2 min-w-0 divide-y divide-line rounded-2xl border border-line bg-panel shadow-card lg:order-none lg:col-start-1 lg:row-span-2 lg:row-start-1">
        <Section index="①" label="結果（左側）">
          <Field
            value={config.resultText}
            onChange={(value) => update({ resultText: value })}
            placeholder="体感の暑さ"
            limit={LIMITS.resultText}
          />
        </Section>

        <Section index="②" label="関係（左と右をつなぐ記号）">
          <div className="flex items-center gap-1.5">
            <select
              value={customRelation ? CUSTOM_OP : config.relation}
              onChange={(e) => {
                const value = e.target.value;
                setCustomRelation(value === CUSTOM_OP);
                update({ relation: value === CUSTOM_OP ? "" : value });
              }}
              aria-label="関係記号"
              className={`${fieldClass} w-[84px] shrink-0 px-2 text-center`}
            >
              {RELATIONS.map((relation) => (
                <option key={relation} value={relation}>
                  {relation}
                </option>
              ))}
              <option value={CUSTOM_OP}>･･･</option>
            </select>
            {customRelation && (
              <input
                type="text"
                value={config.relation}
                maxLength={LIMITS.relation}
                placeholder="≒"
                aria-label="関係記号を直接入力（1文字）"
                onChange={(e) =>
                  update({
                    relation: Array.from(e.target.value).slice(-1).join(""),
                  })
                }
                className={`${fieldClass} w-[60px] shrink-0 px-2 text-center`}
              />
            )}
          </div>
          <p className="mt-2 text-[11px] leading-snug text-faint">
            「暑さ＝気温×湿度」のような式も、「思い出＞お金」のような比較も作れます。
          </p>
        </Section>

        <Section
          index="③"
          label="右側の要素"
          hint={`${config.elements.length} / ${MAX_ELEMENTS}`}
        >
          <div className="space-y-1.5">
            {config.elements.map((element, index) => {
              const custom =
                customOps[index] ??
                (!!element.op && !isPresetOperator(element.op));
              return (
                <div key={index} className="flex items-center gap-1.5">
                  {index > 0 ? (
                    <>
                      <select
                        value={custom ? CUSTOM_OP : element.op}
                        onChange={(e) => {
                          const value = e.target.value;
                          setOperatorMode(index, value === CUSTOM_OP);
                          updateElement(index, {
                            op: value === CUSTOM_OP ? "" : value,
                          });
                        }}
                        aria-label={`要素 ${index + 1} の演算子`}
                        className={`${fieldClass} w-[58px] shrink-0 px-1 text-center font-mono`}
                      >
                        {OPERATORS.map((op) => (
                          <option key={op} value={op}>
                            {op}
                          </option>
                        ))}
                        <option value={CUSTOM_OP}>･･･</option>
                      </select>
                      {custom && (
                        <input
                          type="text"
                          value={element.op}
                          maxLength={LIMITS.operator}
                          placeholder="＝"
                          aria-label={`要素 ${index + 1} の演算子を直接入力（1文字）`}
                          onChange={(e) =>
                            updateElement(index, {
                              op: Array.from(e.target.value).slice(-1).join(""),
                            })
                          }
                          className={`${fieldClass} w-[46px] shrink-0 px-1 text-center font-mono`}
                        />
                      )}
                    </>
                  ) : null}
                  <input
                    type="text"
                    value={element.text}
                    placeholder={`要素 ${index + 1}`}
                    maxLength={LIMITS.element}
                    onChange={(e) =>
                      updateElement(index, { text: e.target.value })
                    }
                    className={`${fieldClass} min-w-0 flex-1`}
                  />
                  <button
                    onClick={() => removeElement(index)}
                    disabled={config.elements.length <= 1}
                    aria-label={`要素 ${index + 1} を削除`}
                    title="この要素を削除"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-danger/30 bg-danger/5 text-danger transition hover:border-danger hover:bg-danger hover:text-white disabled:cursor-not-allowed disabled:border-line disabled:bg-raised disabled:text-faint/50"
                  >
                    <TrashIcon />
                  </button>
                </div>
              );
            })}
          </div>
          {config.elements.length < MAX_ELEMENTS && (
            <button
              onClick={addElement}
              className="mt-1.5 w-full rounded-xl border border-dashed border-edge py-2 text-[12px] font-medium text-accent transition hover:border-accent hover:bg-accent/5"
            >
              ＋ 要素を追加
            </button>
          )}
          <p className="mt-2 text-[11px] text-faint">
            演算子はプルダウンから選ぶか、「･･･」を選んで1文字だけ直接入力できます。
          </p>
        </Section>

        <Section index="④" label="補足（下部メッセージ）">
          <Field
            value={config.subNote}
            onChange={(value) => update({ subNote: value })}
            placeholder="※補足メッセージ"
            limit={LIMITS.subNote}
          />
        </Section>

        <Section index="⑤" label="アカウント名 / クレジット">
          <Field
            value={config.author}
            onChange={(value) => update({ author: value })}
            placeholder="@your_account"
            limit={LIMITS.author}
          />
          <div className="mt-2.5 space-y-2">
            <Toggle
              checked={config.showCopyright}
              onChange={(checked) => update({ showCopyright: checked })}
              label={`© 表記を付ける（© ${new Date().getFullYear()} ${config.author || "you"}）`}
            />
            <Toggle
              checked={config.showWatermark}
              onChange={(checked) => update({ showWatermark: checked })}
              label="「ことばの方程式」のロゴを入れる"
            />
          </div>
        </Section>

        <div className="space-y-2 p-3.5">
          <button
            onClick={() => void handleShare()}
            className="w-full rounded-xl bg-accent px-5 py-3.5 text-[14px] font-semibold text-white shadow-[0_6px_18px_rgba(43,78,230,0.28)] transition hover:-translate-y-0.5 hover:bg-accentDark hover:shadow-[0_10px_24px_rgba(43,78,230,0.32)] active:translate-y-0"
          >
            画像を保存して X でシェア
          </button>
          <div
            className={`grid gap-2 ${canCopy ? "grid-cols-2" : "grid-cols-1"}`}
          >
            <button
              onClick={() => void handleDownload()}
              className={secondaryButtonClass}
            >
              保存のみ（PNG）
            </button>
            {canCopy && (
              <button
                onClick={() => void handleCopy()}
                className={secondaryButtonClass}
              >
                コピー
              </button>
            )}
          </div>
          <p className="h-4 text-center text-[11px] text-accent">
            {status ?? ""}
          </p>
        </div>
      </div>

      <div className="order-1 min-w-0 lg:order-none lg:col-start-2 lg:row-start-1">
        <div className="rounded-2xl border border-line bg-panel shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-2">
            <div className="flex flex-wrap gap-1">
              {SIZES.map((item) => (
                <button
                  key={item.id}
                  onClick={() => update({ sizeId: item.id })}
                  aria-pressed={config.sizeId === item.id}
                  title={item.hint}
                  className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
                    config.sizeId === item.id
                      ? "bg-accent/10 text-accent"
                      : "text-muted hover:bg-raised hover:text-fg"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <span className="font-mono text-[11px] text-faint">
              {size.width} × {size.height} / @2x
            </span>
          </div>
          <div className="flex w-full items-center justify-center p-4 sm:p-8">
            <canvas
              ref={canvasRef}
              aria-label="生成された思考式の画像"
              className="max-h-[46vh] w-auto max-w-full rounded-lg border border-line shadow-lift transition-transform duration-300 lg:max-h-[58vh]"
            />
          </div>
        </div>
      </div>

      <div className="order-3 min-w-0 lg:col-start-2 lg:row-start-2">
        <div className="divide-y divide-line rounded-2xl border border-line bg-panel shadow-card">
          <div className="grid sm:grid-cols-[190px_210px_minmax(0,1fr)] sm:divide-x sm:divide-line">
            <Section label="書体">
              <div className="grid grid-cols-2 gap-1.5">
                {(Object.keys(CANVAS_FONTS) as CanvasFontId[]).map((id) => (
                  <button
                    key={id}
                    onClick={() => update({ fontId: id })}
                    aria-pressed={config.fontId === id}
                    className={`rounded-lg border px-3 py-2 text-[12px] font-medium transition ${
                      config.fontId === id
                        ? "border-accent bg-accent/5 text-accent"
                        : "border-edge bg-panel text-muted hover:border-accent/50 hover:text-fg"
                    }`}
                  >
                    {CANVAS_FONTS[id].label}
                  </button>
                ))}
              </div>
            </Section>

            <Section label="レイアウト">
              <div className="grid grid-cols-3 gap-1.5">
                {LAYOUTS.map((layout) => (
                  <button
                    key={layout.id}
                    onClick={() => update({ layoutId: layout.id })}
                    aria-pressed={config.layoutId === layout.id}
                    title={layout.hint}
                    className={`rounded-lg border px-2 py-2 text-[12px] font-medium transition ${
                      config.layoutId === layout.id
                        ? "border-accent bg-accent/5 text-accent"
                        : "border-edge bg-panel text-muted hover:border-accent/50 hover:text-fg"
                    }`}
                  >
                    {layout.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] leading-snug text-faint">
                自動なら「1＜2」のような短い式だけ横1行になります。
              </p>
            </Section>

            <Section label="配色">
              <div className="grid max-w-md grid-cols-3 gap-1.5">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => update({ themeId: theme.id })}
                    aria-pressed={config.themeId === theme.id}
                    className={`flex items-center justify-center gap-2 rounded-lg border px-2 py-2 text-[12px] font-medium transition ${
                      config.themeId === theme.id
                        ? "border-accent bg-accent/5 text-accent"
                        : "border-edge bg-panel text-muted hover:border-accent/50 hover:text-fg"
                    }`}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full border border-edge"
                      style={{ backgroundColor: theme.swatch }}
                    />
                    {theme.name}
                  </button>
                ))}
              </div>
            </Section>
          </div>

          <Section label="テンプレート">
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className="rounded-full border border-edge bg-panel px-3 py-1.5 text-[12px] text-muted transition hover:border-accent/50 hover:bg-accent/5 hover:text-accent"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </Section>

          <Section label="履歴">
            {entries.length === 0 ? (
              <p className="text-[11px] text-faint">
                保存すると直近5件がここに残ります。
              </p>
            ) : (
              <>
                <button
                  onClick={() => setHistoryOpen((open) => !open)}
                  className="text-[11px] text-accent transition hover:underline"
                >
                  {historyOpen
                    ? "▾ 閉じる"
                    : `▸ 直近の${entries.length}件を表示`}
                </button>
                {historyOpen && (
                  <ul className="mt-2 space-y-1">
                    {entries.map((entry) => (
                      <li key={entry.id}>
                        <button
                          onClick={() => restore(entry)}
                          className="w-full truncate rounded-lg border border-line bg-raised px-3 py-2 text-left text-[11px] text-muted transition hover:border-accent/50 hover:text-fg"
                          title={summarize(entry)}
                        >
                          {summarize(entry)}
                        </button>
                      </li>
                    ))}
                    <li>
                      <button
                        onClick={clear}
                        className="text-[11px] text-danger/80 transition hover:text-danger"
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
    </div>
  );
}

// text-base on mobile keeps iOS Safari from zooming in when a field is focused.
const fieldClass =
  "h-10 rounded-xl border border-edge bg-raised px-3 text-base text-fg shadow-field outline-none transition placeholder:text-faint hover:border-accent/40 focus:border-accent focus:bg-panel focus:shadow-none focus:ring-2 focus:ring-accent/20 sm:text-[13px]";

const secondaryButtonClass =
  "rounded-xl border border-edge bg-panel px-4 py-2.5 text-[13px] font-medium text-muted shadow-sm transition hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent";

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M2.5 4h11M6 4V2.5h4V4M4 4l.7 9.5h6.6L12 4M6.6 6.5v5M9.4 6.5v5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
        className={`mt-1 text-right font-mono text-[10px] ${
          count >= limit ? "text-accent" : "text-faint"
        }`}
      >
        {count}/{limit}
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
        className="h-3.5 w-3.5 accent-accent"
      />
      {label}
    </label>
  );
}

function Section({
  index,
  label,
  hint,
  children,
}: {
  index?: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-3.5 py-3.5">
      <div className="mb-2 flex items-center justify-between">
        <h2
          className={
            index
              ? "flex items-center gap-1.5 text-[12px] font-medium text-fg"
              : "text-[11px] font-medium text-muted"
          }
        >
          {index && <span className="text-accent">{index}</span>}
          {label}
        </h2>
        {hint && (
          <span className="font-mono text-[10px] text-faint">{hint}</span>
        )}
      </div>
      {children}
    </section>
  );
}
