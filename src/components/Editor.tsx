"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DAILY_PRESET_COUNT,
  PRESET_CATEGORIES,
  dailyPresets,
  dayKey,
  type Preset,
  type PresetCategory,
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
  CheckIcon,
  ClockIcon,
  CopyIcon,
  ExpandIcon,
  FrameIcon,
  InfoIcon,
  PlusIcon,
  RefreshIcon,
  SaveIcon,
  SearchIcon,
  TrashIcon,
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

/** `null` draws from the whole stock; the rest are the shelves of the picker. */
const PRESET_SHELVES: (PresetCategory | null)[] = [null, ...PRESET_CATEGORIES];

/** The equation itself, so a card says more than its title. */
function presetSummary(preset: Preset) {
  const right = preset.elements
    .map((element) => `${element.op}${element.text}`)
    .join("");
  return `${preset.resultText} ${preset.relation ?? "＝"} ${right}`;
}

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
  const [presetShelf, setPresetShelf] = useState<PresetCategory | null>(null);
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
    setTodaysPresets(
      dailyPresets(
        dayKey(new Date()),
        DAILY_PRESET_COUNT,
        presetRound,
        presetShelf ?? undefined,
      ),
    );
  }, [presetRound, presetShelf]);

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
      // The site tag is part of the look, not something typed, so it survives.
      hashtags: DEFAULT_CONFIG.hashtags,
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
      hashtags: config.hashtags.trim() || DEFAULT_CONFIG.hashtags,
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
      .map((element) => (element.op ? `${element.op} ${element.text}` : element.text))
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
            <p className="text-[14px] font-semibold text-[#7A5A10]">
              ご支援ありがとうございます。チップを送った方限定の「{supporter.rule.label}」を解錠しました。
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-[#8A6A1C]">
              「ことばをそえる」の「{supporter.rule.label}にする」をONにすると、画像のロゴが変わります。
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
            className="shrink-0 rounded-md px-2 py-1 text-[13px] text-[#8A6A1C] transition hover:bg-[#F3E3B8]"
          >
            閉じる
          </button>
        </div>
      )}

      {/* On a desktop everything you edit stays in the left column so the
          preview can sit still in the right one while you type. */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(392px,41%)] lg:items-start lg:gap-5">
        <div className="order-2 min-w-0 space-y-4 lg:order-none lg:col-start-1 lg:row-start-1">
          <Card
            icon={<SearchIcon size={17} />}
            title="テンプレートから始める"
            hint="選ぶとそのまま入力欄に入ります。自分のことばに書き換えて使えます"
          >
            <div className="relative">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ことばで探す（例：睡眠 / しあわせ / 会議）"
                className={`${fieldClass} w-full pl-10`}
              />
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint">
                <SearchIcon size={15} />
              </span>
            </div>

            {query.trim() ? (
              /* While there is a query the shelves step aside: one list of
                 matches is easier to scan than a list beside a grid. */
              hits.length === 0 ? (
                <p className="text-[13px] leading-relaxed text-muted">
                  一致する式が見つかりませんでした。ことばを短くするか、別の言い方でお試しください。
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {hits.map((hit) => (
                    <li key={`${hit.kind}-${hit.id}`}>
                      <button
                        onClick={() => applyHit(hit)}
                        title={hit.text}
                        className="flex w-full items-center gap-2.5 rounded-xl bg-raised px-3.5 py-3 text-left transition hover:bg-accentSoft"
                      >
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            hit.kind === "history"
                              ? "bg-accent text-white"
                              : "bg-panel text-muted"
                          }`}
                        >
                          {hit.kind === "history" ? "履歴" : "テンプレ"}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[14px] text-fg">
                          {hit.text}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )
            ) : (
              <>
                {/* The shelves run off the edge of a phone on purpose: a wrapped
                    block of twelve tabs would push the templates off-screen.
                    On wider screens they wrap and all stay in sight. */}
                <div className="scroll-row -mx-5 overflow-x-auto px-5 sm:mx-0 sm:overflow-visible sm:px-0">
                  <div className="flex w-max gap-1.5 pb-0.5 sm:w-auto sm:flex-wrap">
                    {PRESET_SHELVES.map((shelf) => {
                      const active = presetShelf === shelf;
                      return (
                        <button
                          key={shelf ?? "all"}
                          onClick={() => setPresetShelf(shelf)}
                          aria-pressed={active}
                          className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
                            active
                              ? "bg-fg text-white"
                              : "bg-raised text-muted hover:text-fg"
                          }`}
                        >
                          {shelf ?? "おすすめ"}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <ul className="grid gap-2 sm:grid-cols-2">
                  {todaysPresets.map((preset) => (
                    <li key={preset.id} className="min-w-0">
                      <button
                        onClick={() => applyPreset(preset)}
                        className="group flex h-full w-full flex-col gap-1 rounded-2xl bg-raised px-4 py-3 text-left transition hover:bg-accentSoft"
                      >
                        <span className="line-clamp-1 text-[14px] font-semibold leading-snug text-fg transition group-hover:text-accent">
                          {preset.label}
                        </span>
                        <span className="line-clamp-2 text-[12px] leading-relaxed text-muted">
                          {presetSummary(preset)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[12px] text-muted">
                    候補は1日に1回入れ替わります。
                  </p>
                  <button
                    onClick={() => setPresetRound((round) => round + 1)}
                    className={subtleButtonClass}
                  >
                    <RefreshIcon size={14} />
                    別の候補を見る
                  </button>
                </div>
              </>
            )}
          </Card>

          <Card
            step={1}
            title="式をつくる"
            hint="打ち込むと、プレビューがその場で変わります"
            action={
              <button onClick={confirmReset} className={resetButtonClass}>
                <TrashIcon size={14} />
                入力をリセット
              </button>
            }
          >
            <Group label="結果（左側）" note="いちばん伝えたい答え">
              <Field
                value={config.resultText}
                onChange={(value) => update({ resultText: value })}
                placeholder="例：元気（伝えたい結論）"
                limit={LIMITS.resultText}
              />
            </Group>

            <Group label="つなぐ記号" note="左と右の関係">
              <div className="flex flex-wrap items-center gap-2">
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
                  className={`${symbolChipClass(customRelation)} !w-auto shrink-0 whitespace-nowrap px-3.5 text-[13px]`}
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
                    className={`${fieldClass} w-[60px] shrink-0 px-2 text-center`}
                  />
                )}
              </div>
              <Hint>
                「A ＝ B × C」のような等式も、「A ＞ B」のような比較も。「その他」を選ぶと好きな記号を1文字入力できます。
              </Hint>
            </Group>

            <Group
              label="右側の要素"
              note="答えの理由になることば"
              action={
                <span className="font-mono text-[12px] text-muted">
                  {config.elements.length} / {MAX_ELEMENTS}
                </span>
              }
            >
              <div className="space-y-2">
                {config.elements.map((element, index) => {
                  const custom =
                    customOps[index] ??
                    (!!element.op && !isPresetOperator(element.op));
                  return (
                    <div key={index} className="flex items-center gap-2">
                      <span
                        className="w-4 shrink-0 text-center font-mono text-[12px] text-faint"
                        aria-hidden
                      >
                        {index + 1}
                      </span>
                      {/* The first element normally has nothing in front of it, so
                          the picker only appears once a bracket is asked for. */}
                      <div
                        className={`relative shrink-0 ${index === 0 && !leadOp ? "hidden" : ""}`}
                      >
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
                          className={`${fieldClass} w-[78px] appearance-none pl-3 pr-6 text-center text-[16px]`}
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
                          className={`${fieldClass} w-[50px] shrink-0 px-1 text-center font-mono`}
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
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-faint transition hover:bg-danger/10 hover:text-danger disabled:cursor-not-allowed disabled:text-faint/35 disabled:hover:bg-transparent disabled:hover:text-faint/35"
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={addElement}
                disabled={config.elements.length >= MAX_ELEMENTS}
                className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-control py-2.5 text-[13px] font-medium text-muted transition hover:border-accent hover:bg-accentSoft hover:text-accent disabled:cursor-not-allowed disabled:border-line disabled:text-faint/60 disabled:hover:border-line disabled:hover:bg-transparent disabled:hover:text-faint/60"
              >
                <PlusIcon size={15} />
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
                className="mt-2 text-[12px] text-muted underline-offset-2 transition hover:text-accent hover:underline"
              >
                {leadOp
                  ? "要素1の前の記号をなくす"
                  : "要素1の前にも記号を入れる（括弧など）"}
              </button>
              <Hint>
                2つ目以降の左のプルダウンは、その要素の前に入る記号です（計算 / 比較 / 括弧）。
                <br />
                括弧の例：200 ＝（3 ＋ 7）× 20　※「）」だけの行はことばを空に。
              </Hint>
            </Group>
          </Card>

          <Card step={2} title="ことばをそえる" hint="どれも省略できます">
            <Group label="補足" note="画像の下に入る一言">
              <Field
                value={config.subNote}
                onChange={(value) => update({ subNote: value })}
                placeholder={"例：※式の意味や注釈を一言で。\n長い文章も自動で折り返します。"}
                limit={LIMITS.subNote}
                multiline
              />
            </Group>

            <Group label="ハッシュタグ" note="画像の左下に入ります">
              <Field
                value={config.hashtags}
                onChange={(value) => update({ hashtags: value })}
                placeholder="例：#ことばの方程式 #タグ"
                limit={LIMITS.hashtags}
              />
              <Hint>
                スペース区切りで複数入力できます。# は自動で付き、X への投稿文にも入ります。
                <br />
                「#ことばの方程式」は最初から入っています。不要なら消してください。
              </Hint>
            </Group>

            <Group label="アカウント名・ロゴ" note="画像の右下と左上">
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
                      label={`${unlockRule.label}にする（チップを送った方限定）`}
                      disabled={!config.showWatermark}
                    />
                    <p className="text-[12px] leading-snug text-[#8A6A1C]">
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
            </Group>
          </Card>

          <Card step={3} title="見た目をととのえる" hint="迷ったらそのままでOK">
            <div className="grid gap-5 sm:grid-cols-2">
              <Group label="書体">
                <div className="grid grid-cols-2 gap-2">
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
              </Group>

              <Group label="配色">
                <div className="grid grid-cols-3 gap-2">
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => update({ themeId: theme.id })}
                      aria-pressed={config.themeId === theme.id}
                      className={`${choiceClass(config.themeId === theme.id)} flex items-center justify-center gap-2 px-2`}
                    >
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full border border-black/15"
                        style={{ backgroundColor: theme.swatch }}
                      />
                      {theme.name}
                    </button>
                  ))}
                </div>
              </Group>

              <div className="sm:col-span-2">
                <Group label="ならべ方">
                  <div className="grid grid-cols-3 gap-2 sm:max-w-md">
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
                </Group>
              </div>
            </div>

            <Group
              label="微調整"
              note="自動レイアウトの上書き"
              action={
                <button
                  onClick={() => update({ textScale: 1, marginScale: 1 })}
                  disabled={config.textScale === 1 && config.marginScale === 1}
                  className={`${subtleButtonClass} disabled:cursor-not-allowed disabled:border-line disabled:text-faint/60 disabled:hover:border-line disabled:hover:text-faint/60`}
                >
                  もとに戻す
                </button>
              }
            >
              <div className="grid gap-4 sm:grid-cols-2">
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
              <Hint>
                文字数が多い式は自動で縮小されます。もう少し大きく／余白を狭くしたいときだけ動かしてください（はみ出す手前で自動的に止まります）。
              </Hint>
            </Group>
          </Card>

          {/* The last step of the whole tool, so it sits after every setting
              instead of in the middle of the form. */}
          <Card step={4} title="画像を書き出す" hint="コピーすればそのまま投稿に貼れます">
            {/* Copying straight into a post is the most common finish, so it
                leads; X only opens a compose window, so it sits last. */}
            <div className="grid gap-2 sm:grid-cols-[1.4fr_1fr_1fr]">
              {canCopy && (
                <button
                  onClick={() => void handleCopy()}
                  className={`${primaryButtonClass} w-full px-5 py-3.5 text-[15px]`}
                >
                  <CopyIcon size={16} />
                  画像をコピー
                </button>
              )}
              <button
                onClick={() => void handleDownload()}
                className={
                  canCopy
                    ? `${secondaryButtonClass} w-full`
                    : `${primaryButtonClass} w-full px-5 py-3.5 text-[15px]`
                }
              >
                <SaveIcon size={16} />
                {saveLabel}
              </button>
              <button
                onClick={() => void handleShare()}
                className={`${quietButtonClass} w-full`}
              >
                <XIcon size={15} />X でシェア
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line pt-3.5">
              {/* Two explicit choices read faster than one checkbox whose
                  unchecked meaning has to be inferred. */}
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-muted">この式を履歴に</span>
                <div className="inline-flex gap-1 rounded-full bg-raised p-1">
                  <button
                    onClick={() => setKeepHistory(true)}
                    aria-pressed={keepHistory}
                    className={segmentClass(keepHistory)}
                  >
                    残す
                  </button>
                  <button
                    onClick={() => setKeepHistory(false)}
                    aria-pressed={!keepHistory}
                    className={segmentClass(!keepHistory)}
                  >
                    残さない
                  </button>
                </div>
              </div>
              {/* Publishing is a separate, deliberate press: everything else on
                  this page keeps the text inside the browser. */}
              {wall.enabled && (
                <button
                  onClick={() => void handlePublish()}
                  disabled={publishing}
                  className={`${subtleButtonClass} disabled:cursor-not-allowed disabled:text-faint/60`}
                >
                  <UsersIcon size={13} />
                  {publishing ? "公開しています…" : "みんなの式に載せる（任意）"}
                </button>
              )}
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-muted">
              履歴はこの端末のブラウザにだけ、直近{HISTORY_LIMIT}件まで残ります。
              {wall.enabled &&
                "「みんなの式に載せる」を押したときだけ、ことばが公開されます（名前・画像・履歴は送られません）。"}
            </p>
          </Card>

          <Card
            icon={<ClockIcon size={17} />}
            title="あとから使う"
            tone="info"
            hint="この端末に残った式と、公開された式"
          >
            <Group
              label="直近の履歴"
              action={
                entries.length > 0 ? (
                  <button
                    onClick={clear}
                    className="text-[12px] text-muted transition hover:text-danger"
                  >
                    履歴を削除
                  </button>
                ) : undefined
              }
            >
              {entries.length === 0 ? (
                <p className="text-[12px] text-muted">
                  画像を保存すると、この端末に最大{HISTORY_LIMIT}件が残ります（テンプレとして使えます）。
                </p>
              ) : (
                <>
                  <p className="mb-2 text-[12px] text-muted">
                    クリックすると、その式をテンプレとして読み込みます。
                    {entries.length > HISTORY_VISIBLE &&
                      `新しい${HISTORY_VISIBLE}件だけを表示しています（残りは上の検索から）。`}
                  </p>
                  <div className="flex flex-wrap gap-2">
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
                </>
              )}
            </Group>

            {wall.enabled && (
              <Group label="みんなの式" note="ほかの人が公開したもの">
                {wall.loading ? (
                  <p className="text-[12px] text-muted">読み込んでいます…</p>
                ) : wall.items.length === 0 ? (
                  <p className="text-[12px] text-muted">
                    まだ公開された式がありません。「画像を書き出す」から公開できます。
                  </p>
                ) : (
                  <>
                    <p className="mb-2 text-[12px] text-muted">
                      クリックすると、その式を下書きとして読み込みます（読みやすい式だけを選んで表示しています）。
                    </p>
                    <div className="flex flex-wrap gap-2">
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
              </Group>
            )}
          </Card>

          <p className="px-1 text-[12px] leading-relaxed text-muted">
            入力中の内容はこのブラウザに自動保存され、次に開いたときそのまま続けられます。
          </p>
        </div>

        {/* On phones the preview is pinned under the header; the band behind it is
            opaque so scrolling content never shows through the gap. */}
        <div className="sticky top-[52px] z-10 order-1 -mx-4 min-w-0 bg-ink px-4 pb-2 pt-2 lg:order-none lg:col-start-2 lg:row-start-1 lg:mx-0 lg:self-start lg:bg-transparent lg:px-0 lg:pb-0 lg:pt-0 lg:top-[72px]">
          <div
            className={`rounded-card bg-panel transition-shadow duration-300 ${
              justUpdated
                ? "shadow-[0_0_0_1.5px_rgba(0,113,227,0.5)]"
                : "shadow-card"
            }`}
          >
            {/* One recommended size is enough for most posts, so the rest stay
                behind a disclosure instead of a row of five choices. */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3.5 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accentSoft px-2.5 py-1 text-[13px] font-semibold text-accent">
                  <FrameIcon size={14} />
                  {size.label}
                </span>
                <span className="hidden truncate text-[12px] text-muted sm:block">
                  {isRecommendedSize(config.sizeId) ? "スマホ投稿の王道サイズ" : size.hint}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={openZoom} className={`${subtleButtonClass} px-3`}>
                  <ExpandIcon size={14} />
                  拡大
                </button>
                <button
                  onClick={() => setShowSizes((previous) => !previous)}
                  aria-expanded={showSizes}
                  className={`${subtleButtonClass} px-3`}
                >
                  <span>
                    サイズ<span className="hidden sm:inline">を変える</span>
                  </span>
                </button>
                {/* Folding the pinned preview away gives the form the whole
                    screen while typing on a phone. */}
                <button
                  onClick={() => setHidePreview((previous) => !previous)}
                  aria-expanded={!hidePreview}
                  className={`${subtleButtonClass} px-3 lg:hidden`}
                >
                  {hidePreview ? "ひらく" : "たたむ"}
                </button>
              </div>
            </div>
            {showSizes && (
              <div className="border-b border-line px-3.5 py-2.5">
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => update({ sizeId: item.id })}
                      aria-pressed={config.sizeId === item.id}
                      title={item.hint}
                      className={`${choiceClass(config.sizeId === item.id)} py-2`}
                    >
                      {item.label}
                      {item.id === RECOMMENDED_SIZE && (
                        <span className="ml-1.5 text-[11px] text-muted">王道</span>
                      )}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[12px] leading-snug text-muted">
                  迷ったら 4:5 のままでOK。ストーリーやTikTokは 9:16、ブログの見出し画像は 16:9 が向いています。
                </p>
              </div>
            )}
            <div
              className={`w-full items-center justify-center p-3 sm:p-6 lg:p-7 ${hidePreview ? "hidden lg:flex" : "flex"}`}
            >
              <button
                onClick={openZoom}
                aria-label="プレビューを拡大して見る"
                className="group relative flex max-w-full cursor-zoom-in items-center justify-center"
              >
                <canvas
                  ref={canvasRef}
                  aria-label="生成された思考式の画像"
                  className="max-h-[30vh] w-auto max-w-full rounded-xl shadow-lift transition-transform duration-300 group-hover:scale-[1.01] sm:max-h-[42vh] lg:max-h-[52vh]"
                />
                <span className="pointer-events-none absolute bottom-2 right-2 hidden items-center gap-1 rounded-full bg-fg/70 px-2 py-1 text-[11px] font-medium text-white opacity-0 transition group-hover:opacity-100 sm:inline-flex">
                  <ExpandIcon size={12} />
                  拡大
                </span>
              </button>
            </div>
            {/* The pinned preview is the point of this card on a phone, so the
                buttons stay folded until someone asks for them. */}
            <div
              className={`border-t border-line px-3 py-2 lg:hidden ${hidePreview ? "hidden" : ""}`}
            >
              {pinActions ? (
                <div className="flex items-center gap-2">
                  {canCopy && (
                    <button
                      onClick={() => void handleCopy()}
                      className={`${primaryButtonClass} flex-1 px-3 py-2.5 text-[13px]`}
                    >
                      <CopyIcon size={15} />
                      画像をコピー
                    </button>
                  )}
                  <button
                    onClick={() => void handleDownload()}
                    className={
                      canCopy
                        ? `${secondaryButtonClass} shrink-0 px-3 py-2.5 text-[13px]`
                        : `${primaryButtonClass} flex-1 px-3 py-2.5 text-[13px]`
                    }
                  >
                    <SaveIcon size={15} />
                    {saveLabel}
                  </button>
                  <button
                    onClick={() => setPinActions(false)}
                    aria-label="ボタンをたたむ"
                    className="shrink-0 rounded-full px-2 py-2 text-[13px] text-muted transition hover:text-fg"
                  >
                    ▲
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setPinActions(true)}
                  aria-expanded={false}
                  className="w-full rounded-full py-1.5 text-[12px] font-medium text-muted transition hover:text-fg"
                >
                  保存・コピーのボタンを出す ▼
                </button>
              )}
            </div>
            {/* On a desktop the export buttons follow the preview so they are
                reachable without scrolling back down the form. */}
            <div className="hidden border-t border-line px-3.5 py-3 lg:block">
              <div className="flex items-center gap-2">
                {canCopy && (
                  <button
                    onClick={() => void handleCopy()}
                    className={`${primaryButtonClass} flex-1`}
                  >
                    <CopyIcon size={16} />
                    画像をコピー
                  </button>
                )}
                <button
                  onClick={() => void handleDownload()}
                  className={
                    canCopy
                      ? `${secondaryButtonClass} shrink-0`
                      : `${primaryButtonClass} flex-1`
                  }
                >
                  <SaveIcon size={16} />
                  {saveLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* One place for feedback, pinned to the viewport so it is seen wherever
          the button that caused it was pressed. */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-4"
      >
        {status && (
          <p
            className={`flex max-w-md items-center gap-2 rounded-full px-4 py-2.5 text-[13px] leading-snug shadow-lift ${
              status.tone === "ok"
                ? "bg-fg text-white"
                : "bg-danger text-white"
            }`}
          >
            {status.tone === "ok" ? <CheckIcon size={15} /> : <AlertIcon size={15} />}
            <span className="min-w-0">{status.text}</span>
          </p>
        )}
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
// A hairline border is all that separates a field from the white card behind
// it; the ring appears only on focus.
const fieldClass =
  "h-11 rounded-xl border border-control bg-panel px-3.5 text-base text-fg outline-none transition placeholder:text-faint hover:border-faint focus:border-accent focus:ring-[3px] focus:ring-accent/25 sm:text-[15px]";

/** Destructive actions are the only red text on the page. */
const resetButtonClass =
  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium text-danger transition hover:bg-danger/10";

/** Quiet grey pill for the small actions that sit next to a heading. */
const subtleButtonClass =
  "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-raised px-3.5 py-1.5 text-[12px] font-medium text-fg transition hover:bg-edge/60";

const chipClass =
  "rounded-full bg-raised px-3.5 py-2 text-[13px] font-medium text-fg transition hover:bg-accentSoft hover:text-accent";

/** Square, glyph-first button used for the relation symbols. */
function symbolChipClass(active: boolean) {
  return `flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-[17px] font-medium transition ${
    active
      ? "border-accent bg-accentSoft text-accent"
      : "border-transparent bg-raised text-fg hover:bg-edge/60"
  }`;
}

/** Same treatment for every 「選ぶ」 button (font, layout, theme, size). */
function choiceClass(active: boolean) {
  return `rounded-xl border px-3 py-2.5 text-[13px] font-medium transition ${
    active
      ? "border-accent bg-accentSoft text-accent"
      : "border-transparent bg-raised text-fg hover:bg-edge/60"
  }`;
}

/** Two halves of one switch, so the unchosen side still reads as available. */
function segmentClass(active: boolean) {
  return `rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
    active ? "bg-panel text-fg shadow-card" : "text-muted hover:text-fg"
  }`;
}

/**
 * Secondary copy lives behind a disclosure: the people who need it can open it,
 * everyone else keeps a shorter form.
 */
function Hint({
  children,
  label = "詳しい説明",
}: {
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <details className="mt-2">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-[12px] font-medium text-muted transition hover:text-accent">
        <InfoIcon size={13} />
        {label}
      </summary>
      <div className="mt-1.5 text-[12px] leading-relaxed text-muted">{children}</div>
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
      <span className="flex items-baseline justify-between text-[13px] text-fg">
        {label}
        <span className="font-mono text-[12px] text-muted">
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
        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-edge accent-accent"
      />
    </label>
  );
}

/** One filled button leads; the rest stay quiet so the main action is obvious. */
const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-accentDark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.99]";

const secondaryButtonClass =
  "inline-flex items-center justify-center gap-1.5 rounded-full bg-raised px-5 py-3 text-[15px] font-semibold text-fg transition hover:bg-edge/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.99]";

const quietButtonClass =
  "inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-3 text-[14px] font-medium text-muted transition hover:bg-raised hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

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
          className={`${fieldClass} !h-auto w-full resize-y py-2.5 leading-relaxed`}
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
        className={`mt-1 text-right font-mono text-[11px] ${
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
      className={`flex items-center gap-2.5 rounded-xl bg-raised px-3.5 py-3 text-[14px] transition ${
        disabled ? "cursor-not-allowed text-faint" : "cursor-pointer text-fg hover:bg-edge/50"
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
 * One step of the tool. A numbered badge marks the steps that have to be worked
 * through in order; the helper cards carry an icon instead.
 */
function Card({
  step,
  icon,
  title,
  hint,
  action,
  tone = "input",
  children,
}: {
  step?: number;
  icon?: React.ReactNode;
  title: string;
  hint?: string;
  action?: React.ReactNode;
  tone?: "input" | "info";
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-card bg-panel shadow-card">
      <div className="flex items-center gap-2.5 px-5 pt-5 sm:px-7 sm:pt-6">
        {step !== undefined ? (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-[13px] font-semibold text-white">
            {step}
          </span>
        ) : (
          icon && (
            <span
              className={`shrink-0 ${tone === "input" ? "text-accent" : "text-faint"}`}
            >
              {icon}
            </span>
          )
        )}
        <div className="min-w-0 flex-1">
          <h2 className="text-[17px] font-semibold leading-tight text-fg">{title}</h2>
        </div>
        {action}
      </div>
      {hint && (
        <p className="mt-1.5 px-5 text-[13px] leading-snug text-muted sm:px-7">{hint}</p>
      )}
      <div className="space-y-6 px-5 pb-6 pt-4 sm:px-7 sm:pb-7">{children}</div>
    </section>
  );
}

/** A labelled block inside a card: one label, one control, one optional note. */
function Group({
  label,
  note,
  action,
  children,
}: {
  label: string;
  note?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-end justify-between gap-2">
        <h3 className="text-[14px] font-semibold text-fg">
          {label}
          {note && (
            <span className="ml-2 text-[12px] font-normal text-faint">{note}</span>
          )}
        </h3>
        {action}
      </div>
      {children}
    </div>
  );
}
