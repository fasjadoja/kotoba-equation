export type Theme = {
  id: string;
  name: string;
  background: string;
  frame: string;
  brand: string;
  title: string;
  equals: string;
  element: string;
  operator: string;
  note: string;
  author: string;
  swatch: string;
};

export const THEMES: Theme[] = [
  {
    id: "paper",
    name: "Paper",
    background: "#F6F4EF",
    frame: "#DCD7CB",
    brand: "#A8A093",
    title: "#1B1A16",
    equals: "#C3BCAC",
    element: "#1B1A16",
    operator: "#A8A093",
    note: "#877F71",
    author: "#A8A093",
    swatch: "#F6F4EF",
  },
  {
    id: "blanc",
    name: "Blanc",
    background: "#FFFFFF",
    frame: "#E8E8E6",
    brand: "#B0AFAB",
    title: "#111111",
    equals: "#CFCECA",
    element: "#111111",
    operator: "#B0AFAB",
    note: "#8A8985",
    author: "#B0AFAB",
    swatch: "#FFFFFF",
  },
  {
    id: "ink",
    name: "Ink",
    background: "#14140F",
    frame: "#302F27",
    brand: "#6C6A5E",
    title: "#F4F2EC",
    equals: "#4A493F",
    element: "#F4F2EC",
    operator: "#807D70",
    note: "#948F80",
    author: "#6C6A5E",
    swatch: "#14140F",
  },
];

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
