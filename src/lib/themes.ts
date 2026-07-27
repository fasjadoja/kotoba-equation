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
    id: "light",
    name: "Light",
    background: "#FFFFFF",
    frame: "#E4E7EB",
    brand: "#A6ADB6",
    title: "#0B0D10",
    equals: "#D3D8DE",
    element: "#0B0D10",
    operator: "#9BA3AD",
    note: "#6B7280",
    author: "#A6ADB6",
    swatch: "#FFFFFF",
  },
  {
    id: "slate",
    name: "Slate",
    background: "#F4F6F8",
    frame: "#DDE2E8",
    brand: "#98A1AC",
    title: "#101317",
    equals: "#C9D0D8",
    element: "#101317",
    operator: "#8B95A1",
    note: "#5F6874",
    author: "#98A1AC",
    swatch: "#F4F6F8",
  },
  {
    id: "dark",
    name: "Dark",
    background: "#0B0D10",
    frame: "#22272E",
    brand: "#5A626C",
    title: "#F2F4F6",
    equals: "#333A43",
    element: "#F2F4F6",
    operator: "#6E7783",
    note: "#98A1AC",
    author: "#5A626C",
    swatch: "#0B0D10",
  },
];

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
