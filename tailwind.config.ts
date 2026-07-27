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
        /** warm greige stage the canvas sits on */
        stage: "#EFEDE7",
        paper: "#FBFAF7",
        ink: "#1B1A16",
        muted: "#8C877B",
        faint: "#B4AEA1",
        line: "#DFDACE",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: [
          "var(--font-gothic)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Hiragino Sans",
          "Yu Gothic",
          "sans-serif",
        ],
      },
      letterSpacing: {
        brand: "0.36em",
      },
    },
  },
  plugins: [],
} satisfies Config;
