export type Theme = {
  id: string;
  name: string;
  background: string;
  frame: string;
  /** Wordmark text next to the logo mark. */
  brand: string;
  /** Logo mark fill and any brand-colored detail. */
  accent: string;
  /** Glyph drawn inside the logo mark. */
  onAccent: string;
  /** Dot grid printed behind the composition. */
  grid: string;
  title: string;
  element: string;
  operator: string;
  note: string;
  author: string;
  swatch: string;
};

export const THEMES: Theme[] = [
  {
    id: "light",
    name: "Paper",
    background: "#FFFFFF",
    frame: "#E7EAF2",
    brand: "#96A0B2",
    accent: "#2B4EE6",
    onAccent: "#FFFFFF",
    grid: "#EEF1F8",
    title: "#0F1524",
    element: "#0F1524",
    operator: "#6C7BE0",
    note: "#5B6472",
    author: "#96A0B2",
    swatch: "#FFFFFF",
  },
  {
    id: "slate",
    name: "Mist",
    background: "#F3F5FA",
    frame: "#E0E5F0",
    brand: "#8A94A6",
    accent: "#2B4EE6",
    onAccent: "#FFFFFF",
    grid: "#E7EBF5",
    title: "#131A2A",
    element: "#131A2A",
    operator: "#6C7BE0",
    note: "#5A6474",
    author: "#8A94A6",
    swatch: "#F3F5FA",
  },
  {
    id: "dark",
    name: "Ink",
    background: "#101728",
    frame: "#26314A",
    brand: "#7C89A6",
    accent: "#6C8CFF",
    onAccent: "#101728",
    grid: "#182137",
    title: "#F3F6FC",
    element: "#F3F6FC",
    operator: "#8FA4FF",
    note: "#A9B4C9",
    author: "#7C89A6",
    swatch: "#101728",
  },
];

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
