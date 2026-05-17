import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        amber: {
          brand: "#C8893A",
        },
        navy: {
          brand: "#1A2A4A",
        },
        gold: {
          brand: "#D4A853",
        },
        orange: {
          brand: "#E07B39",
        },
        cream: {
          brand: "#FAF0DC",
        },
        sage: {
          brand: "#7A9E7E",
        },
        teal: {
          brand: "#4A9E99",
        },
        brown: {
          brand: "#6B4226",
        },
      },
      fontFamily: {
        playfair: ["var(--font-playfair)", "serif"],
        nunito: ["var(--font-nunito)", "sans-serif"],
        bebas: ["var(--font-bebas)", "cursive"],
        montserrat: ["var(--font-montserrat)", "sans-serif"],
      },
      animation: {
        "spin-slow": "spin 4s linear infinite",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
