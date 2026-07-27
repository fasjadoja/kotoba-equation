import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /** app shell */
        ink: "#F1F4F9",
        panel: "#FFFFFF",
        raised: "#F6F8FC",
        line: "#E5E9F2",
        edge: "#D3DAE8",
        /** text */
        fg: "#161C2A",
        muted: "#586275",
        faint: "#8792A5",
        /** accents */
        accent: "#2B4EE6",
        accentDark: "#1F3ACC",
        danger: "#E0463C",
      },
      fontFamily: {
        sans: [
          "var(--font-ui)",
          "var(--font-jp-sans)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Hiragino Sans",
          "Yu Gothic",
          "sans-serif",
        ],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      letterSpacing: {
        brand: "0.22em",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.04), 0 8px 24px rgba(16, 24, 40, 0.05)",
        lift: "0 2px 4px rgba(16, 24, 40, 0.05), 0 18px 40px rgba(16, 24, 40, 0.09)",
        field: "inset 0 1px 2px rgba(16, 24, 40, 0.04)",
      },
    },
  },
  plugins: [],
} satisfies Config;
