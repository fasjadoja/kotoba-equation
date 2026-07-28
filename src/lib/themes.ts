export type Theme = {
  id: string;
  name: string;
  background: string;
  frame: string;
  /** Wordmark text next to the logo mark. */
  brand: string;
  /** Brand-colored detail such as the relation glyph. */
  accent: string;
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
    frame: "#E5E9EE",
    brand: "#98A2AE",
    accent: "#0B6BCB",
    title: "#131820",
    element: "#131820",
    operator: "#1478DC",
    note: "#5C6672",
    hashtag: "#9AA3AF",
    author: "#98A2AE",
    swatch: "#FFFFFF",
  },
  {
    id: "slate",
    name: "Mist",
    background: "#F1F4F8",
    frame: "#DFE4EB",
    brand: "#8C94A0",
    accent: "#0B6BCB",
    title: "#151B23",
    element: "#151B23",
    operator: "#1478DC",
    note: "#58636F",
    hashtag: "#909aa6",
    author: "#8C94A0",
    swatch: "#F1F4F8",
  },
  {
    id: "dark",
    name: "Ink",
    background: "#111722",
    frame: "#2A3242",
    brand: "#7E8896",
    accent: "#4B9BFF",
    title: "#F2F4F8",
    element: "#F2F4F8",
    operator: "#68AEFF",
    note: "#A7B0BE",
    hashtag: "#7E8896",
    author: "#7E8896",
    swatch: "#111722",
  },
];

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
