/**
 * The public gallery is the only place where text leaves the browser, so it is
 * also the only place worth guarding: links and contact details turn a shared
 * wall into a spam board, and a cooldown keeps one visitor from flooding it.
 */
const LINK =
  /(https?:\/\/|\bwww\.|[a-z0-9-]+\.(?:com|net|org|jp|io|co|me|info|shop|site|xyz|link)\b)/i;
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const PHONE = /\b0\d{1,4}[-\s]?\d{1,4}[-\s]?\d{3,4}\b/;
const ABUSIVE = ["死ね", "殺す", "殺害", "自殺しろ", "消えろ", "ブス", "キチガイ"];

export type PublishCheck = { ok: true } | { ok: false; reason: string };

/** Fields that may legitimately contain an @handle are checked without EMAIL. */
export function checkPublicText(parts: {
  body: string[];
  author: string;
}): PublishCheck {
  const body = parts.body.join(" ");
  const all = `${body} ${parts.author}`;
  if (LINK.test(all)) {
    return { ok: false, reason: "リンクを含む式は公開できません（保存はできます）" };
  }
  if (EMAIL.test(body) || PHONE.test(all)) {
    return {
      ok: false,
      reason: "連絡先を含む式は公開できません（保存はできます）",
    };
  }
  if (ABUSIVE.some((word) => all.includes(word))) {
    return { ok: false, reason: "だれかを傷つける言葉は公開できません（保存はできます）" };
  }
  return { ok: true };
}

const RATE_KEY = "formula-studio.publish-log";
const COOLDOWN_MS = 30_000;
const DAILY_LIMIT = 10;

function readLog(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RATE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is number => typeof value === "number");
  } catch {
    return [];
  }
}

/** Client-side throttle. Supabase row-level rules are the real backstop. */
export function checkPublishRate(now = Date.now()): PublishCheck {
  const recent = readLog().filter((time) => now - time < 24 * 60 * 60 * 1000);
  if (recent.some((time) => now - time < COOLDOWN_MS)) {
    return { ok: false, reason: "公開は30秒に1回までです。少し待ってからお試しください" };
  }
  if (recent.length >= DAILY_LIMIT) {
    return { ok: false, reason: `公開は1日${DAILY_LIMIT}件までです` };
  }
  return { ok: true };
}

export function notePublish(now = Date.now()) {
  if (typeof window === "undefined") return;
  const recent = readLog().filter((time) => now - time < 24 * 60 * 60 * 1000);
  try {
    window.localStorage.setItem(RATE_KEY, JSON.stringify([...recent, now]));
  } catch {
    /* storage full or blocked: the cooldown is a courtesy, not a lock */
  }
}
