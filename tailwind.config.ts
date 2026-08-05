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
        /** app shell: one near-white page, white cards, hairline borders */
        ink: "#F5F5F7",
        panel: "#FFFFFF",
        raised: "#F5F5F7",
        line: "#E8E8ED",
        edge: "#D2D2D7",
        /** border of anything you can type in or choose */
        control: "#C9C9CE",
        /** text */
        fg: "#1D1D1F",
        muted: "#6E6E73",
        faint: "#86868B",
        /** accents */
        accent: "#0071E3",
        accentDark: "#0058B9",
        accentSoft: "#EBF4FE",
        danger: "#D0342C",
        /** donation call to action */
        coffee: "#FFDE47",
        coffeeDark: "#FFC400",
        coffeeInk: "#3D2E00",
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
      borderRadius: {
        card: "18px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0, 0, 0, 0.03)",
        lift: "0 10px 34px rgba(0, 0, 0, 0.09)",
        field: "none",
      },
    },
  },
  plugins: [],
} satisfies Config;
