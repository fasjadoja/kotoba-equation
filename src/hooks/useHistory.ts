"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormulaConfig } from "@/lib/types";

const STORAGE_KEY = "formula-studio.history";
const MAX_ITEMS = 5;

export type HistoryEntry = {
  id: string;
  createdAt: number;
  resultText: string;
  elements: FormulaConfig["elements"];
  subNote: string;
  author: string;
};

function isEntry(value: unknown): value is HistoryEntry {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Partial<HistoryEntry>;
  return (
    typeof entry.id === "string" &&
    typeof entry.createdAt === "number" &&
    typeof entry.resultText === "string" &&
    typeof entry.subNote === "string" &&
    typeof entry.author === "string" &&
    Array.isArray(entry.elements)
  );
}

function read(): HistoryEntry[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isEntry).slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

function summarize(entry: HistoryEntry): string {
  return `${entry.resultText}＝${entry.elements
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
