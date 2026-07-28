import { PRESETS, presetFromWords, type Preset } from "./presets";
import { PRESET_THEMES, type PresetTheme } from "./presetThemes";
import { hasAbusiveWord } from "./moderation";
import type { HistoryEntry } from "@/hooks/useHistory";

/**
 * A deliberately rough search over the template stock and the reader's own
 * history: everything is folded to hiragana without spacing or punctuation, so
 * 「スイミン」「すいみん」「睡眠 」 all find the same equations, and a single
 * typo still scores as a partial hit.
 */
const KATAKANA = /[\u30a1-\u30f6]/g;
const NOISE = /[\s・、。，．,.\-_/|()（）「」『』【】"'`!?！？※＝＋−×÷＞＜≧≦≠≒→⇒]/g;

export function normalize(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(KATAKANA, (char) => String.fromCharCode(char.charCodeAt(0) - 0x60))
    .replace(NOISE, "");
}

export function queryTokens(query: string): string[] {
  return query
    .split(/[\s　]+/)
    .map(normalize)
    .filter((token) => token.length > 0)
    .slice(0, 4);
}

/**
 * Readings for the words the stock writes in kanji, so someone typing
 * 「すいみん」 still finds 「睡眠」. Only words that appear in the templates are
 * listed; everything else is matched as written.
 */
const READINGS: Record<string, string> = {
  すいみん: "睡眠",
  げんき: "元気",
  しあわせ: "幸せ",
  けんこう: "健康",
  たいちょう: "体調",
  うんどう: "運動",
  さんぽ: "散歩",
  にっこう: "日光",
  みず: "水",
  あさ: "朝",
  よる: "夜",
  なつ: "夏",
  ふゆ: "冬",
  へや: "部屋",
  たび: "旅",
  かぞく: "家族",
  ゆうじょう: "友情",
  かいわ: "会話",
  しんらい: "信頼",
  かんしゃ: "感謝",
  しごと: "仕事",
  おかね: "お金",
  じかん: "時間",
  かいぎ: "会議",
  しりょう: "資料",
  ひょうか: "評価",
  はんだん: "判断",
  ふくぎょう: "副業",
  べんきょう: "勉強",
  どくしょ: "読書",
  きおく: "記憶",
  しゅうちゅう: "集中",
  じしん: "自信",
  きろく: "記録",
  しめきり: "締め切り",
  ぶんしょう: "文章",
  そうじ: "掃除",
  かじ: "家事",
  しゅみ: "趣味",
  おんがく: "音楽",
};

/** Kana typed so far also counts, so results appear while the IME is open. */
function variants(token: string): string[] {
  const exact = READINGS[token];
  if (exact) return [token, normalize(exact)];
  if (token.length < 2) return [token];
  const forms = [token];
  for (const [reading, word] of Object.entries(READINGS)) {
    if (reading.startsWith(token)) forms.push(normalize(word));
  }
  return forms;
}

/** 1 for a plain hit, less for a near miss. 0 means "not this one". */
function matchScore(haystack: string, token: string): number {
  if (!haystack || !token) return 0;
  let best = 0;
  for (const form of variants(token)) {
    if (haystack.includes(form)) return 1;
    if (form.length >= 4) {
      for (let i = 0; i < form.length; i += 1) {
        const dropped = `${form.slice(0, i)}${form.slice(i + 1)}`;
        if (haystack.includes(dropped)) best = Math.max(best, 0.7);
      }
    }
  }
  return best;
}

type Field = { text: string; weight: number };

/** Every token has to land somewhere; the best field decides how well. */
function scoreFields(fields: Field[], tokens: string[]): number {
  const prepared = fields.map((field) => ({
    text: normalize(field.text),
    weight: field.weight,
  }));
  let total = 0;
  for (const token of tokens) {
    let best = 0;
    for (const field of prepared) {
      best = Math.max(best, matchScore(field.text, token) * field.weight);
    }
    if (best === 0) return 0;
    total += best;
  }
  return total / tokens.length;
}

export type SearchHit =
  | { kind: "template"; id: string; score: number; label: string; text: string; preset: Preset }
  | { kind: "history"; id: string; score: number; label: string; text: string; entry: HistoryEntry };

export function presetText(preset: Preset): string {
  return `${preset.resultText} ${preset.relation ?? "＝"} ${preset.elements
    .map((element, index) => (index === 0 ? element.text : `${element.op}${element.text}`))
    .join("")}`;
}

export function entryText(entry: HistoryEntry): string {
  return `${entry.resultText} ${entry.relation || "＝"} ${entry.elements
    .map((element, index) => (index === 0 ? element.text : `${element.op}${element.text}`))
    .join("")}`;
}

function presetFields(preset: Preset): Field[] {
  return [
    { text: preset.label, weight: 1 },
    { text: preset.resultText, weight: 1 },
    { text: preset.elements.map((element) => element.text).join(" "), weight: 0.9 },
    { text: preset.subNote, weight: 0.55 },
  ];
}

/**
 * Themes are searched by their headline and by their pool at once, and the pool
 * words that matched are remembered so they end up in the suggested equation.
 */
function themeHit(theme: PresetTheme, tokens: string[]): { score: number; picked: number[] } {
  const headline: Field[] = [
    { text: normalize(theme.label), weight: 1 },
    { text: normalize(theme.result), weight: 1 },
    { text: normalize(theme.note), weight: 0.55 },
  ];
  const pool = theme.pool.map((word) => normalize(word));
  const picked: number[] = [];
  let total = 0;
  for (const token of tokens) {
    let best = 0;
    for (const field of headline) {
      best = Math.max(best, matchScore(field.text, token) * field.weight);
    }
    let bestIndex = -1;
    pool.forEach((word, index) => {
      const score = matchScore(word, token) * 0.9;
      if (score > best) {
        best = score;
        bestIndex = index;
      }
    });
    if (best === 0) return { score: 0, picked: [] };
    if (bestIndex >= 0 && !picked.includes(bestIndex)) picked.push(bestIndex);
    total += best;
  }
  return { score: total / tokens.length, picked };
}

export function searchTemplates(query: string, limit: number): SearchHit[] {
  const tokens = queryTokens(query);
  if (tokens.length === 0) return [];
  const hits: SearchHit[] = [];
  for (const preset of PRESETS) {
    const score = scoreFields(presetFields(preset), tokens);
    if (score > 0) {
      hits.push({
        kind: "template",
        id: preset.id,
        score,
        label: preset.label,
        text: presetText(preset),
        preset,
      });
    }
  }
  for (const theme of PRESET_THEMES) {
    const { score, picked } = themeHit(theme, tokens);
    if (score > 0) {
      const preset = presetFromWords(theme, picked);
      hits.push({
        kind: "template",
        id: preset.id,
        score,
        label: theme.label,
        text: presetText(preset),
        preset,
      });
    }
  }
  return dedupe(hits.sort((a, b) => b.score - a.score)).slice(0, limit);
}

/** The stock writes a few equations twice, once by hand and once as a theme. */
function dedupe(hits: SearchHit[]): SearchHit[] {
  const seen = new Set<string>();
  return hits.filter((hit) => {
    const key = normalize(hit.text);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Keeps half-finished and throwaway entries out of the results: a searchable
 * equation needs a real result word, a real element, and more than one
 * repeated character.
 */
export function isSearchable(entry: HistoryEntry): boolean {
  const result = entry.resultText.trim();
  const words = entry.elements.map((element) => element.text.trim()).filter(Boolean);
  if (Array.from(result).length < 2) return false;
  if (words.length === 0) return false;
  if (words.every((word) => Array.from(word).length < 2)) return false;
  const body = normalize([result, ...words].join(""));
  if (new Set(Array.from(body)).size < 3) return false;
  if (!/[ぁ-ん一-龯a-z0-9]/.test(body)) return false;
  if (hasAbusiveWord(`${result} ${words.join(" ")} ${entry.subNote}`)) return false;
  return true;
}

export function searchHistory(
  entries: HistoryEntry[],
  query: string,
  limit: number,
): SearchHit[] {
  const tokens = queryTokens(query);
  if (tokens.length === 0) return [];
  return entries
    .filter(isSearchable)
    .map((entry) => {
      const score = scoreFields(
        [
          { text: entry.resultText, weight: 1 },
          { text: entry.elements.map((element) => element.text).join(" "), weight: 0.9 },
          { text: entry.subNote, weight: 0.55 },
          { text: entry.hashtags, weight: 0.5 },
        ],
        tokens,
      );
      return { entry, score };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || b.entry.createdAt - a.entry.createdAt)
    .slice(0, limit)
    .map(({ entry, score }) => ({
      kind: "history" as const,
      id: entry.id,
      score,
      label: entry.resultText,
      text: entryText(entry),
      entry,
    }));
}

/** History first when it matches as well, since it is the reader's own wording. */
export function searchAll(
  entries: HistoryEntry[],
  query: string,
  limit: number,
): SearchHit[] {
  const history = searchHistory(entries, query, limit);
  const templates = searchTemplates(query, limit);
  const merged = [...history, ...templates].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.kind === b.kind ? 0 : a.kind === "history" ? -1 : 1;
  });
  return dedupe(merged).slice(0, limit);
}
