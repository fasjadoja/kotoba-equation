"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_CONFIG,
  LAYOUTS,
  LIMITS,
  MARGIN_SCALE,
  MAX_ELEMENTS,
  SIZES,
  TEXT_SCALE,
  isLogoRank,
  type FormulaConfig,
  type LayoutId,
  type SizeId,
} from "@/lib/types";
import { THEMES } from "@/lib/themes";

const STORAGE_KEY = "formula-studio.draft";
/** Writes are debounced so typing does not hit localStorage on every keystroke. */
const WRITE_DELAY = 400;

function clampText(value: unknown, limit: number, fallback = ""): string {
  if (typeof value !== "string") return fallback;
  return Array.from(value).slice(0, limit).join("");
}

function clampNumber(
  value: unknown,
  range: { min: number; max: number },
  fallback: number,
): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(range.max, Math.max(range.min, value));
}

function pick<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

/** Rebuilds a config from untrusted storage, dropping anything unexpected. */
export function normalizeConfig(value: unknown): FormulaConfig | null {
  if (typeof value !== "object" || value === null) return null;
  const draft = value as Partial<FormulaConfig>;
  const elements = Array.isArray(draft.elements)
    ? draft.elements
        .slice(0, MAX_ELEMENTS)
        .map((element) => ({
          op: clampText(
            (element as { op?: unknown } | null)?.op,
            LIMITS.operator,
          ),
          text: clampText(
            (element as { text?: unknown } | null)?.text,
            LIMITS.element,
          ),
        }))
    : [];
  return {
    resultText: clampText(draft.resultText, LIMITS.resultText),
    relation: clampText(draft.relation, LIMITS.relation, "＝") || "＝",
    elements: elements.length > 0 ? elements : DEFAULT_CONFIG.elements,
    subNote: clampText(draft.subNote, LIMITS.subNote),
    hashtags: clampText(draft.hashtags, LIMITS.hashtags),
    author: clampText(draft.author, LIMITS.author),
    layoutId: pick<LayoutId>(
      draft.layoutId,
      LAYOUTS.map((layout) => layout.id),
      "auto",
    ),
    showCopyright: draft.showCopyright === true,
    themeId: pick(
      draft.themeId,
      THEMES.map((theme) => theme.id),
      DEFAULT_CONFIG.themeId,
    ),
    fontId: draft.fontId === "mono" ? "mono" : "sans",
    sizeId: pick<SizeId>(
      draft.sizeId,
      SIZES.map((size) => size.id),
      DEFAULT_CONFIG.sizeId,
    ),
    showWatermark: draft.showWatermark !== false,
    logoRank: isLogoRank(draft.logoRank) ? draft.logoRank : "brand",
    textScale: clampNumber(draft.textScale, TEXT_SCALE, 1),
    marginScale: clampNumber(draft.marginScale, MARGIN_SCALE, 1),
  };
}

function isBlank(config: FormulaConfig) {
  return (
    !config.resultText.trim() && config.elements.every((element) => !element.text.trim())
  );
}

/**
 * Keeps the last edit in the browser so closing the tab does not lose it.
 * Nothing is sent anywhere; the draft lives next to the history in localStorage.
 */
export function useDraft(apply: (config: FormulaConfig) => void) {
  const [restored, setRestored] = useState(false);
  const applyRef = useRef(apply);
  applyRef.current = apply;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const draft = raw ? normalizeConfig(JSON.parse(raw) as unknown) : null;
      // An all-empty draft would greet the next visit with a blank canvas, so
      // the sample text comes back while the style choices are kept.
      if (draft)
        applyRef.current(
          isBlank(draft)
            ? {
                ...draft,
                resultText: DEFAULT_CONFIG.resultText,
                relation: DEFAULT_CONFIG.relation,
                elements: DEFAULT_CONFIG.elements,
                subNote: DEFAULT_CONFIG.subNote,
                hashtags: DEFAULT_CONFIG.hashtags,
              }
            : draft,
        );
    } catch {
      // A corrupted draft simply falls back to the default example.
    }
    setRestored(true);
  }, []);

  const remember = useCallback(
    (config: FormulaConfig) => {
      if (!restored) return;
      const timer = window.setTimeout(() => {
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        } catch {
          // Private mode or a full quota: the draft is best effort.
        }
      }, WRITE_DELAY);
      return () => window.clearTimeout(timer);
    },
    [restored],
  );

  const forget = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing to clean up.
    }
  }, []);

  return { restored, remember, forget };
}
