import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f7f2",
          100: "#dbeef0",
          200: "#b8dfc4",
          300: "#8ac99f",
          400: "#5ba97a",
          500: "#36885b",
          600: "#276e48",
          700: "#21583b",
          800: "#1d4732",
          900: "#193c2b",
          forest: "#1a4731",
          forestHover: "#153a28",
          accent: "#226645",
        },
        cream: {
          50: "#fffefc",
          100: "#faf7f2",
          200: "#f5f0e6",
          300: "#ece3d4",
          card: "#f6f2ec",
        },
        sage: {
          50: "#f4f8f4",
          100: "#e5ede5",
          200: "#d3e2d3",
          300: "#b5ccb5",
          banner: "#dae6d7",
        },
        mint: {
          50: "#f0f9f4",
          100: "#e0f2e8",
          200: "#c4e7d4",
        },
        peach: {
          50: "#fff8f5",
          100: "#fdeee5",
          200: "#fbdccb",
          accent: "#f97316",
        },
        charcoal: {
          900: "#18201b",
          800: "#242e28",
          700: "#37433c",
          600: "#5a6860",
          500: "#76857d",
          400: "#9daaa2",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        handwriting: ["var(--font-caveat)", "cursive"],
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.02)",
        card: "0 4px 20px -2px rgba(24, 32, 27, 0.05)",
        cardHover: "0 10px 25px -4px rgba(24, 32, 27, 0.09)",
      },
    },
  },
  plugins: [],
};
export default config;
