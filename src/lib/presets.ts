import type { FormulaElement } from "./types";

export type Preset = {
  id: string;
  category: "ビジネス" | "マーケ" | "自己啓発" | "キャリア" | "SNS運用" | "投資・お金";
  label: string;
  resultText: string;
  subNote: string;
  elements: FormulaElement[];
  pro: boolean;
};

export const PRESETS: Preset[] = [
  {
    id: "life",
    category: "自己啓発",
    label: "人生の成果",
    resultText: "人生の成果",
    subNote: "※考え方（-100〜+100点）が全体の掛け算を決める",
    elements: [
      { op: "", text: "能力" },
      { op: "×", text: "熱量" },
      { op: "×", text: "考え方" },
    ],
    pro: false,
  },
  {
    id: "sales",
    category: "ビジネス",
    label: "売上の方程式",
    resultText: "事業の売上",
    subNote: "※どの要素がボトルネックかを常に数値化する",
    elements: [
      { op: "", text: "客数" },
      { op: "×", text: "顧客単価" },
      { op: "×", text: "購買頻度" },
    ],
    pro: false,
  },
  {
    id: "habit",
    category: "自己啓発",
    label: "習慣の法則",
    resultText: "目標達成",
    subNote: "※意志力に頼らず、仕組みで摩擦を最小化する",
    elements: [
      { op: "", text: "小さな習慣" },
      { op: "＋", text: "環境づくり" },
      { op: "−", text: "無駄な迷い" },
    ],
    pro: false,
  },
  {
    id: "trust",
    category: "ビジネス",
    label: "信頼の方程式",
    resultText: "信頼",
    subNote: "※どれだけ実績があっても、自己利益が大きいと信頼はゼロに近づく",
    elements: [
      { op: "", text: "専門性" },
      { op: "×", text: "確実性" },
      { op: "×", text: "親密さ" },
      { op: "÷", text: "自己利益" },
    ],
    pro: false,
  },
  {
    id: "growth",
    category: "キャリア",
    label: "成長スピード",
    resultText: "成長スピード",
    subNote: "※打席数を増やし、振り返りの質を上げるほど伸びる",
    elements: [
      { op: "", text: "挑戦の量" },
      { op: "×", text: "振り返りの質" },
      { op: "×", text: "継続月数" },
    ],
    pro: false,
  },
  {
    id: "sns",
    category: "SNS運用",
    label: "伸びる投稿",
    resultText: "伸びる投稿",
    subNote: "※最初の1行で止まらなければ、中身は読まれない",
    elements: [
      { op: "", text: "フック" },
      { op: "×", text: "具体性" },
      { op: "×", text: "共感" },
      { op: "×", text: "投稿頻度" },
    ],
    pro: true,
  },
  {
    id: "lp",
    category: "マーケ",
    label: "CVRの分解",
    resultText: "CVR",
    subNote: "※摩擦（入力項目・不安・迷い）を減らすほど伸びる",
    elements: [
      { op: "", text: "オファーの強さ" },
      { op: "×", text: "証拠" },
      { op: "÷", text: "申込の摩擦" },
    ],
    pro: true,
  },
  {
    id: "value",
    category: "マーケ",
    label: "価値の方程式",
    resultText: "顧客が感じる価値",
    subNote: "※待たせない・簡単にする、だけで価値は跳ね上がる",
    elements: [
      { op: "", text: "理想の結果" },
      { op: "×", text: "達成の確実性" },
      { op: "÷", text: "かかる時間" },
      { op: "÷", text: "労力と犠牲" },
    ],
    pro: true,
  },
  {
    id: "money",
    category: "投資・お金",
    label: "資産形成",
    resultText: "資産",
    subNote: "※入金力 × 時間 が最強。利回りは最後の変数",
    elements: [
      { op: "", text: "収入" },
      { op: "−", text: "支出" },
      { op: "×", text: "運用利回り" },
      { op: "×", text: "時間" },
    ],
    pro: true,
  },
  {
    id: "career",
    category: "キャリア",
    label: "市場価値",
    resultText: "市場価値",
    subNote: "※希少性は「掛け算のスキル」でつくる",
    elements: [
      { op: "", text: "技術資産" },
      { op: "×", text: "人的資産" },
      { op: "×", text: "業界の生産性" },
    ],
    pro: true,
  },
  {
    id: "team",
    category: "ビジネス",
    label: "チームの成果",
    resultText: "チームの成果",
    subNote: "※メンバーが増えても、連携コストが上回れば成果は落ちる",
    elements: [
      { op: "", text: "個の力" },
      { op: "×", text: "連携" },
      { op: "×", text: "方向性の一致" },
    ],
    pro: true,
  },
  {
    id: "action",
    category: "自己啓発",
    label: "行動の方程式",
    resultText: "行動量",
    subNote: "※不安は「情報不足」から生まれる。調べる前に動く",
    elements: [
      { op: "", text: "やりたい気持ち" },
      { op: "−", text: "不安" },
      { op: "⇒", text: "とりあえず着手" },
    ],
    pro: true,
  },
];

export const PRESET_CATEGORIES = Array.from(new Set(PRESETS.map((p) => p.category)));
