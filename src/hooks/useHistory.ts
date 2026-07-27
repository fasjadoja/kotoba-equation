"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormulaConfig } from "@/lib/types";

const STORAGE_KEY = "formula-studio.history";
const MAX_ITEMS = 5;

export type HistoryEntry = {
  id: string;
  createdAt: number;
  resultText: string;
  relation: string;
  elements: FormulaConfig["elements"];
  subNote: string;
  author: string;
};

/** Entries stored before relations existed are kept and default to 「＝」. */
function toEntry(value: unknown): HistoryEntry | null {
  if (typeof value !== "object" || value === null) return null;
  const entry = value as Partial<HistoryEntry>;
  if (
    typeof entry.id !== "string" ||
    typeof entry.createdAt !== "number" ||
    typeof entry.resultText !== "string" ||
    typeof entry.subNote !== "string" ||
    typeof entry.author !== "string" ||
    !Array.isArray(entry.elements)
  ) {
    return null;
  }
  return {
    id: entry.id,
    createdAt: entry.createdAt,
    resultText: entry.resultText,
    relation: typeof entry.relation === "string" && entry.relation ? entry.relation : "＝",
    elements: entry.elements.map((element) => ({ ...element })),
    subNote: entry.subNote,
    author: entry.author,
  };
}

function read(): HistoryEntry[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(toEntry)
      .filter((entry): entry is HistoryEntry => entry !== null)
      .slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

function summarize(entry: HistoryEntry): string {
  return `${entry.resultText}${entry.relation || "＝"}${entry.elements
    .map((element, index) => (index === 0 ? element.text : `${element.op}${element.text}`))
    .join("")}`;
}

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setEntries(read());
  }, []);

  const save = useCallback((config: FormulaConfig) => {
    const entry: HistoryEntry = {
      id: `${Date.now()}`,
      createdAt: Date.now(),
      resultText: config.resultText,
      relation: config.relation,
      elements: config.elements.map((element) => ({ ...element })),
      subNote: config.subNote,
      author: config.author,
    };
    setEntries((previous) => {
      const key = summarize(entry);
      const next = [entry, ...previous.filter((item) => summarize(item) !== key)].slice(
        0,
        MAX_ITEMS,
      );
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setEntries([]);
  }, []);

  return { entries, save, clear, summarize };
}
