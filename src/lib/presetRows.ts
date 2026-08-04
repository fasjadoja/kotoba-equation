import type { Preset, PresetCategory } from "./presets";
import type { FormulaElement } from "./types";

/**
 * Presets written one per line. `body` spells the right-hand side with its
 * operators inline (「（好き＋得意）×需要」) and is expanded into elements at
 * module load, so a thousand of them stay readable in source.
 */
export type PresetRow = [
  id: string,
  label: string,
  result: string,
  body: string,
  note: string,
  relation?: string,
];

const TOKEN = /([＋−×÷（）])/;
const OPERATORS = new Set(["＋", "−", "×", "÷"]);

/** A closing bracket is an element of its own so it hugs the term before it. */
export function rowElements(body: string): FormulaElement[] {
  const elements: FormulaElement[] = [];
  let op = "";
  for (const token of body.split(TOKEN)) {
    if (!token) continue;
    if (token === "）") {
      elements.push({ op: token, text: "" });
      continue;
    }
    if (token === "（" || OPERATORS.has(token)) {
      op = token;
      continue;
    }
    elements.push({ op, text: token });
    op = "";
  }
  return elements;
}

export function rowToPreset(row: PresetRow, category: PresetCategory): Preset {
  const [id, label, resultText, body, subNote, relation] = row;
  const elements = rowElements(body);
  return relation
    ? { id, category, label, resultText, subNote, elements, relation }
    : { id, category, label, resultText, subNote, elements };
}
