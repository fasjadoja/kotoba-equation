"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DAILY_PRESET_COUNT,
  dailyPresets,
  dayKey,
  type Preset,
} from "@/lib/presets";
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
  OPERATOR_GROUPS,
  RECOMMENDED_SIZE,
  RELATIONS,
  SIZES,
  TEXT_SCALE,
  getSize,
  isRecommendedSize,
  type FormulaConfig,
  type Operator,
} from "@/lib/types";
import { SHARE_HASHTAGS, SITE } from "@/lib/site";
import { galleryText, relativeTime, type GalleryItem } from "@/lib/gallery";
import {
  AlertIcon,
  BlocksIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  CopyIcon,
  EqualsIcon,
  ExpandIcon,
  FrameIcon,
  HashIcon,
  InfoIcon,
  LayoutIcon,
  NoteIcon,
  PaletteIcon,
  PlusIcon,
  RefreshIcon,
  SaveIcon,
  SearchIcon,
  SlidersIcon,
  TargetIcon,
  TrashIcon,
  TypeIcon,
  UserIcon,
  UsersIcon,
  XIcon,
} from "./icons";
import {
  HISTORY_LIMIT,
  HISTORY_VISIBLE,
  useHistory,
  type HistoryEntry,
} from "@/hooks/useHistory";
import { searchAll, type SearchHit } from "@/lib/search";
import PreviewDialog from "./PreviewDialog";
import { useDraft } from "@/hooks/useDraft";
import { useGallery } from "@/hooks/useGallery";
import { useSupporter } from "@/hooks/useSupporter";

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

/** Enough results to choose from without turning the panel into a page. */
const SEARCH_LIMIT = 12;

type Status = { text: string; tone: "ok" | "error" };

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

type SaveResult = "shared" | "downloaded" | "cancelled" | "failed";

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
  const [status, setStatus] = useState<Status | null>(null);
  const [canCopy, setCanCopy] = useState(false);
  const [canShareFiles, setCanShareFiles] = useState(false);
  const [customOps, setCustomOps] = useState<boolean[]>([]);
  const [customRelation, setCustomRelation] = useState(false);
  const [justUpdated, setJustUpdated] = useState(false);
  const [keepHistory, setKeepHistory] = useState(true);
  const [showSizes, setShowSizes] = useState(false);
  const [todaysPresets, setTodaysPresets] = useState<Preset[]>([]);
  const [presetRound, setPresetRound] = useState(0);
  const [query, setQuery] = useState("");
  const [showLeadOp, setShowLeadOp] = useState(false);
  const [pinActions, setPinActions] = useState(false);
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);
  const [hidePreview, setHidePreview] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { entries, save, clear, summarize } = useHistory();
  const wall = useGallery();
  const [publishing, setPublishing] = useState(false);
  const supporter = useSupporter();
  const unlockedRank = supporter.rank;
  const unlockRule = supporter.rule;

  const adoptConfig = useCallback((next: FormulaConfig) => {
    setConfig(next);
    setCustomOps(
      next.elements.map((element) => !!element.op && !isPresetOperator(element.op)),
    );
    setCustomRelation(!isPresetRelation(next.relation || "＝"));
  }, []);

  const { remember, forget } = useDraft(adoptConfig);

  const hits = useMemo(() => searchAll(entries, query, SEARCH_LIMIT), [entries, query]);

  const leadOp = showLeadOp || !!config.elements[0]?.op;
  const saveLabel = canShareFiles ? "写真に保存" : "PNGで保存";

  const size = useMemo(() => getSize(config.sizeId), [config.sizeId]);
  const renderOptions = RENDER_OPTIONS[config.fontId];

  // Seeded on the browser's calendar day, so the set rotates at local midnight
  // without making the server and the client render different markup.
  useEffect(() => {
    setTodaysPresets(dailyPresets(dayKey(new Date()), DAILY_PRESET_COUNT, presetRound));
  }, [presetRound]);

  useEffect(() => {
    setCanCopy(
      typeof window !== "undefined" &&
        typeof window.ClipboardItem !== "undefined" &&
        typeof navigator.clipboard?.write === "function",
    );
    setCanShareFiles(
      typeof navigator !== "undefined" &&
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({
          files: [new File([], "formula.png", { type: "image/png" })],
        }),
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

  const notify = (text: string, tone: Status["tone"] = "ok") =>
    setStatus({ text, tone });

  useEffect(() => remember(config), [config, remember]);

  // A donor lockup only stays selected while that exact rank is unlocked, so
  // it disappears on its own once the days or the images run out.
  useEffect(() => {
    if (config.logoRank !== "brand" && supporter.rank !== config.logoRank) {
      update({ logoRank: "brand" });
    }
  }, [supporter.rank, config.logoRank, update]);

  // Clears what was typed and leaves the design choices (size, colours, font)
  // alone, so the button always does something visible.
  const resetAll = () => {
    adoptConfig({
      ...config,
      resultText: "",
      relation: DEFAULT_CONFIG.relation,
      elements: DEFAULT_CONFIG.elements.map((element) => ({
        ...element,
        text: "",
      })),
      subNote: "",
      hashtags: "",
      author: "",
      showCopyright: false,
    });
    setShowLeadOp(false);
    forget();
    notify("入力を空にしました");
  };

  // The button above the preview is easy to hit by accident, so it asks first
  // whenever there is something to lose.
  const confirmReset = () => {
    const hasInput =
      !!config.resultText.trim() ||
      config.elements.some((element) => !!element.text.trim()) ||
      !!config.subNote.trim();
    if (hasInput && !window.confirm("入力した内容をすべて消しますか？")) {
      return;
    }
    resetAll();
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

  /** Someone else's equation is a starting point, not their post: only the
      words come across, never the author line. */
  const adoptShared = (item: GalleryItem) => {
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
    notify("みんなの式を読み込みました。自由に書き換えてください");
  };

  const handlePublish = async () => {
    if (publishing) return;
    if (
      !window.confirm(
        "この式のことばを「みんなの式」に公開します（あとから消せません）。よろしいですか？",
      )
    ) {
      return;
    }
    setPublishing(true);
    const result = await wall.share(config);
    setPublishing(false);
    notify(
      result.ok ? "みんなの式に公開しました" : (result.reason ?? "公開できませんでした"),
      result.ok ? "ok" : "error",
    );
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
    notify("履歴から読み込みました");
  };

  const applyHit = (hit: SearchHit) => {
    if (hit.kind === "history") {
      restore(hit.entry);
      return;
    }
    applyPreset(hit.preset);
    notify("テンプレートを読み込みました");
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
    // The first row loses its operator above, so its "その他…" flag goes with it.
    setCustomOps((previous) => {
      const next = previous.filter((_, i) => i !== index);
      if (next.length > 0) next[0] = false;
      return next;
    });
  };

  /** Runs once per exported image: history, and the count of donor lockups. */
  const commit = () => {
    if (keepHistory) save(config);
    if (config.logoRank !== "brand") supporter.spend();
  };

  const fileName = () => `${config.resultText || "formula"}.png`;

  /**
   * Phones hide downloaded files inside a file manager, so the share sheet is
   * used instead: it offers "写真に保存" on iOS and the gallery on Android.
   */
  const saveImage = async (allowShare = true): Promise<SaveResult> => {
    await ensureFont(config);
    const blob = await renderToBlob(config, renderOptions);
    if (!blob) return "failed";
    const name = fileName();
    if (allowShare && canShareFiles) {
      const file = new File([blob], name, { type: "image/png" });
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: config.resultText });
          commit();
          return "shared";
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") {
            return "cancelled";
          }
          // Anything else (unsupported target, permission) falls back below.
        }
      }
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const supportsDownload = "download" in link;
    if (supportsDownload) {
      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } else {
      // iOS Safari < 13 and in-app browsers: show the image so it can be long-pressed.
      window.open(url, "_blank");
    }
    window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
    commit();
    return "downloaded";
  };

  const formulaText = () =>
    config.elements
      .map((element, index) =>
        index === 0 ? element.text : `${element.op} ${element.text}`,
      )
      .join(" ");

  const handleDownload = async () => {
    const result = await saveImage();
    if (result === "shared") notify("「画像を保存」を選ぶと写真に入ります");
    else if (result === "downloaded") notify("画像を保存しました");
    else if (result === "failed") notify("画像を生成できませんでした", "error");
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
    )}&hashtags=${encodeURIComponent(shareTags().join(","))}&url=${encodeURIComponent(
      SITE.url,
    )}`;
    const shareWindow = window.open(url, "_blank", "noopener,noreferrer");
    // X needs the file on the device, so this path always downloads.
    const ok = (await saveImage(false)) === "downloaded";
    if (!ok) {
      notify("画像を生成できませんでした", "error");
      return;
    }
    if (!shareWindow) {
      notify(
        "ポップアップがブロックされました。保存した画像を手動で投稿してください",
        "error",
      );
      return;
    }
    notify("画像を保存しました。Xの投稿画面に貼り付けてください");
  };

  const openZoom = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setZoomSrc(canvas.toDataURL("image/png"));
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
      notify("画像をコピーしました");
    } catch {
      notify("このブラウザではコピーできません。保存をご利用ください", "error");
    }
  };

  return (
    <>
      {supporter.justUnlocked && supporter.rule && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-[#E4C97A] bg-[#FFF8E7] p-4 shadow-card">
          <span className="mt-0.5 text-[18px]" aria-hidden>
            ✦
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-[#7A5A10]">
              ご支援ありがとうございます。寄付した方限定の「{supporter.rule.label}」を解錠しました。
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-[#8A6A1C]">
              ⑥の「{supporter.rule.label}にする」をONにすると、画像のロゴが変わります。
              {supporter.rule.exports === null
                ? `これから${Math.max(1, supporter.hoursLeft)}時間のあいだ使えます。`
                : `コピー・保存した画像${supporter.rule.exports}枚分まで、最長で${Math.max(
                    1,
                    Math.round(supporter.hoursLeft / 24),
                  )}日間の限定です。`}
              設定はこのブラウザにだけ保存されます。
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
      {/* On a desktop everything you edit stays in the left column so the
          preview can sit still in the right one while you type. */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(380px,42%)] lg:items-start">
      <div className="order-2 min-w-0 divide-y divide-line rounded-2xl border border-line bg-panel shadow-card lg:order-none lg:col-start-1 lg:row-start-1">
        <Section
          icon={<SearchIcon size={14} />}
          label="式をさがす（テンプレート・履歴）"
        >
          <div className="relative">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="例：睡眠 / しあわせ / 会議"
              className={`${fieldClass} w-full pl-9`}
            />
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint">
              <SearchIcon size={14} />
            </span>
          </div>
          {!query.trim() && (
            <p className="mt-2 text-[11px] text-faint">
              テンプレートと、この端末の履歴から探せます。
            </p>
          )}
          {query.trim() &&
            (hits.length === 0 ? (
              <p className="mt-2 text-[11px] text-faint">
                一致する式が見つかりませんでした。ことばを短くするか、別の言い方でお試しください。
              </p>
            ) : (
              <ul className="mt-2 space-y-1">
                {hits.map((hit) => (
                  <li key={`${hit.kind}-${hit.id}`}>
                    <button
                      onClick={() => applyHit(hit)}
                      title={hit.text}
                      className="flex w-full items-center gap-2 rounded-md border border-line bg-raised px-2.5 py-2 text-left transition hover:border-accent/50"
                    >
                      <span
                        className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                          hit.kind === "history"
                            ? "bg-accent/10 text-accent"
                            : "bg-panel text-faint"
                        }`}
                      >
                        {hit.kind === "history" ? "履歴" : "テンプレ"}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[12px] text-fg">
                        {hit.text}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ))}
          <Hint label="検索について">
            テンプレートとこの端末の履歴をまとめて探します。ひらがな・カタカナ・漢字の違いや、1文字くらいの打ち間違いは自動で吸収します（スペース区切りで複数のことばを指定すると、両方を含む式だけが残ります）。書きかけの式や、ことばになっていない履歴は結果に出ません。
          </Hint>
        </Section>

        <Section
          tone="info"
          icon={<CalendarIcon size={14} />}
          label="今日のテンプレート"
        >
          <div className="flex flex-wrap gap-1.5">
            {todaysPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                title={`${preset.resultText} ${preset.relation ?? "＝"} ${preset.elements
                  .map((element, index) => (index === 0 ? element.text : `${element.op}${element.text}`))
                  .join("")}`}
                className={chipClass}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <Hint label="テンプレートについて">
              1日に1回入れ替わります。クリックすると入力欄に読み込みます。「別のテンプレを見る」で、まだ見ていない候補を順に見られます。
            </Hint>
            <button
              onClick={() => setPresetRound((round) => round + 1)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md border-[1.5px] border-control px-2.5 py-1.5 text-[11px] font-medium text-fg transition hover:border-accent hover:text-accent"
            >
              <RefreshIcon size={13} />
              別のテンプレを見る
            </button>
          </div>
        </Section>

        {/* Starting over is a first move, not a last one, so it sits above the
            fields instead of below the export buttons. */}
        <div className="flex items-center justify-between gap-2 px-3.5 py-2.5">
          <p className="text-[11px] text-faint">入力（この端末に自動保存）</p>
          <button onClick={resetAll} className={`${resetButtonClass} shrink-0`}>
            <TrashIcon size={13} />
            入力をリセット
          </button>
        </div>

        <Section index="①" icon={<TargetIcon size={14} />} label="結果（左側）">
          <Field
            value={config.resultText}
            onChange={(value) => update({ resultText: value })}
            placeholder="例：A（伝えたい結論）"
            limit={LIMITS.resultText}
          />
        </Section>

        <Section
          index="②"
          icon={<EqualsIcon size={14} />}
          label="関係（左と右をつなぐ記号）"
        >
          <div className="flex flex-wrap items-center gap-1.5">
            {RELATIONS.map((relation) => (
              <button
                key={relation}
                onClick={() => {
                  setCustomRelation(false);
                  update({ relation });
                }}
                aria-pressed={!customRelation && config.relation === relation}
                aria-label={`関係記号 ${relation}`}
                className={symbolChipClass(
                  !customRelation && config.relation === relation,
                )}
              >
                {relation}
              </button>
            ))}
            <button
              onClick={() => {
                setCustomRelation(true);
                update({ relation: "" });
              }}
              aria-pressed={customRelation}
              className={`${symbolChipClass(customRelation)} w-auto px-3 text-[12px]`}
            >
              その他
            </button>
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
                className={`${fieldClass} w-[56px] shrink-0 px-2 text-center`}
              />
            )}
          </div>
          <Hint>
            「A ＝ B × C」のような等式も、「A ＞ B」のような比較も。「その他」を選ぶと好きな記号を1文字入力できます。
          </Hint>
        </Section>

        <Section
          index="③"
          icon={<BlocksIcon size={14} />}
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
                  <span
                    className="w-4 shrink-0 text-center font-mono text-[11px] text-faint"
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                  {/* The first element normally has nothing in front of it, so
                      the picker only appears once a bracket is asked for. */}
                  <div className={`relative shrink-0 ${index === 0 && !leadOp ? "hidden" : ""}`}>
                    <select
                      value={custom ? CUSTOM_OP : element.op}
                      onChange={(e) => {
                        const value = e.target.value;
                        setOperatorMode(index, value === CUSTOM_OP);
                        updateElement(index, {
                          op: value === CUSTOM_OP ? "" : value,
                        });
                      }}
                      aria-label={`要素 ${index + 1} の前の記号`}
                      className={`${fieldClass} w-[74px] appearance-none pl-3 pr-6 text-center text-[15px]`}
                    >
                      {index === 0 && <option value="">なし</option>}
                      {OPERATOR_GROUPS.map((group) => (
                        <optgroup key={group.label} label={group.label}>
                          {group.ops.map((op) => (
                            <option key={op} value={op}>
                              {op}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                      <option value={CUSTOM_OP}>その他…</option>
                    </select>
                    <ChevronIcon />
                  </div>
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
                    placeholder={`例：${String.fromCharCode(66 + (index % 25))}`}
                    aria-label={`要素 ${index + 1} のことば`}
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
                    <TrashIcon size={15} />
                  </button>
                </div>
              );
            })}
          </div>
          <button
            onClick={addElement}
            disabled={config.elements.length >= MAX_ELEMENTS}
            className="mt-1.5 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-dashed border-control py-2 text-[12px] font-medium text-muted transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:border-line disabled:text-faint/60 disabled:hover:border-line disabled:hover:text-faint/60"
          >
            <PlusIcon size={14} />
            {config.elements.length >= MAX_ELEMENTS
              ? `要素は${MAX_ELEMENTS}つまで`
              : "要素を追加"}
          </button>
          <button
            onClick={() => {
              if (leadOp) {
                setOperatorMode(0, false);
                updateElement(0, { op: "" });
              }
              setShowLeadOp(!leadOp);
            }}
            className="mt-1.5 text-[11px] text-faint transition hover:text-accent"
          >
            {leadOp ? "要素1の前の記号をなくす" : "要素1の前にも記号を入れる（括弧など）"}
          </button>
          <Hint>
            2つ目以降の左のプルダウンは、その要素の前に入る記号です（計算 / 比較 / 括弧）。
            <br />
            括弧の例：200 ＝（3 ＋ 7）× 20　※「）」だけの行はことばを空に。
          </Hint>
        </Section>

        <Section
          index="④"
          icon={<NoteIcon size={14} />}
          label="補足（画像の下のメッセージ）"
        >
          <Field
            value={config.subNote}
            onChange={(value) => update({ subNote: value })}
            placeholder={"例：※式の意味や注釈を一言で。\n長い文章も自動で折り返します。"}
            limit={LIMITS.subNote}
            multiline
          />
        </Section>

        <Section
          index="⑤"
          icon={<HashIcon size={14} />}
          label="ハッシュタグ（画像の左下）"
        >
          <Field
            value={config.hashtags}
            onChange={(value) => update({ hashtags: value })}
            placeholder="例：#ことばの方程式 #タグ"
            limit={LIMITS.hashtags}
          />
          <Hint>
            スペース区切りで複数入力できます。# は自動で付き、X への投稿文にも入ります。
          </Hint>
        </Section>

        <Section
          index="⑥"
          icon={<UserIcon size={14} />}
          label="アカウント名 / ロゴ"
        >
          <Field
            value={config.author}
            onChange={(value) => update({ author: value })}
            placeholder="例：@your_account（空欄でもOK）"
            limit={LIMITS.author}
          />
          <div className="mt-2.5 space-y-2">
            <Toggle
              checked={config.showWatermark}
              onChange={(checked) => update({ showWatermark: checked })}
              label="画像に「ことばの方程式」のロゴを入れる"
            />
            <Toggle
              checked={config.showCopyright}
              onChange={(checked) => update({ showCopyright: checked })}
              label={`© 表記を付ける（© ${new Date().getFullYear()} ${config.author || "you"}）`}
            />
            {unlockedRank && unlockRule && (
              <>
                <Toggle
                  checked={config.logoRank === unlockedRank}
                  onChange={(checked) =>
                    update({ logoRank: checked ? unlockedRank : "brand" })
                  }
                  label={`${unlockRule.label}にする（寄付した方限定）`}
                  disabled={!config.showWatermark}
                />
                <p className="text-[11px] leading-snug text-[#8A6A1C]">
                  ✦ 解錠中：
                  {supporter.left === null
                    ? `あと約${supporter.hoursLeft}時間`
                    : `のこり${supporter.left}枚（あと約${Math.max(
                        1,
                        Math.round(supporter.hoursLeft / 24),
                      )}日）`}
                  。書き出した画像の枚数ぶんだけ使えます。
                </p>
              </>
            )}
          </div>
          <Hint>
            ロゴは外せます。外すと左上に何も入らない画像になります（商用利用も自由です）。
          </Hint>
        </Section>

        <Section
          index="⑦"
          icon={<ClockIcon size={14} />}
          label="この式を履歴に残すか"
        >
          {/* Two explicit choices read faster than one checkbox whose unchecked
              meaning has to be inferred. */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setKeepHistory(true)}
              aria-pressed={keepHistory}
              className={`${choiceClass(keepHistory)} text-left leading-snug`}
            >
              履歴に残す
              <span className="mt-0.5 block text-[10px] font-normal text-faint">
                あとで呼び出せます
              </span>
            </button>
            <button
              onClick={() => setKeepHistory(false)}
              aria-pressed={!keepHistory}
              className={`${choiceClass(!keepHistory)} text-left leading-snug`}
            >
              残さない
              <span className="mt-0.5 block text-[10px] font-normal text-faint">
                保存しても記録しません
              </span>
            </button>
          </div>
          <Hint>
            履歴はこの端末のブラウザにだけ、直近{HISTORY_LIMIT}
            件まで残ります（サーバーには送られません）。画像を保存・コピー・シェアしたときに記録されます。
          </Hint>
        </Section>

        <div className="flex items-center justify-between gap-2 p-3.5">
          <p className="text-[11px] leading-snug text-faint">
            入力中の内容はこのブラウザに自動保存され、次に開いたときそのまま続けられます。
          </p>
          <button onClick={resetAll} className={`${resetButtonClass} shrink-0`}>
            <TrashIcon size={13} />
            リセット
          </button>
        </div>
      </div>

      {/* On phones the preview is pinned under the header; the band behind it is
          opaque so scrolling content never shows through the gap. */}
      <div className="sticky top-0 z-10 order-1 -mx-4 min-w-0 bg-ink px-4 pb-2 pt-[48px] lg:order-none lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:mx-0 lg:self-start lg:bg-transparent lg:px-0 lg:pb-0 lg:pt-4 lg:top-[44px]">
        <div
          className={`rounded-2xl border bg-panel transition-shadow duration-300 ${
            justUpdated
              ? "border-accent/40 shadow-[0_6px_20px_rgba(11,107,203,0.16)]"
              : "border-line shadow-card"
          }`}
        >
          {/* One recommended size is enough for most posts, so the rest stay
              behind a disclosure instead of a row of five choices. */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-[12px] font-semibold text-accent">
                <FrameIcon size={13} />
                {size.label}
              </span>
              <span className="truncate text-[11px] text-muted">
                {isRecommendedSize(config.sizeId) ? "スマホ投稿の王道サイズ" : size.hint}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden font-mono text-[11px] text-faint sm:inline">
                {size.width} × {size.height}
              </span>
              <button
                onClick={openZoom}
                className="inline-flex items-center gap-1.5 rounded-md border-[1.5px] border-control px-2.5 py-1 text-[11px] font-medium text-fg transition hover:border-accent hover:text-accent"
              >
                <ExpandIcon size={13} />
                拡大
              </button>
              <button
                onClick={() => setShowSizes((previous) => !previous)}
                aria-expanded={showSizes}
                className="rounded-md border-[1.5px] border-control px-2.5 py-1 text-[11px] font-medium text-fg transition hover:border-accent hover:text-accent"
              >
                サイズを変える
              </button>
              <button
                onClick={confirmReset}
                aria-label="入力をリセット"
                title="入力をリセット"
                className={resetButtonClass}
              >
                <TrashIcon size={13} />
                リセット
              </button>
              {/* Folding the pinned preview away gives the form the whole
                  screen while typing on a phone. */}
              <button
                onClick={() => setHidePreview((previous) => !previous)}
                aria-expanded={!hidePreview}
                className="rounded-md border-[1.5px] border-control px-2.5 py-1 text-[11px] font-medium text-fg transition hover:border-accent hover:text-accent lg:hidden"
              >
                {hidePreview ? "ひらく" : "たたむ"}
              </button>
            </div>
          </div>
          {showSizes && (
            <div className="border-b border-line px-3 py-2">
              <div className="flex flex-wrap gap-1.5">
                {SIZES.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => update({ sizeId: item.id })}
                    aria-pressed={config.sizeId === item.id}
                    title={item.hint}
                    className={`${choiceClass(config.sizeId === item.id)} py-1.5`}
                  >
                    {item.label}
                    {item.id === RECOMMENDED_SIZE && (
                      <span className="ml-1.5 text-[10px] text-faint">王道</span>
                    )}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[11px] leading-snug text-faint">
                迷ったら 4:5 のままでOK。ストーリーやTikTokは 9:16、ブログの見出し画像は 16:9 が向いています。
              </p>
            </div>
          )}
          <div
            className={`w-full items-center justify-center p-3 sm:p-8 ${hidePreview ? "hidden lg:flex" : "flex"}`}
          >
            <button
              onClick={openZoom}
              aria-label="プレビューを拡大して見る"
              className="group relative flex max-w-full cursor-zoom-in items-center justify-center"
            >
              <canvas
                ref={canvasRef}
                aria-label="生成された思考式の画像"
                className="max-h-[30vh] w-auto max-w-full rounded-lg border border-line shadow-lift transition-transform duration-300 group-hover:scale-[1.01] sm:max-h-[42vh] lg:max-h-[56vh]"
              />
              <span className="pointer-events-none absolute bottom-2 right-2 hidden items-center gap-1 rounded-full bg-ink/70 px-2 py-1 text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100 sm:inline-flex">
                <ExpandIcon size={11} />
                拡大
              </span>
            </button>
          </div>
          {/* The pinned preview is the point of this card on a phone, so the
              buttons stay folded until someone asks for them. */}
          <div
            className={`border-t border-line px-3 py-1.5 lg:hidden ${hidePreview ? "hidden" : ""}`}
          >
            {pinActions ? (
              <div className="flex items-center gap-2">
                {canCopy && (
                  <button
                    onClick={() => void handleCopy()}
                    className={`${primaryButtonClass} flex-1 px-3 py-2 text-[12px]`}
                  >
                    <CopyIcon size={14} />
                    画像をコピー
                  </button>
                )}
                <button
                  onClick={() => void handleDownload()}
                  className={
                    canCopy
                      ? `${secondaryButtonClass} shrink-0 px-3 py-2 text-[12px]`
                      : `${primaryButtonClass} flex-1 px-3 py-2 text-[12px]`
                  }
                >
                  <SaveIcon size={14} />
                  {saveLabel}
                </button>
                <button
                  onClick={() => setPinActions(false)}
                  aria-label="ボタンをたたむ"
                  className="shrink-0 rounded-md px-2 py-2 text-[12px] text-faint transition hover:text-accent"
                >
                  ▲
                </button>
              </div>
            ) : (
              <button
                onClick={() => setPinActions(true)}
                aria-expanded={false}
                className="w-full rounded-md py-1 text-[11px] font-medium text-muted transition hover:text-accent"
              >
                保存・コピーのボタンを出す ▼
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="order-3 min-w-0 lg:col-start-1 lg:row-start-2">
        <div className="divide-y divide-line rounded-2xl border border-line bg-panel shadow-card">
          <div className="grid sm:grid-cols-[190px_210px_minmax(0,1fr)] sm:divide-x sm:divide-line lg:grid-cols-2 xl:grid-cols-[190px_210px_minmax(0,1fr)]">
            <Section icon={<TypeIcon size={14} />} label="書体">
              <div className="grid grid-cols-2 gap-1.5">
                {(Object.keys(CANVAS_FONTS) as CanvasFontId[]).map((id) => (
                  <button
                    key={id}
                    onClick={() => update({ fontId: id })}
                    aria-pressed={config.fontId === id}
                    className={choiceClass(config.fontId === id)}
                  >
                    {CANVAS_FONTS[id].label}
                  </button>
                ))}
              </div>
            </Section>

            <Section icon={<LayoutIcon size={14} />} label="レイアウト">
              <div className="grid grid-cols-3 gap-1.5">
                {LAYOUTS.map((layout) => (
                  <button
                    key={layout.id}
                    onClick={() => update({ layoutId: layout.id })}
                    aria-pressed={config.layoutId === layout.id}
                    title={layout.hint}
                    className={`${choiceClass(config.layoutId === layout.id)} px-2`}
                  >
                    {layout.label}
                  </button>
                ))}
              </div>
              <Hint>自動はできる限り横1行。入り切らない式だけ上下に分けます。</Hint>
            </Section>

            {/* The narrower left column at lg cannot hold three swatches next
                to the other two settings, so it takes a row of its own. */}
            <div className="lg:col-span-2 xl:col-span-1">
            <Section icon={<PaletteIcon size={14} />} label="配色">
              <div className="grid max-w-md grid-cols-3 gap-1.5">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => update({ themeId: theme.id })}
                    aria-pressed={config.themeId === theme.id}
                    className={`${choiceClass(config.themeId === theme.id)} flex items-center justify-center gap-2 px-2`}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full border border-black/15"
                      style={{ backgroundColor: theme.swatch }}
                    />
                    {theme.name}
                  </button>
                ))}
              </div>
            </Section>
            </div>
          </div>

          <Section
            icon={<SlidersIcon size={14} />}
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
              <Hint>
                文字数が多い式は自動で縮小されます。もう少し大きく／余白を狭くしたいときだけ動かしてください（はみ出す手前で自動的に止まります）。
              </Hint>
              <button
                onClick={() => update({ textScale: 1, marginScale: 1 })}
                disabled={config.textScale === 1 && config.marginScale === 1}
                className="shrink-0 rounded-md border border-edge px-2.5 py-1.5 text-[11px] font-medium text-muted transition hover:border-accent/50 hover:text-accent disabled:cursor-not-allowed disabled:border-line disabled:text-faint/50 disabled:hover:text-faint/50"
              >
                リセット
              </button>
            </div>
          </Section>



          {wall.enabled && (
            <Section
              tone="info"
              icon={<UsersIcon size={14} />}
              label="みんなの式（ほかの人が公開したもの）"
            >
              {wall.loading ? (
                <p className="text-[11px] text-faint">読み込んでいます…</p>
              ) : wall.items.length === 0 ? (
                <p className="text-[11px] text-faint">
                  まだ公開された式がありません。⑧から公開できます。
                </p>
              ) : (
                <>
                  <p className="mb-1.5 text-[11px] text-faint">
                    クリックすると、その式を下書きとして読み込みます（読みやすい式だけを選んで表示しています）。
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {wall.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => adoptShared(item)}
                        className={`${chipClass} max-w-full truncate`}
                        title={`${galleryText(item)}（${relativeTime(item.createdAt)}）`}
                      >
                        {galleryText(item)}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </Section>
          )}

          <Section
            tone="info"
            icon={<ClockIcon size={14} />}
            label="直近の履歴"
            hint={entries.length > 0 ? `${entries.length} / ${HISTORY_LIMIT}` : undefined}
          >
            {entries.length === 0 ? (
              <p className="text-[11px] text-faint">
                画像を保存すると、この端末に最大{HISTORY_LIMIT}件が残ります（テンプレとして使えます）。
              </p>
            ) : (
              <>
                <p className="mb-1.5 text-[11px] text-faint">
                  クリックすると、その式をテンプレとして読み込みます。
                  {entries.length > HISTORY_VISIBLE &&
                    `新しい${HISTORY_VISIBLE}件だけを表示しています（残りは上の検索から）。`}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {entries.slice(0, HISTORY_VISIBLE).map((entry) => (
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

        </div>
      </div>

      {/* The last step of the whole tool, so it sits after every setting
          instead of in the middle of the form. */}
      <div className="order-4 min-w-0 lg:col-start-1 lg:row-start-3">
        <div className="rounded-2xl border border-line bg-panel shadow-card">
          <Section
            index="⑧"
            icon={<SaveIcon size={14} />}
            label="できた画像を使う"
          >
            {/* Copying straight into a post is the most common finish, so it
                leads; X only opens a compose window, so it sits last. */}
            <div className="grid gap-2 sm:grid-cols-[1.4fr_1fr_1fr]">
              {canCopy && (
                <button
                  onClick={() => void handleCopy()}
                  className={`${primaryButtonClass} w-full px-5 py-3.5 text-[14px]`}
                >
                  <CopyIcon size={15} />
                  画像をコピー
                </button>
              )}
              <button
                onClick={() => void handleDownload()}
                className={
                  canCopy
                    ? `${secondaryButtonClass} w-full`
                    : `${primaryButtonClass} w-full px-5 py-3.5 text-[14px]`
                }
              >
                <SaveIcon size={15} />
                {saveLabel}
              </button>
              <button
                onClick={() => void handleShare()}
                className={`${quietButtonClass} w-full`}
              >
                <XIcon size={14} />
                X でシェア
              </button>
            </div>
            {/* Publishing is a separate, deliberate press: everything else on
                this page keeps the text inside the browser. */}
            {wall.enabled && (
              <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-2.5">
                <button
                  onClick={() => void handlePublish()}
                  disabled={publishing}
                  className="inline-flex items-center gap-1.5 rounded-md border border-edge px-2.5 py-1.5 text-[11px] font-medium text-muted transition hover:border-accent/50 hover:text-accent disabled:cursor-not-allowed disabled:text-faint/60"
                >
                  <UsersIcon size={12} />
                  {publishing ? "公開しています…" : "みんなの式に載せる（任意）"}
                </button>
                <span className="text-[11px] text-faint">
                  ことばだけが公開されます。名前・画像・履歴は送られません。
                </span>
              </div>
            )}
            <div aria-live="polite" className="min-h-[28px]">
              {status && (
                <p
                  className={`mt-2 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] leading-snug ${
                    status.tone === "ok"
                      ? "bg-accent/8 text-accent"
                      : "bg-danger/8 text-danger"
                  }`}
                >
                  {status.tone === "ok" ? (
                    <CheckIcon size={13} />
                  ) : (
                    <AlertIcon size={13} />
                  )}
                  <span className="min-w-0">{status.text}</span>
                </p>
              )}
            </div>
          </Section>
        </div>
      </div>
      </div>
      {zoomSrc && (
        <PreviewDialog
          src={zoomSrc}
          width={size.width}
          height={size.height}
          sizeLabel={size.label}
          canCopy={canCopy}
          saveLabel={saveLabel}
          onCopy={() => void handleCopy()}
          onDownload={() => void handleDownload()}
          onClose={() => setZoomSrc(null)}
        />
      )}
    </>
  );
}

// text-base on mobile keeps iOS Safari from zooming in when a field is focused.
// A 1.5px control border plus the inset shadow is what separates a field from
// the white card behind it.
const fieldClass =
  "h-10 rounded-lg border-[1.5px] border-control bg-white px-3 text-base text-fg shadow-field outline-none transition placeholder:text-faint hover:border-accent/70 focus:border-accent focus:shadow-none focus:ring-[3px] focus:ring-accent/20 sm:text-[13px]";

/** Destructive actions share one red outline so they are never mistaken for
 *  the blue "choose this" controls. */
const resetButtonClass =
  "inline-flex items-center gap-1.5 rounded-md border-[1.5px] border-danger/40 bg-danger/5 px-2.5 py-1.5 text-[11px] font-medium text-danger transition hover:border-danger hover:bg-danger/10";

const chipClass =
  "rounded-md border-[1.5px] border-control bg-panel px-2.5 py-1.5 text-[12px] font-medium text-fg transition hover:border-accent hover:text-accent";

/** Square, glyph-first button used for the relation symbols. */
function symbolChipClass(active: boolean) {
  return `flex h-10 w-10 items-center justify-center rounded-lg border-[1.5px] text-[15px] font-medium transition ${
    active
      ? "border-accent bg-accent/10 text-accent shadow-[inset_0_0_0_1px_rgba(11,107,203,0.35)]"
      : "border-control bg-panel text-fg hover:border-accent hover:text-accent"
  }`;
}

/** Same treatment for every 「選ぶ」 button (font, layout, theme, size). */
function choiceClass(active: boolean) {
  return `rounded-lg border-[1.5px] px-3 py-2 text-[12px] font-medium transition ${
    active
      ? "border-accent bg-accent/10 text-accent shadow-[inset_0_0_0_1px_rgba(11,107,203,0.35)]"
      : "border-control bg-panel text-fg hover:border-accent hover:text-accent"
  }`;
}

/**
 * Secondary copy lives behind a disclosure: the people who need it can open it,
 * everyone else keeps a shorter form.
 */
function Hint({ children, label = "詳しい説明" }: { children: React.ReactNode; label?: string }) {
  return (
    <details className="mt-2">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-[11px] font-medium text-muted transition hover:text-accent">
        <InfoIcon size={12} />
        {label}
      </summary>
      <div className="mt-1.5 text-[11px] leading-snug text-faint">{children}</div>
    </details>
  );
}

function ChevronIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
      className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-faint"
    >
      <path
        d="M2.5 4.5 6 8l3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
        className="mt-1.5 h-2 w-full cursor-pointer appearance-none rounded-full bg-edge accent-accent"
      />
    </label>
  );
}

/** One filled button leads; the rest stay quiet so the main action is obvious. */
const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-[13px] font-semibold text-white shadow-[0_2px_6px_rgba(11,107,203,0.22)] transition hover:bg-accentDark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:translate-y-px";

const secondaryButtonClass =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-control bg-panel px-4 py-3 text-[13px] font-semibold text-fg transition hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:translate-y-px";

const quietButtonClass =
  "inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-[12px] font-medium text-muted transition hover:bg-raised hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

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
  disabled = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={`flex items-center gap-2 rounded-md border-[1.5px] border-control bg-panel px-2.5 py-2 text-[11px] transition ${
        disabled
          ? "cursor-not-allowed text-faint"
          : "cursor-pointer text-fg hover:border-accent/70"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 shrink-0 accent-accent"
      />
      {label}
    </label>
  );
}

/**
 * Icon colours follow one rule: blue for anything you fill in or choose, grey
 * for read-only lists. Gold is reserved for donations and red for destructive
 * actions, so the palette never grows past four meanings.
 */
function Section({
  index,
  icon,
  label,
  hint,
  tone = "input",
  children,
}: {
  index?: string;
  /** Small pictogram shown in a tinted tile, so sections are scannable. */
  icon?: React.ReactNode;
  label: string;
  hint?: string;
  tone?: "input" | "info";
  children: React.ReactNode;
}) {
  return (
    <section className="px-3.5 py-3.5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2
          className={`flex min-w-0 items-center gap-2 ${
            index
              ? "text-[12px] font-semibold text-fg"
              : "text-[11px] font-semibold text-muted"
          }`}
        >
          {icon && (
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                tone === "input" ? "bg-accent/10 text-accent" : "bg-raised text-faint"
              }`}
            >
              {icon}
            </span>
          )}
          <span className="truncate">
            {index && <span className="mr-1 text-accent">{index}</span>}
            {label}
          </span>
        </h2>
        {hint && (
          <span className="shrink-0 font-mono text-[10px] text-faint">{hint}</span>
        )}
      </div>
      {children}
    </section>
  );
}
