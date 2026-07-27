"use client";

import { useCallback, useEffect, useState } from "react";
import { SUPPORTER_KEY, SUPPORTER_WINDOW_MS } from "@/lib/site";

const STORAGE_KEY = "formula-studio.supporter";
/** Query parameter appended to the thank-you redirect of the donation page. */
export const SUPPORTER_PARAM = "thanks";

function readExpiry(): number {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const value = raw ? Number(raw) : 0;
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

/**
 * Unlocks the supporter-only logo for a day after someone comes back from the
 * donation page. The flag lives in the browser only: it is a thank-you, not a
 * licence check, so it is deliberately simple and forgiving.
 */
export function useSupporter() {
  const [expiresAt, setExpiresAt] = useState(0);
  const [justUnlocked, setJustUnlocked] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get(SUPPORTER_PARAM);
    if (token && token === SUPPORTER_KEY) {
      const until = Date.now() + SUPPORTER_WINDOW_MS;
      try {
        window.localStorage.setItem(STORAGE_KEY, String(until));
      } catch {
        // Still unlocked for this visit even if it cannot be remembered.
      }
      setExpiresAt(until);
      setJustUnlocked(true);
      url.searchParams.delete(SUPPORTER_PARAM);
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
      return;
    }
    setExpiresAt(readExpiry());
  }, []);

  const active = expiresAt > Date.now();

  const dismiss = useCallback(() => setJustUnlocked(false), []);

  /** Rounded up so "あと0時間" never shows while the unlock is still valid. */
  const hoursLeft = active
    ? Math.max(1, Math.ceil((expiresAt - Date.now()) / 3_600_000))
    : 0;

  return { active, hoursLeft, justUnlocked, dismiss };
}
