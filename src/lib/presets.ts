import type { FormulaElement } from "./types";

export type PresetCategory =
  | "定番"
  | "くらし・ごはん"
  | "人との関係"
  | "学び・すこやか"
  | "仕事・お金";

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
 * A stock of everyday equations. 「今日のテンプレート」 shows a slice of this
 * list that changes once a day, so the page does not always open with the same
 * six examples.
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
    category: "仕事・お金",
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
    category: "仕事・お金",
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
    category: "仕事・お金",
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
    category: "人との関係",
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
    category: "学び・すこやか",
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
    category: "学び・すこやか",
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
    category: "仕事・お金",
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
    category: "仕事・お金",
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
    id: "today",
    category: "学び・すこやか",
    label: "今日 ＞ 昨日",
    resultText: "今日の自分",
    relation: "＞",
    subNote: "※比べる相手は、いつも昨日の自分",
    elements: [{ op: "", text: "昨日の自分" }],
  },
  {
    id: "action",
    category: "学び・すこやか",
    label: "行動の方程式",
    resultText: "行動量",
    subNote: "※不安は「情報不足」から生まれる。調べる前に動く",
    elements: [
      { op: "", text: "やりたい気持ち" },
      { op: "−", text: "不安" },
    ],
  },
  {
    id: "energy",
    category: "くらし・ごはん",
    label: "元気",
    resultText: "元気",
    subNote: "※どれか1つが0になるだけで、一日がしんどくなる",
    elements: [
      { op: "", text: "睡眠" },
      { op: "＋", text: "ごはん" },
      { op: "＋", text: "日光" },
    ],
  },
  {
    id: "meal",
    category: "くらし・ごはん",
    label: "ごはんのおいしさ",
    resultText: "おいしさ",
    subNote: "※同じメニューでも、誰と食べるかで変わる",
    elements: [
      { op: "", text: "空腹" },
      { op: "×", text: "誰と食べるか" },
    ],
  },
  {
    id: "room",
    category: "くらし・ごはん",
    label: "部屋の快適さ",
    resultText: "部屋の快適さ",
    subNote: "※片づけるより、ものを減らす方が効く",
    elements: [
      { op: "", text: "片づけた回数" },
      { op: "÷", text: "ものの量" },
    ],
  },
  {
    id: "chores",
    category: "くらし・ごはん",
    label: "家事の楽さ",
    resultText: "家事の楽さ",
    subNote: "※気合いでは続かない。仕組みで楽をする",
    elements: [
      { op: "", text: "仕組み" },
      { op: "÷", text: "気合い" },
    ],
  },
  {
    id: "trip",
    category: "くらし・ごはん",
    label: "旅の楽しさ",
    resultText: "旅の楽しさ",
    subNote: "※計画を詰めすぎると、偶然の楽しさが減る",
    elements: [
      { op: "", text: "下調べ" },
      { op: "×", text: "偶然の出会い" },
    ],
  },
  {
    id: "weekend",
    category: "くらし・ごはん",
    label: "休日の満足度",
    resultText: "休日の満足度",
    subNote: "※予定を詰め込むほど、休んだ感覚は消えていく",
    elements: [
      { op: "", text: "やりたいこと" },
      { op: "−", text: "やらなきゃいけないこと" },
    ],
  },
  {
    id: "friend",
    category: "人との関係",
    label: "友情",
    resultText: "友情",
    subNote: "※会った回数だけでは深くならない",
    elements: [
      { op: "", text: "一緒にいた時間" },
      { op: "×", text: "正直さ" },
    ],
  },
  {
    id: "talk",
    category: "人との関係",
    label: "会話の楽しさ",
    resultText: "会話の楽しさ",
    subNote: "※うまく話すことより、ちゃんと聞くこと",
    elements: [
      { op: "", text: "聞く時間" },
      { op: "×", text: "共感" },
    ],
  },
  {
    id: "thanks",
    category: "人との関係",
    label: "ありがとうの重さ",
    resultText: "ありがとうの重さ",
    subNote: "※早いほど、具体的なほど届く",
    elements: [
      { op: "", text: "すぐ伝える" },
      { op: "×", text: "具体的に伝える" },
    ],
  },
  {
    id: "family",
    category: "人との関係",
    label: "家族の機嫌",
    resultText: "家族の機嫌",
    subNote: "※睡眠と空腹を満たすだけで、けんかは減る",
    elements: [
      { op: "", text: "睡眠" },
      { op: "×", text: "ごはん" },
      { op: "×", text: "余裕" },
    ],
  },
  {
    id: "study",
    category: "学び・すこやか",
    label: "覚えられる量",
    resultText: "覚えられる量",
    subNote: "※1回長くやるより、短く何回も",
    elements: [
      { op: "", text: "復習の回数" },
      { op: "×", text: "思い入れ" },
    ],
  },
  {
    id: "skill",
    category: "学び・すこやか",
    label: "上達",
    resultText: "上達",
    subNote: "※やりっ本なしの練習は、くせを固めるだけ",
    elements: [
      { op: "", text: "練習量" },
      { op: "×", text: "振り返り" },
    ],
  },
  {
    id: "focus",
    category: "学び・すこやか",
    label: "集中力",
    resultText: "集中力",
    subNote: "※意志の問題にする前に、スマホを遠ざける",
    elements: [
      { op: "", text: "静かな環境" },
      { op: "×", text: "締め切り" },
    ],
  },
  {
    id: "hobby",
    category: "学び・すこやか",
    label: "続く趣味",
    resultText: "続く趣味",
    subNote: "※「すぐに始められる」が、才能より強い",
    elements: [
      { op: "", text: "楽しさ" },
      { op: "×", text: "手軽さ" },
    ],
  },
];

export const PRESET_CATEGORIES: PresetCategory[] = [
  "定番",
  "くらし・ごはん",
  "人との関係",
  "学び・すこやか",
  "仕事・お金",
];

/** How many presets 「今日のテンプレート」 shows. */
export const DAILY_PRESET_COUNT = 6;

/** Local calendar day, used as the seed so the picks change once a day. */
export function dayKey(now: Date) {
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

function hash(seed: string) {
  let value = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    value ^= seed.charCodeAt(i);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

/**
 * Deterministic shuffle: everyone opening the page on the same day sees the
 * same set, and it rotates at midnight without any server call.
 */
export function dailyPresets(seed: string, count = DAILY_PRESET_COUNT): Preset[] {
  const pool = [...PRESETS];
  let state = hash(seed) || 1;
  for (let i = pool.length - 1; i > 0; i -= 1) {
    state = (Math.imul(state, 48271) % 2147483647) >>> 0;
    const j = state % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}
