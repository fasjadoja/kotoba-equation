import { hasAbusiveWord } from "./moderation";
import type { FormulaElement } from "./types";

/**
 * Only well-formed equations are worth putting in front of strangers, so the
 * wall is scored rather than moderated by hand: anything below the bar is kept
 * private, and what passes is ordered by how readable it is.
 */
export const QUALITY_MIN = 0.55;

export type Scored = {
  resultText: string;
  relation: string;
  elements: FormulaElement[];
  subNote: string;
};

/** Ignores the decorative characters so 「（）」 alone never counts as a word. */
const WORD = /[ぁ-んァ-ヴ一-龯ａ-ｚＡ-Ｚa-zA-Z0-9]/;
const BRACKETS = /[（）()]/g;

function chars(value: string): string[] {
  return Array.from(value.trim());
}

function words(entry: Scored): string[] {
  return entry.elements
    .map((element) => element.text.replace(BRACKETS, "").trim())
    .filter((text) => text.length > 0);
}

/** A word repeated from a stuck key ("ああああ") has almost no distinct letters. */
function isPadding(text: string): boolean {
  const letters = chars(text);
  return letters.length > 2 && new Set(letters).size <= Math.ceil(letters.length / 3);
}

export type Quality = { score: number; reason?: string };

/**
 * Returns 0 with a reason for anything unfit to publish, otherwise a 0.4–1
 * score used both as the gate (`QUALITY_MIN`) and as the ranking key.
 */
export function formulaQuality(entry: Scored): Quality {
  const result = entry.resultText.replace(BRACKETS, "").trim();
  const parts = words(entry);
  const body = [result, ...parts].join("");

  if (chars(result).length < 2) return { score: 0, reason: "結果のことばが短すぎます" };
  if (parts.length < 2) return { score: 0, reason: "要素が2つ以上ある式だけ公開できます" };
  if (!WORD.test(body)) return { score: 0, reason: "記号だけの式は公開できません" };
  if (isPadding(result) || parts.some(isPadding)) {
    return { score: 0, reason: "同じ文字の繰り返しは公開できません" };
  }
  if (new Set(parts.map((part) => part.toLowerCase())).size < parts.length) {
    return { score: 0, reason: "同じことばが並んでいる式は公開できません" };
  }
  // 「A ＋ B」 is what the empty editor looks like, so it never reaches the wall.
  if (parts.every((part) => /^[0-9０-９a-zA-Zａ-ｚＡ-Ｚ]$/.test(part))) {
    return { score: 0, reason: "AやBのままではなく、ことばを入れてください" };
  }
  if (chars(body).length > 60) return { score: 0, reason: "長すぎる式は読みづらいため公開できません" };
  if (hasAbusiveWord(`${body} ${entry.subNote}`)) {
    return { score: 0, reason: "だれかを傷つける言葉は公開できません" };
  }

  const lengths = parts.map((part) => chars(part).length);
  const average = lengths.reduce((sum, length) => sum + length, 0) / lengths.length;
  let score = 0.4;
  // Two words is the minimum, three or four read best on a phone screen.
  score += parts.length >= 3 && parts.length <= 5 ? 0.2 : 0.1;
  // Single letters make an equation look like a placeholder ("A ＝ B ＋ C").
  score += average >= 2 ? 0.2 : 0;
  score += new Set(chars(body)).size >= 6 ? 0.1 : 0;
  score += chars(entry.subNote).length >= 8 ? 0.1 : 0;
  return { score: Math.min(1, score) };
}

export function isPublishable(entry: Scored): boolean {
  return formulaQuality(entry).score >= QUALITY_MIN;
}
