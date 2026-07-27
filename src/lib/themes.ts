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
  /** Hashtag line printed at the bottom left. */
  hashtag: string;
  author: string;
  swatch: string;
};

export const THEMES: Theme[] = [
  {
    id: "light",
    name: "Paper",
    background: "#FFFFFF",
    frame: "#E6E9E7",
    brand: "#98A19C",
    accent: "#0E7C66",
    onAccent: "#FFFFFF",
    grid: "#EDF0EE",
    title: "#131816",
    element: "#131816",
    operator: "#159077",
    note: "#5C6661",
    hashtag: "#9AA39E",
    author: "#98A19C",
    swatch: "#FFFFFF",
  },
  {
    id: "slate",
    name: "Mist",
    background: "#F2F4F3",
    frame: "#E0E4E2",
    brand: "#8C948F",
    accent: "#0E7C66",
    onAccent: "#FFFFFF",
    grid: "#E7EAE8",
    title: "#151B18",
    element: "#151B18",
    operator: "#159077",
    note: "#586360",
    hashtag: "#909995",
    author: "#8C948F",
    swatch: "#F2F4F3",
  },
  {
    id: "dark",
    name: "Ink",
    background: "#121816",
    frame: "#2A322F",
    brand: "#7E8A85",
    accent: "#3FBF9E",
    onAccent: "#0F1513",
    grid: "#1B2320",
    title: "#F2F5F3",
    element: "#F2F5F3",
    operator: "#4FD0AC",
    note: "#A7B2AD",
    hashtag: "#7E8A85",
    author: "#7E8A85",
    swatch: "#121816",
  },
];

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
