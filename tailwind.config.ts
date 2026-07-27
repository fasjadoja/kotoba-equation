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
        ink: "#0B0D10",
        panel: "#111418",
        raised: "#161A1F",
        line: "#20252C",
        edge: "#2C333B",
        /** text */
        fg: "#E7EAEE",
        muted: "#98A1AC",
        faint: "#6B7580",
        /** accents */
        accent: "#7AA2F7",
        danger: "#E5484D",
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
    },
  },
  plugins: [],
} satisfies Config;
