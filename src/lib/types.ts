export type Operator = "×" | "＋" | "−" | "÷" | "⇒";

export const OPERATORS: Operator[] = ["×", "＋", "−", "÷", "⇒"];

export type FormulaElement = {
  op: Operator | "";
  text: string;
};

export type SizeId = "x" | "square" | "note";

export type CanvasSize = {
  id: SizeId;
  label: string;
  width: number;
  height: number;
};

export const SIZES: CanvasSize[] = [
  { id: "x", label: "X 横長", width: 1200, height: 675 },
  { id: "square", label: "正方形", width: 1080, height: 1080 },
  { id: "note", label: "note", width: 1280, height: 670 },
];

export function getSize(id: SizeId): CanvasSize {
  return SIZES.find((s) => s.id === id) ?? SIZES[0];
}

export type FormulaConfig = {
  resultText: string;
  elements: FormulaElement[];
  subNote: string;
  author: string;
  themeId: string;
  sizeId: SizeId;
  showWatermark: boolean;
};

export const MAX_ELEMENTS = 8;

export const DEFAULT_CONFIG: FormulaConfig = {
  resultText: "人生の成果",
  elements: [
    { op: "", text: "能力" },
    { op: "×", text: "熱量" },
    { op: "×", text: "考え方" },
  ],
  subNote: "※考え方（-100〜+100点）が全体の掛け算を決める",
  author: "@your_account",
  themeId: "light",
  sizeId: "x",
  showWatermark: true,
};
