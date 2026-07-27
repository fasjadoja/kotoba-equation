import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { LIMITS, MAX_ELEMENTS, type FormulaConfig, type FormulaElement } from "./types";

/**
 * Opt-in public gallery. Nothing is sent anywhere unless the user ticks
 * 「みんなの作品に載せる」, and only the text of the formula is stored.
 */
export const GALLERY_LIMIT = 20;

const TABLE = "public_formulas";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const galleryEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export type GalleryItem = {
  id: string;
  createdAt: string;
  resultText: string;
  relation: string;
  elements: FormulaElement[];
  subNote: string;
  hashtags: string;
  author: string;
};

type GalleryRow = {
  id: string;
  created_at: string;
  result_text: string;
  relation: string;
  elements: unknown;
  sub_note: string;
  hashtags: string;
  author: string;
};

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (!galleryEnabled) return null;
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
  }
  return client;
}

/** Removes control characters and clamps to the same limits as the editor. */
function clean(value: unknown, limit: number): string {
  if (typeof value !== "string") return "";
  const stripped = value.replace(/[\p{Cc}\p{Cf}]/gu, " ").trim();
  return Array.from(stripped).slice(0, limit).join("");
}

function toElements(value: unknown): FormulaElement[] {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, MAX_ELEMENTS)
    .map((raw) => {
      const element = raw as Partial<FormulaElement>;
      return {
        op: clean(element.op, LIMITS.operator),
        text: clean(element.text, LIMITS.element),
      };
    })
    .filter((element) => element.text.length > 0);
}

export function toGalleryItem(value: unknown): GalleryItem | null {
  if (typeof value !== "object" || value === null) return null;
  const row = value as Partial<GalleryRow>;
  if (typeof row.id !== "string" || typeof row.created_at !== "string") return null;
  const resultText = clean(row.result_text, LIMITS.resultText);
  const elements = toElements(row.elements);
  if (!resultText || elements.length === 0) return null;
  return {
    id: row.id,
    createdAt: row.created_at,
    resultText,
    relation: clean(row.relation, LIMITS.relation) || "＝",
    elements,
    subNote: clean(row.sub_note, LIMITS.subNote),
    hashtags: clean(row.hashtags, LIMITS.hashtags),
    author: clean(row.author, LIMITS.author),
  };
}

export async function fetchLatest(): Promise<GalleryItem[]> {
  const supabase = getClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, created_at, result_text, relation, elements, sub_note, hashtags, author")
    .order("created_at", { ascending: false })
    .limit(GALLERY_LIMIT);
  if (error || !data) return [];
  return data
    .map(toGalleryItem)
    .filter((item): item is GalleryItem => item !== null);
}

/** Streams newly published formulas so the list stays live without polling. */
export function subscribeToInserts(onInsert: (item: GalleryItem) => void): () => void {
  const supabase = getClient();
  if (!supabase) return () => {};
  const channel = supabase
    .channel("public_formulas_stream")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: TABLE },
      (payload) => {
        const item = toGalleryItem(payload.new);
        if (item) onInsert(item);
      },
    )
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}

export async function publish(config: FormulaConfig): Promise<boolean> {
  const supabase = getClient();
  if (!supabase) return false;
  const elements = toElements(config.elements);
  const resultText = clean(config.resultText, LIMITS.resultText);
  if (!resultText || elements.length === 0) return false;
  const { error } = await supabase.from(TABLE).insert({
    result_text: resultText,
    relation: clean(config.relation, LIMITS.relation) || "＝",
    elements,
    sub_note: clean(config.subNote, LIMITS.subNote),
    hashtags: clean(config.hashtags, LIMITS.hashtags),
    author: clean(config.author, LIMITS.author),
  });
  return !error;
}

export function galleryText(item: GalleryItem): string {
  const right = item.elements
    .map((element, index) => (index === 0 ? element.text : `${element.op}${element.text}`))
    .join("");
  return `${item.resultText}${item.relation}${right}`;
}

export function relativeTime(iso: string, now: number = Date.now()): string {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  return `${Math.floor(hours / 24)}日前`;
}
