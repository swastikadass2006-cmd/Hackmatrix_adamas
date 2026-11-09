/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        tl: {
          canvas: "#070B11",
          panel: "#0E1520",
          card: "#131C2A",
          elevated: "#141E2E",
          overlay: "#162235",
          hover: "#1F2D40",
          border: "#223042",
          "border-active": "#32455C",
          "text-primary": "#E9EEF5",
          "text-secondary": "#9EABC0",
          "text-muted": "#778496",
          "text-bright": "#F1F5F9",
          cyan: "#43B9DB",
          emerald: "#45C69B",
          amber: "#F59E0B",
          orange: "#F97316",
          rose: "#F43F5E",
          steel: "#94A3B8",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['var(--font-mono)', '"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      boxShadow: {
        'panel': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'elevated': '0 12px 36px 0 rgba(0, 0, 0, 0.45)',
        'overlay': '0 20px 50px rgba(0, 0, 0, 0.6)',
        'cyan-glow': '0 0 25px rgba(67, 185, 219, 0.25)',
        'glass-inner': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.08)',
      },
      borderRadius: {
        'panel': '16px',
        'card': '12px',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
