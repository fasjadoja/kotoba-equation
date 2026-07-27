export type Theme = {
  id: string;
  name: string;
  pro: boolean;
  background: string;
  backgroundTo?: string;
  frame: string;
  badge: string;
  badgeText: string;
  brand: string;
  title: string;
  equals: string;
  element: string;
  highlight: string;
  operator: string;
  note: string;
  author: string;
  watermark: string;
};

export const THEMES: Theme[] = [
  {
    id: "light",
    name: "クリーン",
    pro: false,
    background: "#ffffff",
    frame: "#e2e8f0",
    badge: "#2563eb",
    badgeText: "#ffffff",
    brand: "#64748b",
    title: "#0f172a",
    equals: "#94a3b8",
    element: "#0f172a",
    highlight: "#059669",
    operator: "#e11d48",
    note: "#64748b",
    author: "#94a3b8",
    watermark: "#cbd5e1",
  },
  {
    id: "midnight",
    name: "ミッドナイト",
    pro: false,
    background: "#0b1220",
    backgroundTo: "#111c33",
    frame: "#1e293b",
    badge: "#3b82f6",
    badgeText: "#ffffff",
    brand: "#94a3b8",
    title: "#f8fafc",
    equals: "#475569",
    element: "#e2e8f0",
    highlight: "#34d399",
    operator: "#fb7185",
    note: "#94a3b8",
    author: "#64748b",
    watermark: "#334155",
  },
  {
    id: "paper",
    name: "ペーパー",
    pro: true,
    background: "#faf7f0",
    frame: "#e7ddc8",
    badge: "#7c5f2b",
    badgeText: "#fffdf7",
    brand: "#8a7b5e",
    title: "#2b2418",
    equals: "#c2b493",
    element: "#2b2418",
    highlight: "#a1622a",
    operator: "#b4530f",
    note: "#6f6350",
    author: "#a3937a",
    watermark: "#e0d5bd",
  },
  {
    id: "ocean",
    name: "オーシャン",
    pro: true,
    background: "#062a3f",
    backgroundTo: "#0b4f6c",
    frame: "#12617f",
    badge: "#22d3ee",
    badgeText: "#04222f",
    brand: "#8ed7e8",
    title: "#f0fbff",
    equals: "#3f8fa8",
    element: "#e2f6fc",
    highlight: "#fbbf24",
    operator: "#7dd3fc",
    note: "#a5dbe9",
    author: "#5f9fb4",
    watermark: "#0f5674",
  },
  {
    id: "sakura",
    name: "サクラ",
    pro: true,
    background: "#fff5f7",
    backgroundTo: "#ffe9ef",
    frame: "#fbcfda",
    badge: "#e11d48",
    badgeText: "#ffffff",
    brand: "#b0748a",
    title: "#4c1130",
    equals: "#e2a8ba",
    element: "#4c1130",
    highlight: "#be123c",
    operator: "#f43f5e",
    note: "#96637a",
    author: "#c58fa2",
    watermark: "#f6d3dc",
  },
  {
    id: "mono",
    name: "モノクローム",
    pro: true,
    background: "#111111",
    frame: "#2b2b2b",
    badge: "#f5f5f5",
    badgeText: "#111111",
    brand: "#8a8a8a",
    title: "#fafafa",
    equals: "#4d4d4d",
    element: "#fafafa",
    highlight: "#facc15",
    operator: "#a3a3a3",
    note: "#9c9c9c",
    author: "#6b6b6b",
    watermark: "#2f2f2f",
  },
];

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
