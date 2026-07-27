export type Operator = "×" | "＋" | "−" | "÷" | "⇒";

export const OPERATORS: Operator[] = ["×", "＋", "−", "÷", "⇒"];

export type FormulaElement = {
  op: Operator | "";
  text: string;
};

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
  elements: FormulaElement[];
  subNote: string;
  author: string;
  showCopyright: boolean;
  themeId: string;
  fontId: "mincho" | "gothic";
  sizeId: SizeId;
  showWatermark: boolean;
};

export const MAX_ELEMENTS = 8;

export const LIMITS = {
  resultText: 24,
  element: 20,
  subNote: 60,
  author: 24,
} as const;

export const DEFAULT_CONFIG: FormulaConfig = {
  resultText: "人生の成果",
  elements: [
    { op: "", text: "能力" },
    { op: "×", text: "熱量" },
    { op: "×", text: "考え方" },
  ],
  subNote: "※考え方（-100〜+100点）が全体の掛け算を決める",
  author: "@your_account",
  showCopyright: false,
  themeId: "paper",
  fontId: "mincho",
  sizeId: "x",
  showWatermark: true,
};
