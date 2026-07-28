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
        ink: "#F1F4F8",
        panel: "#FFFFFF",
        raised: "#F6F8FB",
        line: "#E4E8EE",
        edge: "#D3D9E2",
        /** border of anything you can type in or choose */
        control: "#A9B6C8",
        /** text */
        fg: "#151A22",
        muted: "#556170",
        faint: "#8A93A0",
        /** accents */
        accent: "#0B6BCB",
        accentDark: "#08529E",
        danger: "#C2453C",
        /** donation call to action */
        coffee: "#FFC13B",
        coffeeDark: "#F5A700",
        coffeeInk: "#4A3208",
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
        card: "0 1px 2px rgba(18, 26, 38, 0.04), 0 6px 18px rgba(18, 26, 38, 0.04)",
        lift: "0 2px 4px rgba(18, 26, 38, 0.05), 0 16px 34px rgba(18, 26, 38, 0.08)",
        field: "inset 0 1px 2px rgba(18, 26, 38, 0.035)",
      },
    },
  },
  plugins: [],
} satisfies Config;
