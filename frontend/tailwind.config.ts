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
        ella: {
          amber: {
            50: "#FFF8F0",
            100: "#FAEEDA",
            200: "#F5DEB5",
            400: "#EF9F27",
            600: "#D4882B",
            800: "#854F0B",
            900: "#633806",
          },
          teal: {
            50: "#E1F5EE",
            100: "#9FE1CB",
            400: "#1D9E75",
            600: "#0F6E56",
            800: "#085041",
            900: "#04342C",
          },
          coral: {
            50: "#FAECE7",
            100: "#F5C4B3",
            400: "#D85A30",
            600: "#993C1D",
            800: "#712B13",
          },
          gray: {
            50: "#FAF9F6",
            100: "#F3F1EC",
            200: "#E8E6DF",
            300: "#D3D1C7",
            500: "#888780",
            700: "#5F5E5A",
            800: "#444441",
            900: "#2C2C2A",
          },
        },
      },
      fontFamily: {
        heading: ['"DM Serif Display"', "serif"],
        body: ['"DM Sans"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "pulse-warm": "pulseWarm 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseWarm: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
