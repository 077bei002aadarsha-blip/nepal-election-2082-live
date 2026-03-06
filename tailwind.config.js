/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nc: { light: "#1a56db", DEFAULT: "#1a56db", dark: "#1e40af" },
        uml: { light: "#e02424", DEFAULT: "#e02424", dark: "#9b1c1c" },
        maoist: { light: "#ff5a1f", DEFAULT: "#ff5a1f", dark: "#c2410c" },
        rpp: { light: "#16a34a", DEFAULT: "#16a34a", dark: "#14532d" },
        rastriya: { light: "#7c3aed", DEFAULT: "#7c3aed", dark: "#581c87" },
        janajati: { light: "#0891b2", DEFAULT: "#0891b2", dark: "#164e63" },
        other: { light: "#6b7280", DEFAULT: "#6b7280", dark: "#374151" },
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-in-out",
        ticker: "ticker 0.3s ease-out",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0", transform: "translateY(10px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        ticker: { "0%": { transform: "translateY(-100%)" }, "100%": { transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};
