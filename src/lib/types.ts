/** Operators offered in the dropdown. Any single character can be typed instead. */
export const OPERATORS = ["×", "＋", "−", "÷", "＝", "⇒", "＞", "＜", "（", "）"] as const;

/** Grouping used by the dropdown so the brackets are easy to find. */
export const OPERATOR_GROUPS: { label: string; ops: string[] }[] = [
  { label: "計算", ops: ["×", "＋", "−", "÷"] },
  { label: "比較・展開", ops: ["＝", "⇒", "＞", "＜"] },
  { label: "括弧", ops: ["（", "）"] },
];

/** Brackets hug their neighbour instead of sitting on their own. */
export const OPEN_BRACKET = "（";
export const CLOSE_BRACKET = "）";

/** Relation between the left-hand result and the right-hand formula. */
export const RELATIONS = ["＝", "＞", "＜", "≧", "≦", "≠", "≒", "→"] as const;

export type Operator = string;

export type FormulaElement = {
  op: Operator;
  text: string;
};

/**
 * "auto" keeps short formulas such as 「1 ＜ 2」 on a single line and stacks
 * longer ones; the other two force a shape.
 */
export type LayoutId = "auto" | "inline" | "stack";

export const LAYOUTS: { id: LayoutId; label: string; hint: string }[] = [
  { id: "auto", label: "自動", hint: "短い式は横1行、長い式は上下" },
  { id: "inline", label: "横1行", hint: "1 ＜ 2 のように横一列" },
  { id: "stack", label: "上下", hint: "結果を上、要素を下に" },
];

export type SizeId = "x" | "square" | "note" | "portrait" | "story";

export type CanvasSize = {
  id: SizeId;
  label: string;
  hint: string;
  width: number;
  height: number;
};

/** 4:5 is the default: it is the largest image phone feeds show without cropping. */
export const RECOMMENDED_SIZE: SizeId = "portrait";

export const SIZES: CanvasSize[] = [
  { id: "portrait", label: "4:5", hint: "スマホ投稿の王道（X / Instagram）", width: 1080, height: 1350 },
  { id: "square", label: "1:1", hint: "Instagram の正方形", width: 1080, height: 1080 },
  { id: "story", label: "9:16", hint: "TikTok / リール / ストーリー", width: 1080, height: 1920 },
  { id: "x", label: "16:9", hint: "X / ブログの横長", width: 1200, height: 675 },
  { id: "note", label: "note", hint: "note のアイキャッチ", width: 1280, height: 670 },
];

export function getSize(id: SizeId): CanvasSize {
  return SIZES.find((s) => s.id === id) ?? SIZES[0];
}

export function isRecommendedSize(id: SizeId) {
  return id === RECOMMENDED_SIZE;
}

export type FormulaConfig = {
  resultText: string;
  relation: string;
  elements: FormulaElement[];
  subNote: string;
  hashtags: string;
  author: string;
  layoutId: LayoutId;
  showCopyright: boolean;
  themeId: string;
  fontId: "sans" | "mono";
  sizeId: SizeId;
  showWatermark: boolean;
  /** Gold supporter lockup, unlocked for a day after a donation. */
  premiumLogo: boolean;
  /** Manual nudges on top of the automatic fitting. 1 = automatic. */
  textScale: number;
  marginScale: number;
};

export const TEXT_SCALE = { min: 0.7, max: 1.4, step: 0.05 } as const;
export const MARGIN_SCALE = { min: 0.5, max: 1.5, step: 0.05 } as const;

export const MAX_ELEMENTS = 8;

export const LIMITS = {
  resultText: 50,
  element: 18,
  subNote: 140,
  hashtags: 40,
  author: 50,
  operator: 1,
  relation: 1,
} as const;

export const DEFAULT_CONFIG: FormulaConfig = {
  resultText: "元気",
  relation: "＝",
  elements: [
    { op: "", text: "睡眠" },
    { op: "＋", text: "ごはん" },
    { op: "＋", text: "日光" },
  ],
  subNote: "※どれか1つが0になるだけで、一日がしんどくなる",
  hashtags: "#ことばの方程式",
  author: "",
  layoutId: "auto",
  showCopyright: false,
  themeId: "light",
  fontId: "sans",
  sizeId: RECOMMENDED_SIZE,
  showWatermark: true,
  premiumLogo: false,
  textScale: 1,
  marginScale: 1,
};
