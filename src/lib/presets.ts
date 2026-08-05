import { COMPLEX_PRESETS } from "./complexPresets";
import { LIFE_PRESETS } from "./lifePresets";
import { PRESET_THEMES, THEME_PICK, type PresetTheme } from "./presetThemes";
import { QUOTE_PRESETS } from "./quotePresets";
import { SHELF_PRESETS } from "./shelfPresets";
import type { FormulaElement } from "./types";

export type PresetCategory =
  | "定番"
  | "くらし・ごはん"
  | "人との関係"
  | "からだ・こころ"
  | "学び・すこやか"
  | "仕事・お金"
  | "遊び・趣味"
  | "季節・行事"
  | "歴史・名作"
  | "カルチャー・流行"
  | "世界の名言"
  | "世界のことわざ";

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
const EVERYDAY_PRESETS: Preset[] = [
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
    subNote: "※やりっぱなしの練習は、くせを固めるだけ",
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
  {
    id: "bracket-shopping",
    category: "定番",
    label: "買い物の満足（かっこ）",
    resultText: "買い物の満足",
    subNote: "※（）の中を先に計算する。安さより、質と量の割り算",
    elements: [
      { op: "（", text: "質" },
      { op: "×", text: "量" },
      { op: "）", text: "" },
      { op: "÷", text: "値段" },
    ],
  },
  {
    id: "bracket-average",
    category: "定番",
    label: "平均（かっこ）",
    resultText: "3回の平均",
    subNote: "※合計を先に出してから、回数で割る",
    elements: [
      { op: "（", text: "1回目" },
      { op: "＋", text: "2回目" },
      { op: "＋", text: "3回目" },
      { op: "）", text: "" },
      { op: "÷", text: "3" },
    ],
  },
  {
    id: "bracket-savings",
    category: "仕事・お金",
    label: "1年の貯金（かっこ）",
    resultText: "1年の貯金",
    subNote: "※毎月の差額が、そのまま12倍になる",
    elements: [
      { op: "（", text: "収入" },
      { op: "−", text: "支出" },
      { op: "）", text: "" },
      { op: "×", text: "12か月" },
    ],
  },
  {
    id: "bracket-profit",
    category: "仕事・お金",
    label: "利益（かっこ）",
    resultText: "ひと月の利益",
    subNote: "※値上げも、原価を下げるのも、かっこの中の話",
    elements: [
      { op: "（", text: "売値" },
      { op: "−", text: "原価" },
      { op: "）", text: "" },
      { op: "×", text: "売れた数" },
    ],
  },
  {
    id: "bracket-work",
    category: "仕事・お金",
    label: "続けられる仕事（かっこ）",
    resultText: "続けられる仕事",
    subNote: "※好きと得意がそろっても、求められなければ0になる",
    elements: [
      { op: "（", text: "好き" },
      { op: "＋", text: "得意" },
      { op: "）", text: "" },
      { op: "×", text: "求められること" },
    ],
  },
  {
    id: "bracket-team",
    category: "人との関係",
    label: "チームの力（かっこ）",
    resultText: "チームの力",
    subNote: "※足し算の中身を上げてから、人数を掛ける",
    elements: [
      { op: "（", text: "一人の力" },
      { op: "＋", text: "助け合い" },
      { op: "）", text: "" },
      { op: "×", text: "人数" },
    ],
  },
  {
    id: "bracket-meeting",
    category: "仕事・お金",
    label: "会議のコスト（かっこ）",
    resultText: "会議のコスト",
    subNote: "※人数が増えるほど、かっこの外の掛け算が重くなる",
    elements: [
      { op: "（", text: "時間" },
      { op: "×", text: "人数" },
      { op: "）", text: "" },
      { op: "×", text: "時給" },
    ],
  },
  {
    id: "bracket-study",
    category: "学び・すこやか",
    label: "身につく量（かっこ）",
    resultText: "身につく量",
    subNote: "※机に向かった時間から、上の空だった時間を引く",
    elements: [
      { op: "（", text: "集中" },
      { op: "×", text: "時間" },
      { op: "）", text: "" },
      { op: "−", text: "上の空の時間" },
    ],
  },
  {
    id: "bracket-margin",
    category: "くらし・ごはん",
    label: "心の余裕（かっこ）",
    resultText: "心の余裕",
    subNote: "※休みと眠りを足しても、予定を詰めれば残らない",
    elements: [
      { op: "（", text: "休み" },
      { op: "＋", text: "眠り" },
      { op: "）", text: "" },
      { op: "−", text: "詰め込んだ予定" },
    ],
  },
  {
    id: "math-transpose",
    category: "定番",
    label: "自由時間（移項）",
    resultText: "自由時間＋用事",
    subNote: "※1日は動かせない。両辺から用事を引いた分が、自由時間",
    elements: [{ op: "", text: "24時間" }],
  },
  {
    id: "math-rate",
    category: "仕事・お金",
    label: "達成率（割合）",
    resultText: "達成率（％）",
    subNote: "※割合の式。分母を欲張ると、同じ努力でも数字は下がる",
    elements: [
      { op: "", text: "できた数" },
      { op: "÷", text: "目標の数" },
      { op: "×", text: "100" },
    ],
  },
  {
    id: "math-ratio",
    category: "学び・すこやか",
    label: "準備と本番（比）",
    resultText: "準備：本番",
    subNote: "※比の式。うまくいく人ほど、左側が長い",
    elements: [
      { op: "", text: "3" },
      { op: "：", text: "1" },
    ],
  },
  {
    id: "math-square",
    category: "人との関係",
    label: "うわさの広がり（2乗）",
    resultText: "うわさの広がり",
    subNote: "※2乗の式。人が2倍になると、広がりは4倍になる",
    elements: [
      { op: "", text: "人数" },
      { op: "×", text: "人数" },
    ],
  },
  {
    id: "math-inequality",
    category: "仕事・お金",
    label: "家計（不等号）",
    resultText: "使うお金",
    relation: "＜",
    subNote: "※不等号の式。これが崩れた月が、赤字の月",
    elements: [{ op: "", text: "入ってくるお金" }],
  },
  {
    id: "math-linear",
    category: "仕事・お金",
    label: "貯金（一次関数）",
    resultText: "半年後の貯金",
    subNote: "※y＝ax＋b の形。傾き（毎月の額）が効いてくるのは後から",
    elements: [
      { op: "", text: "毎月の額" },
      { op: "×", text: "月数" },
      { op: "＋", text: "今ある額" },
    ],
  },
  {
    id: "math-speed",
    category: "定番",
    label: "進んだ距離（速さ）",
    resultText: "進んだ距離",
    subNote: "※速さ×時間。速くなくても、長く続ければ遠くまで行く",
    elements: [
      { op: "", text: "速さ" },
      { op: "×", text: "時間" },
    ],
  },
  {
    id: "math-per",
    category: "人との関係",
    label: "一人あたり（単位量）",
    resultText: "一人あたりの負担",
    subNote: "※割り算の式。人を増やせない日は、上を減らすしかない",
    elements: [
      { op: "", text: "仕事の量" },
      { op: "÷", text: "手のある人数" },
    ],
  },
  {
    id: "math-probability",
    category: "学び・すこやか",
    label: "当たる確率",
    resultText: "当たる確率",
    subNote: "※確率の式。分子を増やすには、まず数を打つ",
    elements: [
      { op: "", text: "当たりの数" },
      { op: "÷", text: "全部の数" },
    ],
  },
  {
    id: "math-discount",
    category: "くらし・ごはん",
    label: "2割引（割合）",
    resultText: "払う金額",
    subNote: "※2割引は0.8倍。1割引を2回でも、0.81倍にしかならない",
    elements: [
      { op: "", text: "定価" },
      { op: "×", text: "0.8" },
    ],
  },
  {
    id: "bracket-trip",
    category: "くらし・ごはん",
    label: "旅の時間（かっこ）",
    resultText: "かかる時間",
    subNote: "※行きと帰りを足してから、速さで割る",
    elements: [
      { op: "（", text: "行きの道のり" },
      { op: "＋", text: "帰りの道のり" },
      { op: "）", text: "" },
      { op: "÷", text: "速さ" },
    ],
  },
];

/** The everyday stock first, then the sayings collected from around the world. */
export const PRESETS: Preset[] = [
  ...EVERYDAY_PRESETS,
  ...LIFE_PRESETS,
  ...SHELF_PRESETS,
  ...QUOTE_PRESETS,
  ...COMPLEX_PRESETS,
];

export const PRESET_CATEGORIES: PresetCategory[] = [
  "定番",
  "くらし・ごはん",
  "人との関係",
  "からだ・こころ",
  "学び・すこやか",
  "仕事・お金",
  "遊び・趣味",
  "季節・行事",
  "歴史・名作",
  "カルチャー・流行",
  "世界の名言",
  "世界のことわざ",
];

/** How many presets 「今日のテンプレート」 shows at a time. */
export const DAILY_PRESET_COUNT = 10;

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

function binomial(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let value = 1;
  for (let i = 1; i <= k; i += 1) value = (value * (n - k + i)) / i;
  return Math.round(value);
}

/** Maps an index to one combination, so a theme unfolds without storing rows. */
function combination(n: number, k: number, index: number): number[] {
  const picked: number[] = [];
  let rest = index % Math.max(1, binomial(n, k));
  let start = 0;
  for (let slot = k; slot > 0; slot -= 1) {
    for (let candidate = start; candidate <= n - slot; candidate += 1) {
      const branch = binomial(n - candidate - 1, slot - 1);
      if (rest < branch) {
        picked.push(candidate);
        start = candidate + 1;
        break;
      }
      rest -= branch;
    }
  }
  return picked;
}

export function themeVariations(theme: PresetTheme) {
  return binomial(theme.pool.length, THEME_PICK);
}

/** Every suggestion the stock can produce, hand-written ones included. */
export const PRESET_VARIATIONS =
  PRESETS.length + PRESET_THEMES.reduce((total, theme) => total + themeVariations(theme), 0);

function presetFromTheme(theme: PresetTheme, index: number): Preset {
  const words = combination(theme.pool.length, THEME_PICK, index).map(
    (position) => theme.pool[position],
  );
  return {
    id: `${theme.id}-${index}`,
    category: theme.category,
    label: theme.label,
    resultText: theme.result,
    subNote: theme.note,
    elements: words.map((text, position) => ({
      op: position === 0 ? "" : theme.op,
      text,
    })),
  };
}

/**
 * Builds a suggestion around chosen pool words, filling the remaining slots in
 * pool order. Search uses it so the words that matched appear in the equation.
 */
export function presetFromWords(theme: PresetTheme, picked: number[]): Preset {
  const order = [
    ...picked,
    ...theme.pool.map((_, index) => index).filter((index) => !picked.includes(index)),
  ].slice(0, THEME_PICK);
  return {
    id: `${theme.id}-w${order.join("-")}`,
    category: theme.category,
    label: theme.label,
    resultText: theme.result,
    subNote: theme.note,
    elements: order.map((position, slot) => ({
      op: slot === 0 ? "" : theme.op,
      text: theme.pool[position],
    })),
  };
}

/**
 * Deterministic pick: everyone opening the page on the same day sees the same
 * set, and it rotates at midnight without any server call. `round` lets the
 * reader ask for another batch without leaving the day's seed behind.
 *
 * The sayings outnumber the everyday equations several times over, so the two
 * stocks are drawn in turn instead of from one pile: a batch keeps roughly half
 * everyday equations however many quotes are added later.
 */
export function dailyPresets(
  seed: string,
  count = DAILY_PRESET_COUNT,
  round = 0,
  /** Limits the draw to one shelf of the stock. */
  category?: PresetCategory,
): Preset[] {
  let state = hash(`${seed}#${round}`) || 1;
  const next = () => {
    state = (Math.imul(state, 48271) % 2147483647) >>> 0;
    return state;
  };
  const shuffled = (input: (Preset | PresetTheme)[]) => {
    const list = [...input];
    for (let i = list.length - 1; i > 0; i -= 1) {
      const j = next() % (i + 1);
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  };
  const ofCategory = <T extends { category: PresetCategory }>(list: T[]) =>
    category ? list.filter((item) => item.category === category) : list;
  const everyday = shuffled(
    ofCategory([
      ...EVERYDAY_PRESETS,
      ...LIFE_PRESETS,
      ...SHELF_PRESETS,
      ...PRESET_THEMES,
    ]),
  );
  const sayings = shuffled(ofCategory([...QUOTE_PRESETS, ...COMPLEX_PRESETS]));
  // How much of the batch is sayings is itself drawn from the seed, so some
  // days open with mostly everyday equations and some with mostly quotes.
  const quoteShare = 20 + (next() % 61);
  const picked: (Preset | PresetTheme)[] = [];
  const labels = new Set<string>();
  while (picked.length < count && (everyday.length > 0 || sayings.length > 0)) {
    const primary = next() % 100 < quoteShare ? sayings : everyday;
    const fallback = primary === everyday ? sayings : everyday;
    const source = (primary.length > 0 ? primary : fallback).shift();
    if (!source) break;
    // Two themes can share a label (「元気」), which reads as a mistake when
    // both land in the same batch.
    if (labels.has(source.label)) continue;
    labels.add(source.label);
    picked.push(source);
  }
  return picked.map((source) =>
    "pool" in source ? presetFromTheme(source, next() % themeVariations(source)) : source,
  );
}
