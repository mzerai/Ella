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
          primary: {
            DEFAULT: "#0F3460",
            light: "#1A4A7A",
            dark: "#0A2647",
            bg: "#EBF0F7",
          },
          accent: {
            DEFAULT: "#E94560",
            light: "#FF6B6B",
            dark: "#C73E54",
            bg: "#FDF0F2",
          },
          dark: {
            DEFAULT: "#16213E",
            light: "#1A2744",
            text: "#E8E8F0",
          },
          success: {
            DEFAULT: "#2ECC71",
            bg: "#EEFBF4",
          },
          warning: {
            DEFAULT: "#F39C12",
            bg: "#FEF9EC",
          },
          gray: {
            50: "#F8F9FA",
            100: "#F1F3F5",
            200: "#E9ECEF",
            300: "#DEE2E6",
            500: "#868E96",
            700: "#495057",
            900: "#212529",
          },
        },
      },
      fontFamily: {
        heading: ['"DM Sans"', "sans-serif"],
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
