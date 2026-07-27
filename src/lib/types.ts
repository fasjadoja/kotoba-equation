export type Operator = "×" | "＋" | "−" | "÷" | "⇒";

export const OPERATORS: Operator[] = ["×", "＋", "−", "÷", "⇒"];

export type FormulaElement = {
  op: Operator | "";
  text: string;
};

export type AspectId = "16:9" | "1:1" | "4:5";

export type Aspect = {
  id: AspectId;
  label: string;
  hint: string;
  width: number;
  height: number;
  pro: boolean;
};

export const ASPECTS: Aspect[] = [
  { id: "16:9", label: "16:9", hint: "X / ブログ", width: 1200, height: 675, pro: false },
  { id: "1:1", label: "1:1", hint: "Instagram", width: 1080, height: 1080, pro: true },
  { id: "4:5", label: "4:5", hint: "縦長・保存されやすい", width: 1080, height: 1350, pro: true },
];

export type FormulaConfig = {
  resultText: string;
  elements: FormulaElement[];
  subNote: string;
  author: string;
  themeId: string;
  aspectId: AspectId;
  showWatermark: boolean;
};

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
  aspectId: "16:9",
  showWatermark: true,
};
