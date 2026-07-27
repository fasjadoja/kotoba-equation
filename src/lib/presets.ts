import type { FormulaElement } from "./types";

export type PresetCategory = "定番" | "ビジネス" | "自己啓発・キャリア" | "日常・価値観";

export type Preset = {
  id: string;
  category: PresetCategory;
  label: string;
  resultText: string;
  /** Defaults to 「＝」 when omitted. */
  relation?: string;
  subNote: string;
  elements: FormulaElement[];
};

/**
 * Well-known equations people already recognise: they explain the tool faster
 * than invented examples do.
 */
export const PRESETS: Preset[] = [
  {
    id: "kyocera",
    category: "定番",
    label: "人生・仕事の結果",
    resultText: "人生・仕事の結果",
    subNote: "※稲盛和夫の方程式。考え方はマイナスにもなる",
    elements: [
      { op: "", text: "考え方" },
      { op: "×", text: "熱意" },
      { op: "×", text: "能力" },
    ],
  },
  {
    id: "trust",
    category: "定番",
    label: "信頼の方程式",
    resultText: "信頼",
    subNote: "※D・マイスター「信頼される人の条件」より",
    elements: [
      { op: "", text: "専門性" },
      { op: "×", text: "確実性" },
      { op: "×", text: "親密さ" },
      { op: "÷", text: "自己利益" },
    ],
  },
  {
    id: "mehrabian",
    category: "定番",
    label: "第一印象",
    resultText: "第一印象",
    subNote: "※メラビアンの法則。矛盾したときは見た目が勝つ",
    elements: [
      { op: "", text: "見た目 55%" },
      { op: "＋", text: "声 38%" },
      { op: "＋", text: "話の内容 7%" },
    ],
  },
  {
    id: "einstein",
    category: "定番",
    label: "E＝mc²",
    resultText: "エネルギー",
    subNote: "※アインシュタインの式。ごく小さな質量が莫大な力になる",
    elements: [
      { op: "", text: "質量" },
      { op: "×", text: "光の速さ" },
      { op: "×", text: "光の速さ" },
    ],
  },
  {
    id: "pareto",
    category: "定番",
    label: "パレートの法則",
    resultText: "成果の8割",
    subNote: "※80:20の法則。どの2割かを見極めるのが仕事",
    elements: [{ op: "", text: "行動の2割" }],
  },
  {
    id: "happiness",
    category: "定番",
    label: "幸福 ＝ 現実 − 期待",
    resultText: "幸福度",
    subNote: "※期待を上げすぎないことも、幸福を守る技術",
    elements: [
      { op: "", text: "現実" },
      { op: "−", text: "期待" },
    ],
  },
  {
    id: "sales",
    category: "ビジネス",
    label: "売上の方程式",
    resultText: "売上",
    subNote: "※どの要素がボトルネックかを常に数値化する",
    elements: [
      { op: "", text: "客数" },
      { op: "×", text: "顧客単価" },
      { op: "×", text: "購買頻度" },
    ],
  },
  {
    id: "value",
    category: "ビジネス",
    label: "価値の方程式",
    resultText: "顧客が感じる価値",
    subNote: "※A・ホルモジー。待たせない・簡単にするだけで価値は上がる",
    elements: [
      { op: "", text: "理想の結果" },
      { op: "×", text: "達成の確実性" },
      { op: "÷", text: "かかる時間" },
      { op: "÷", text: "労力と犠牲" },
    ],
  },
  {
    id: "productivity",
    category: "ビジネス",
    label: "生産性",
    resultText: "生産性",
    subNote: "※長く働くほど下がる。分母を減らす発想を持つ",
    elements: [
      { op: "", text: "生み出した成果" },
      { op: "÷", text: "投じた時間" },
    ],
  },
  {
    id: "team",
    category: "ビジネス",
    label: "チームの成果",
    resultText: "チームの成果",
    subNote: "※人数が増えても、連携コストが上回れば成果は落ちる",
    elements: [
      { op: "", text: "個の力" },
      { op: "×", text: "連携" },
      { op: "×", text: "方向性の一致" },
    ],
  },
  {
    id: "grit",
    category: "自己啓発・キャリア",
    label: "やり抜く力（GRIT）",
    resultText: "やり抜く力",
    subNote: "※A・ダックワース。才能より、続ける力が結果を分ける",
    elements: [
      { op: "", text: "情熱" },
      { op: "×", text: "粘り強さ" },
    ],
  },
  {
    id: "habit",
    category: "自己啓発・キャリア",
    label: "習慣のループ",
    resultText: "習慣",
    subNote: "※C・デュヒッグ「習慣の力」。意志ではなく仕組みで続ける",
    elements: [
      { op: "", text: "きっかけ" },
      { op: "×", text: "行動" },
      { op: "×", text: "報酬" },
    ],
  },
  {
    id: "career",
    category: "自己啓発・キャリア",
    label: "市場価値",
    resultText: "市場価値",
    subNote: "※希少性は「掛け算のスキル」でつくる",
    elements: [
      { op: "", text: "技術資産" },
      { op: "×", text: "人的資産" },
      { op: "×", text: "業界の生産性" },
    ],
  },
  {
    id: "money",
    category: "自己啓発・キャリア",
    label: "資産形成",
    resultText: "資産",
    subNote: "※入金力 × 時間 が最強。利回りは最後の変数",
    elements: [
      { op: "", text: "入金力" },
      { op: "×", text: "利回り" },
      { op: "×", text: "時間" },
    ],
  },
  {
    id: "heat",
    category: "日常・価値観",
    label: "体感の暑さ",
    resultText: "体感の暑さ",
    subNote: "※同じ気温でも、湿度が高いほどつらい",
    elements: [
      { op: "", text: "気温" },
      { op: "×", text: "湿度" },
    ],
  },
  {
    id: "memory",
    category: "日常・価値観",
    label: "思い出 ＞ お金",
    resultText: "思い出",
    relation: "＞",
    subNote: "※お金は戻るけれど、時間は戻らない",
    elements: [{ op: "", text: "お金" }],
  },
  {
    id: "today",
    category: "日常・価値観",
    label: "今日 ＞ 昨日",
    resultText: "今日の自分",
    relation: "＞",
    subNote: "※比べる相手は、いつも昨日の自分",
    elements: [{ op: "", text: "昨日の自分" }],
  },
  {
    id: "action",
    category: "日常・価値観",
    label: "行動の方程式",
    resultText: "行動量",
    subNote: "※不安は「情報不足」から生まれる。調べる前に動く",
    elements: [
      { op: "", text: "やりたい気持ち" },
      { op: "−", text: "不安" },
    ],
  },
];

export const PRESET_CATEGORIES: PresetCategory[] = [
  "定番",
  "ビジネス",
  "自己啓発・キャリア",
  "日常・価値観",
];
