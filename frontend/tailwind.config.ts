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
          brand: "#D4AF37", // Rich executive brushed gold
        },
        navy: {
          brand: "#0B192C", // Deep executive midnight slate
        },
        gold: {
          brand: "#F1C40F", // Vibrant accent gold
        },
        orange: {
          brand: "#E67E22", // Warm energetic bronze
        },
        cream: {
          brand: "#F8F9FA", // Crisp corporate platinum/off-white
        },
        sage: {
          brand: "#4A5D6E", // Sophisticated slate gray
        },
        teal: {
          brand: "#1ABC9C", // Modern executive teal
        },
        brown: {
          brand: "#1E293B", // Sleek charcoal slate
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
