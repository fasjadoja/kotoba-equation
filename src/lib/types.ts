/** Operators offered in the dropdown. Any single character can be typed instead. */
export const OPERATORS = ["×", "＋", "−", "÷", "＝", "⇒", "＞", "＜"] as const;

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

export const SIZES: CanvasSize[] = [
  { id: "x", label: "16:9", hint: "X / ブログ", width: 1200, height: 675 },
  { id: "note", label: "note", hint: "アイキャッチ", width: 1280, height: 670 },
  { id: "square", label: "1:1", hint: "Instagram", width: 1080, height: 1080 },
  { id: "portrait", label: "4:5", hint: "縦・フィード", width: 1080, height: 1350 },
  { id: "story", label: "9:16", hint: "TikTok / リール", width: 1080, height: 1920 },
];

export function getSize(id: SizeId): CanvasSize {
  return SIZES.find((s) => s.id === id) ?? SIZES[0];
}

export type FormulaConfig = {
  resultText: string;
  relation: string;
  elements: FormulaElement[];
  subNote: string;
  author: string;
  layoutId: LayoutId;
  showCopyright: boolean;
  themeId: string;
  fontId: "sans" | "mono";
  sizeId: SizeId;
  showWatermark: boolean;
};

export const MAX_ELEMENTS = 8;

export const LIMITS = {
  resultText: 24,
  element: 18,
  subNote: 56,
  author: 24,
  operator: 1,
  relation: 1,
} as const;

export const DEFAULT_CONFIG: FormulaConfig = {
  resultText: "人生の成果",
  relation: "＝",
  elements: [
    { op: "", text: "能力" },
    { op: "×", text: "熱量" },
    { op: "×", text: "考え方" },
  ],
  subNote: "※考え方（-100〜+100点）が全体の掛け算を決める",
  author: "@your_account",
  layoutId: "auto",
  showCopyright: false,
  themeId: "light",
  fontId: "sans",
  sizeId: "x",
  showWatermark: true,
};
