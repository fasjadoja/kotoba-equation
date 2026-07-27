import { Inter, JetBrains_Mono, Noto_Sans_JP, Noto_Sans_Mono } from "next/font/google";

export const uiFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-ui",
});

export const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-mono",
});

export const jpSansFont = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  preload: false,
  variable: "--font-jp-sans",
});

export const jpMonoFont = Noto_Sans_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  preload: false,
  variable: "--font-jp-mono",
});

/** Returns the primary family name (without fallbacks) for use with document.fonts.load(). */
export function primaryFamily(fontFamily: string): string {
  return fontFamily.split(",")[0].trim();
}

export const CANVAS_FONTS = {
  sans: {
    id: "sans",
    label: "Sans",
    stack: `${uiFont.style.fontFamily}, ${jpSansFont.style.fontFamily}, "Hiragino Sans", "Yu Gothic", sans-serif`,
    families: [primaryFamily(uiFont.style.fontFamily), primaryFamily(jpSansFont.style.fontFamily)],
  },
  mono: {
    id: "mono",
    label: "Mono",
    stack: `${monoFont.style.fontFamily}, ${jpMonoFont.style.fontFamily}, "Hiragino Sans", monospace`,
    families: [
      primaryFamily(monoFont.style.fontFamily),
      primaryFamily(jpMonoFont.style.fontFamily),
    ],
  },
} as const;

export type CanvasFontId = keyof typeof CANVAS_FONTS;
