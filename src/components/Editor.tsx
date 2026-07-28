"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PRESETS, PRESET_CATEGORIES, type Preset } from "@/lib/presets";
import { THEMES } from "@/lib/themes";
import { CANVAS_FONTS, type CanvasFontId } from "@/lib/fonts";
import {
  WORDMARK,
  drawFormula,
  hashtagText,
  renderToBlob,
  type RenderOptions,
} from "@/lib/render";
import {
  DEFAULT_CONFIG,
  LAYOUTS,
  LIMITS,
  MARGIN_SCALE,
  MAX_ELEMENTS,
  OPERATORS,
  RELATIONS,
  SIZES,
  TEXT_SCALE,
  getSize,
  type FormulaConfig,
  type Operator,
} from "@/lib/types";
import { SHARE_HASHTAGS } from "@/lib/site";
import { HISTORY_LIMIT, useHistory, type HistoryEntry } from "@/hooks/useHistory";
import { useDraft } from "@/hooks/useDraft";
import { useSupporter } from "@/hooks/useSupporter";
import { useGallery } from "@/hooks/useGallery";
import { GALLERY_LIMIT, galleryText, relativeTime, type GalleryItem } from "@/lib/gallery";

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
    config.hashtags,
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
  const [canCopy, setCanCopy] = useState(false);
  const [customOps, setCustomOps] = useState<boolean[]>([]);
  const [customRelation, setCustomRelation] = useState(false);
  const [justUpdated, setJustUpdated] = useState(false);
  const [makePublic, setMakePublic] = useState(false);
  const [keepHistory, setKeepHistory] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { entries, save, clear, summarize } = useHistory();
  const gallery = useGallery();
  const supporter = useSupporter();

  const adoptConfig = useCallback((next: FormulaConfig) => {
    setConfig(next);
    setCustomOps(
      next.elements.map((element) => !!element.op && !isPresetOperator(element.op)),
    );
    setCustomRelation(!isPresetRelation(next.relation || "＝"));
  }, []);

  const { remember, forget } = useDraft(adoptConfig);

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

  // On phones the preview sits above the fields, so a short highlight makes it
  // obvious that typing changed the image.
  useEffect(() => {
    setJustUpdated(true);
    const timer = window.setTimeout(() => setJustUpdated(false), 450);
    return () => window.clearTimeout(timer);
  }, [config]);

  useEffect(() => {
    if (!status) return;
    const timer = window.setTimeout(() => setStatus(null), 4000);
    return () => window.clearTimeout(timer);
  }, [status]);

  const update = useCallback((patch: Partial<FormulaConfig>) => {
    setConfig((previous) => ({ ...previous, ...patch }));
  }, []);

  useEffect(() => remember(config), [config, remember]);

  // The gold lockup is only offered while the supporter window is open.
  useEffect(() => {
    if (!supporter.active && config.premiumLogo) update({ premiumLogo: false });
  }, [supporter.active, config.premiumLogo, update]);

  const resetAll = () => {
    adoptConfig({
      ...DEFAULT_CONFIG,
      elements: DEFAULT_CONFIG.elements.map((element) => ({ ...element })),
    });
    forget();
    setStatus("入力を初期状態に戻しました");
  };

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

  const applyGalleryItem = (item: GalleryItem) => {
    update({
      resultText: item.resultText,
      relation: item.relation || "＝",
      subNote: item.subNote,
      elements: item.elements.map((element) => ({ ...element })),
    });
    setCustomOps(
      item.elements.map((element) => !!element.op && !isPresetOperator(element.op)),
    );
    setCustomRelation(!isPresetRelation(item.relation || "＝"));
    setStatus("みんなの作品をテンプレとして読み込みました");
  };

  const restore = (entry: HistoryEntry) => {
    update({
      resultText: entry.resultText,
      relation: entry.relation || "＝",
      subNote: entry.subNote,
      hashtags: entry.hashtags,
      author: entry.author,
      elements: entry.elements.map((element) => ({ ...element })),
    });
    setCustomOps(
      entry.elements.map(
        (element) => !!element.op && !isPresetOperator(element.op),
      ),
    );
    setCustomRelation(!isPresetRelation(entry.relation || "＝"));
    setStatus("履歴から読み込みました");
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

  /** Both destinations are the user's choice; nothing leaves the browser unless
   *  the public gallery is explicitly ticked. */
  const commit = () => {
    if (keepHistory) save(config);
    if (makePublic) void gallery.share(config);
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
    commit();
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

  const shareTags = () => {
    const own = hashtagText(config)
      .split(" ")
      .map((tag) => tag.replace(/^[#＃]/, ""))
      .filter(Boolean);
    return Array.from(new Set([...own, ...SHARE_HASHTAGS]));
  };

  const handleShare = async () => {
    const text = `${config.resultText} ${config.relation || "＝"} ${formulaText()}${
      config.subNote ? `\n\n${config.subNote}` : ""
    }`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text,
    )}&hashtags=${encodeURIComponent(shareTags().join(","))}`;
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
      commit();
      setStatus("画像をコピーしました");
    } catch {
      setStatus("このブラウザではコピーできません。保存をご利用ください");
    }
  };

  return (
    <>
      {supporter.justUnlocked && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-[#E4C97A] bg-[#FFF8E7] p-4 shadow-card">
          <span className="mt-0.5 text-[18px]" aria-hidden>
            ✦
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-[#7A5A10]">
              ご支援ありがとうございます。サポーター限定のゴールドロゴを解錠しました。
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-[#8A6A1C]">
              これから{Math.max(1, supporter.hoursLeft)}
              時間のあいだ、⑥の「ゴールドのロゴにする」をONにすると、画像のロゴが金色（✦
              SUPPORTER 付き）になります。設定はこのブラウザにだけ保存されます。
            </p>
          </div>
          <button
            onClick={supporter.dismiss}
            aria-label="このお知らせを閉じる"
            className="shrink-0 rounded-md px-2 py-1 text-[12px] text-[#8A6A1C] transition hover:bg-[#F3E3B8]"
          >
            閉じる
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[404px_minmax(0,1fr)] lg:items-start">
      <div className="order-2 min-w-0 divide-y divide-line rounded-2xl border border-line bg-panel shadow-card lg:order-none lg:col-start-1 lg:row-span-2 lg:row-start-1">
        <Section index="①" label="結果（左側）">
          <Field
            value={config.resultText}
            onChange={(value) => update({ resultText: value })}
            placeholder="例：伝えたい結論"
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
              className={`${fieldClass} w-[108px] shrink-0 px-2`}
            >
              {RELATIONS.map((relation) => (
                <option key={relation} value={relation}>
                  {relation}
                </option>
              ))}
              <option value={CUSTOM_OP}>直接入力</option>
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
            「A ＝ B × C」のような等式も、「A ＞ B」のような比較も作れます。
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
                    className={`${fieldClass} w-[94px] shrink-0 px-2`}
                  >
                    {index === 0 && <option value="">なし</option>}
                    {OPERATORS.map((op) => (
                      <option key={op} value={op}>
                        {op}
                      </option>
                    ))}
                    <option value={CUSTOM_OP}>直接入力</option>
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
                  <input
                    type="text"
                    value={element.text}
                    placeholder={`例：要素${index + 1}`}
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
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-faint transition hover:bg-danger/10 hover:text-danger disabled:cursor-not-allowed disabled:text-faint/35 disabled:hover:bg-transparent disabled:hover:text-faint/35"
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
              className="mt-1.5 w-full rounded-lg border border-edge py-2 text-[12px] font-medium text-muted transition hover:border-accent/50 hover:text-accent"
            >
              ＋ 要素を追加
            </button>
          )}
          <p className="mt-2 text-[11px] leading-snug text-faint">
            演算子はプルダウンから選べます。一覧にない記号は「直接入力」を選ぶと、1文字だけ自由に入力できます。
            <br />
            「（」「）」を選ぶと括弧になります（例：200 ＝（3 ＋ 7）× 20）。括弧を閉じるだけの行は、入力欄を空のままにしてください。
          </p>
        </Section>

        <Section index="④" label="補足（画像の下のメッセージ）">
          <Field
            value={config.subNote}
            onChange={(value) => update({ subNote: value })}
            placeholder={"例：※式の意味や注釈を一言で。\n長い文章も自動で折り返します。"}
            limit={LIMITS.subNote}
            multiline
          />
        </Section>

        <Section index="⑤" label="ハッシュタグ（画像の左下）">
          <Field
            value={config.hashtags}
            onChange={(value) => update({ hashtags: value })}
            placeholder="例：#ことばの方程式 #タグ"
            limit={LIMITS.hashtags}
          />
          <p className="mt-1 text-[11px] leading-snug text-faint">
            スペース区切りで複数入力できます。# は自動で付き、X への投稿文にも入ります。
          </p>
        </Section>

        <Section index="⑥" label="アカウント名 / クレジット">
          <Field
            value={config.author}
            onChange={(value) => update({ author: value })}
            placeholder="例：@your_account（空欄でもOK）"
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
            {supporter.active && (
              <>
                <Toggle
                  checked={config.premiumLogo}
                  onChange={(checked) => update({ premiumLogo: checked })}
                  label="ゴールドのロゴにする（サポーター限定）"
                />
                <p className="text-[11px] leading-snug text-[#8A6A1C]">
                  ✦ 解錠中：あと約{supporter.hoursLeft}
                  時間。ロゴが金色になり、「✦ SUPPORTER」が並びます。
                </p>
              </>
            )}
          </div>
        </Section>

        <Section index="⑦" label="保存と公開">
          <div className="space-y-2">
            <Toggle
              checked={keepHistory}
              onChange={setKeepHistory}
              label="この式を履歴に保存する（この端末だけ）"
            />
            {gallery.enabled ? (
              <Toggle
                checked={makePublic}
                onChange={setMakePublic}
                label="この式を「みんなの作品」に載せる（公開）"
              />
            ) : (
              <p className="text-[11px] leading-snug text-faint">
                「みんなの作品」への公開は準備中です。公開する式はいつでもご自身で選べます。
              </p>
            )}
          </div>
          <p className="mt-1.5 text-[11px] leading-snug text-faint">
            履歴は保存・シェアしたときに、直近{HISTORY_LIMIT}件までこのブラウザに残ります（テンプレとして再利用できます）。
            {gallery.enabled
              ? "公開にチェックしたときだけ、式の文字（結果・要素・補足・ハッシュタグ・クレジット）がみんなの作品に載ります。"
              : ""}
          </p>
        </Section>

        <div className="space-y-2 p-3.5">
          <button
            onClick={() => void handleShare()}
            className={`${actionButtonClass} w-full px-5 py-3.5 text-[14px]`}
          >
            画像を保存して X でシェア
          </button>
          <div
            className={`grid gap-2 ${canCopy ? "grid-cols-2" : "grid-cols-1"}`}
          >
            <button onClick={() => void handleDownload()} className={actionButtonClass}>
              画像を保存（PNG）
            </button>
            {canCopy && (
              <button onClick={() => void handleCopy()} className={actionButtonClass}>
                画像をコピー
              </button>
            )}
          </div>
          <p className="h-4 text-center text-[11px] text-accent">
            {status ?? ""}
          </p>
          <div className="flex items-center justify-between gap-2 border-t border-line pt-2.5">
            <p className="text-[11px] leading-snug text-faint">
              入力中の内容はこのブラウザに自動保存され、次に開いたときそのまま続けられます。
            </p>
            <button
              onClick={resetAll}
              className="shrink-0 rounded-md border border-edge px-2.5 py-1.5 text-[11px] font-medium text-muted transition hover:border-danger/50 hover:text-danger"
            >
              入力をリセット
            </button>
          </div>
        </div>
      </div>

      {/* On phones the preview is pinned under the header; the band behind it is
          opaque so scrolling content never shows through the gap. */}
      <div className="sticky top-0 z-10 order-1 -mx-4 min-w-0 bg-ink px-4 pb-2 pt-[48px] lg:static lg:order-none lg:col-start-2 lg:row-start-1 lg:mx-0 lg:bg-transparent lg:px-0 lg:pb-0 lg:pt-0">
        <div
          className={`rounded-2xl border bg-panel transition-shadow duration-300 ${
            justUpdated
              ? "border-accent/40 shadow-[0_6px_20px_rgba(11,107,203,0.16)]"
              : "border-line shadow-card"
          }`}
        >
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
            <span className="hidden font-mono text-[11px] text-faint sm:inline">
              {size.width} × {size.height} / @2x
            </span>
          </div>
          <div className="flex w-full items-center justify-center p-3 sm:p-8">
            <canvas
              ref={canvasRef}
              aria-label="生成された思考式の画像"
              className="max-h-[30vh] w-auto max-w-full rounded-lg border border-line shadow-lift transition-transform duration-300 sm:max-h-[42vh] lg:max-h-[58vh]"
            />
          </div>
          <p className="border-t border-line px-3 py-1.5 text-center text-[11px] text-faint lg:hidden">
            入力するとこのプレビューにすぐ反映されます（スクロールしても上に残ります）
          </p>
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
                自動はできる限り横1行。入り切らない式だけ上下に分けます。
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

          <Section
            label="微調整（自動レイアウトの上書き）"
            hint={
              config.textScale !== 1 || config.marginScale !== 1
                ? "調整中"
                : undefined
            }
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Slider
                label="文字の大きさ"
                value={config.textScale}
                range={TEXT_SCALE}
                onChange={(value) => update({ textScale: value })}
              />
              <Slider
                label="左右の余白"
                value={config.marginScale}
                range={MARGIN_SCALE}
                onChange={(value) => update({ marginScale: value })}
              />
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="text-[11px] leading-snug text-faint">
                文字数が多い式は自動で縮小されます。もう少し大きく／余白を狭くしたいときだけ動かしてください（はみ出す手前で自動的に止まります）。
              </p>
              <button
                onClick={() => update({ textScale: 1, marginScale: 1 })}
                disabled={config.textScale === 1 && config.marginScale === 1}
                className="shrink-0 rounded-md border border-edge px-2.5 py-1.5 text-[11px] font-medium text-muted transition hover:border-accent/50 hover:text-accent disabled:cursor-not-allowed disabled:border-line disabled:text-faint/50 disabled:hover:text-faint/50"
              >
                リセット
              </button>
            </div>
          </Section>

          <Section label="テンプレート（有名な方程式）">
            <div className="space-y-3">
              {PRESET_CATEGORIES.map((category) => (
                <div key={category}>
                  <p className="mb-1.5 text-[10px] font-semibold tracking-[0.06em] text-faint">
                    {category}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESETS.filter((preset) => preset.category === category).map(
                      (preset) => (
                        <button
                          key={preset.id}
                          onClick={() => applyPreset(preset)}
                          title={preset.subNote}
                          className={chipClass}
                        >
                          {preset.label}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section
            label="直近の履歴"
            hint={entries.length > 0 ? `${entries.length} / ${HISTORY_LIMIT}` : undefined}
          >
            {entries.length === 0 ? (
              <p className="text-[11px] text-faint">
                画像を保存すると、直近{HISTORY_LIMIT}件がここに残ります（テンプレとして使えます）。
              </p>
            ) : (
              <>
                <p className="mb-1.5 text-[11px] text-faint">
                  クリックすると、その式をテンプレとして読み込みます。
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {entries.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => restore(entry)}
                      className={`${chipClass} max-w-full truncate`}
                      title={summarize(entry)}
                    >
                      {summarize(entry)}
                    </button>
                  ))}
                </div>
                <button
                  onClick={clear}
                  className="mt-2 text-[11px] text-faint transition hover:text-danger"
                >
                  履歴を削除
                </button>
              </>
            )}
          </Section>

          {gallery.enabled && (
            <Section
              label={`みんなの作品（最新${GALLERY_LIMIT}件・リアルタイム）`}
              hint={gallery.items.length > 0 ? `${gallery.items.length}` : undefined}
            >
              {gallery.loading ? (
                <p className="text-[11px] text-faint">読み込み中…</p>
              ) : gallery.items.length === 0 ? (
                <p className="text-[11px] text-faint">
                  まだ公開された式はありません。上の⑦でチェックすると、ここに並びます。
                </p>
              ) : (
                <ul className="space-y-1">
                  {gallery.items.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => applyGalleryItem(item)}
                        className="flex w-full items-center justify-between gap-3 rounded-md border border-line bg-raised px-2.5 py-2 text-left transition hover:border-accent/50"
                        title={item.subNote || galleryText(item)}
                      >
                        <span className="min-w-0 flex-1 truncate text-[12px] text-fg">
                          {galleryText(item)}
                        </span>
                        <span className="shrink-0 text-[10px] text-faint">
                          {item.author ? `${item.author}・` : ""}
                          {relativeTime(item.createdAt)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          )}
        </div>
      </div>
      </div>
    </>
  );
}

// text-base on mobile keeps iOS Safari from zooming in when a field is focused.
const fieldClass =
  "h-10 rounded-lg border border-edge bg-raised px-3 text-base text-fg shadow-field outline-none transition placeholder:text-faint hover:border-accent/40 focus:border-accent focus:bg-panel focus:shadow-none focus:ring-2 focus:ring-accent/15 sm:text-[13px]";

const chipClass =
  "rounded-md border border-edge bg-panel px-2.5 py-1.5 text-[12px] text-muted transition hover:border-accent/50 hover:text-accent";

function Slider({
  label,
  value,
  range,
  onChange,
}: {
  label: string;
  value: number;
  range: { min: number; max: number; step: number };
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between text-[12px] text-muted">
        {label}
        <span className="font-mono text-[11px] text-faint">
          {Math.round(value * 100)}%
        </span>
      </span>
      <input
        type="range"
        min={range.min}
        max={range.max}
        step={range.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-edge accent-accent"
      />
    </label>
  );
}

const actionButtonClass =
  "rounded-lg bg-accent px-4 py-3 text-[13px] font-semibold text-white shadow-[0_2px_6px_rgba(11,107,203,0.22)] transition hover:bg-accentDark active:translate-y-px";

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
  multiline = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  limit: number;
  /** Long copy is easier to proofread in a box that grows downwards. */
  multiline?: boolean;
}) {
  const count = countOf(value);
  return (
    <div>
      {multiline ? (
        <textarea
          value={value}
          maxLength={limit}
          placeholder={placeholder}
          rows={3}
          onChange={(e) => onChange(e.target.value.replace(/\n/g, ""))}
          className={`${fieldClass} h-auto w-full resize-y py-2 leading-relaxed`}
        />
      ) : (
        <input
          type="text"
          value={value}
          maxLength={limit}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`${fieldClass} w-full`}
        />
      )}
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
              ? "flex items-center gap-1.5 text-[12px] font-semibold text-fg"
              : "text-[10px] font-semibold uppercase tracking-[0.08em] text-faint"
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
