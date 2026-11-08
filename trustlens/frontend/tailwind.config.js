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
          canvas: "#090E16",
          panel: "#0E1520",
          card: "#131C2A",
          elevated: "#1A2536",
          hover: "#1F2D40",
          border: "#223042",
          "border-active": "#32455C",
          "text-primary": "#E9EEF5",
          "text-secondary": "#9EABC0",
          "text-muted": "#63738A",
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
        'panel': '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
        'elevated': '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
      },
      borderRadius: {
        'panel': '16px',
        'card': '12px',
      },
    },
  },
  plugins: [],
};
