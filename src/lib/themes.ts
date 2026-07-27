export type Theme = {
  id: string;
  name: string;
  background: string;
  frame: string;
  brand: string;
  title: string;
  equals: string;
  element: string;
  highlight: string;
  operator: string;
  note: string;
  author: string;
  swatch: string;
};

export const THEMES: Theme[] = [
  {
    id: "light",
    name: "ライト",
    background: "#ffffff",
    frame: "#e6e6e6",
    brand: "#a3a3a3",
    title: "#111111",
    equals: "#c4c4c4",
    element: "#111111",
    highlight: "#111111",
    operator: "#b0b0b0",
    note: "#8a8a8a",
    author: "#b0b0b0",
    swatch: "#ffffff",
  },
  {
    id: "dark",
    name: "ダーク",
    background: "#101010",
    frame: "#2a2a2a",
    brand: "#6f6f6f",
    title: "#fafafa",
    equals: "#4a4a4a",
    element: "#fafafa",
    highlight: "#fafafa",
    operator: "#767676",
    note: "#8f8f8f",
    author: "#6f6f6f",
    swatch: "#101010",
  },
];

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
