import { Cormorant_Garamond, Shippori_Mincho, Zen_Kaku_Gothic_New } from "next/font/google";

export const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  display: "swap",
  variable: "--font-display",
});

export const minchoFont = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
  preload: false,
  variable: "--font-mincho",
});

export const gothicFont = Zen_Kaku_Gothic_New({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  preload: false,
  variable: "--font-gothic",
});

/** Returns the primary family name (without fallbacks) for use with document.fonts.load(). */
export function primaryFamily(fontFamily: string): string {
  return fontFamily.split(",")[0].trim();
}

export const CANVAS_FONTS = {
  mincho: {
    id: "mincho",
    label: "明朝",
    stack: `${minchoFont.style.fontFamily}, "Hiragino Mincho ProN", "Yu Mincho", serif`,
    primary: primaryFamily(minchoFont.style.fontFamily),
  },
  gothic: {
    id: "gothic",
    label: "ゴシック",
    stack: `${gothicFont.style.fontFamily}, "Hiragino Sans", "Yu Gothic", sans-serif`,
    primary: primaryFamily(gothicFont.style.fontFamily),
  },
} as const;

export type CanvasFontId = keyof typeof CANVAS_FONTS;
