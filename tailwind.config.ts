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
        ink: "#F2F4F3",
        panel: "#FFFFFF",
        raised: "#F7F8F7",
        line: "#E5E8E6",
        edge: "#D4D9D6",
        /** text */
        fg: "#151A18",
        muted: "#55605B",
        faint: "#8A938E",
        /** accents */
        accent: "#0E7C66",
        accentDark: "#0A6152",
        danger: "#C2453C",
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
        card: "0 1px 2px rgba(18, 26, 22, 0.04), 0 6px 18px rgba(18, 26, 22, 0.04)",
        lift: "0 2px 4px rgba(18, 26, 22, 0.05), 0 16px 34px rgba(18, 26, 22, 0.08)",
        field: "inset 0 1px 2px rgba(18, 26, 22, 0.035)",
      },
    },
  },
  plugins: [],
} satisfies Config;
