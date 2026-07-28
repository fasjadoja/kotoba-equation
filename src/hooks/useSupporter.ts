"use client";

import { useCallback, useEffect, useState } from "react";
import {
  UNLOCK_ORDER,
  UNLOCK_RULES,
  UNLOCK_TOKENS,
  type UnlockRank,
} from "@/lib/site";

const STORAGE_KEY = "formula-studio.supporter";
/** Query parameter appended to the thank-you redirect of the donation page. */
export const SUPPORTER_PARAM = "thanks";

type Unlock = {
  rank: UnlockRank;
  expiresAt: number;
  /** Images left that may carry the lockup; null means unlimited. */
  left: number | null;
};

function rankFromToken(token: string): UnlockRank | null {
  return (
    UNLOCK_ORDER.find((rank) => UNLOCK_TOKENS[rank] === token) ?? null
  );
}

function grant(rank: UnlockRank): Unlock {
  const rule = UNLOCK_RULES[rank];
  return {
    rank,
    expiresAt: Date.now() + rule.windowMs,
    left: rule.exports,
  };
}

function isLive(unlock: Unlock | null): unlock is Unlock {
  if (!unlock) return false;
  if (unlock.expiresAt <= Date.now()) return false;
  return unlock.left === null || unlock.left > 0;
}

function read(): Unlock | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    // The first version of this stored a bare expiry timestamp.
    const legacy = Number(raw);
    if (Number.isFinite(legacy) && legacy > 0) {
      return { rank: "supporter", expiresAt: legacy, left: null };
    }
    const value = JSON.parse(raw) as Partial<Unlock>;
    const rank = UNLOCK_ORDER.find((id) => id === value.rank);
    if (!rank || typeof value.expiresAt !== "number") return null;
    const left =
      typeof value.left === "number" ? Math.max(0, Math.floor(value.left)) : null;
    return { rank, expiresAt: value.expiresAt, left };
  } catch {
    return null;
  }
}

function write(unlock: Unlock | null) {
  try {
    if (unlock) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(unlock));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private mode: the unlock simply lasts for this visit.
  }
}

/**
 * Unlocks the donor-only lockups after someone comes back from the payment
 * page. Each payment link carries its own token, so the amount decides the
 * rank. The flag lives in the browser only: it is a thank-you, not a licence
 * check, so it is deliberately simple and forgiving.
 */
export function useSupporter() {
  const [unlock, setUnlock] = useState<Unlock | null>(null);
  const [justUnlocked, setJustUnlocked] = useState<UnlockRank | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get(SUPPORTER_PARAM);
    const rank = token ? rankFromToken(token) : null;
    if (rank) {
      const granted = grant(rank);
      write(granted);
      setUnlock(granted);
      setJustUnlocked(rank);
      url.searchParams.delete(SUPPORTER_PARAM);
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
      return;
    }
    const stored = read();
    setUnlock(isLive(stored) ? stored : null);
    if (stored && !isLive(stored)) write(null);
  }, []);

  const active = isLive(unlock);
  const rank = active && unlock ? unlock.rank : null;
  const rule = rank ? UNLOCK_RULES[rank] : null;
  const left = active && unlock ? unlock.left : null;

  /** Called once per exported image so limited ranks run out as promised. */
  const spend = useCallback(() => {
    setUnlock((previous) => {
      if (!isLive(previous) || previous.left === null) return previous;
      const next = { ...previous, left: previous.left - 1 };
      write(next.left > 0 ? next : null);
      return next.left > 0 ? next : null;
    });
  }, []);

  const dismiss = useCallback(() => setJustUnlocked(null), []);

  /** Rounded up so "あと0時間" never shows while the unlock is still valid. */
  const hoursLeft =
    active && unlock
      ? Math.max(1, Math.ceil((unlock.expiresAt - Date.now()) / 3_600_000))
      : 0;

  return { active, rank, rule, left, hoursLeft, justUnlocked, dismiss, spend };
}
