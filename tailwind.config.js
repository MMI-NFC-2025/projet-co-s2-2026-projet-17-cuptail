/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Google Sans"', '"Google Sans Text"', 'Inter', 'Arial', 'sans-serif'],
      },
      colors: {
        brand: {
          turquoise: 'var(--color-turquoise)',
          turquoiseDark: 'var(--color-turquoise-dark)',
          green: 'var(--color-green)',
          greenSoft: 'var(--color-green-soft)',
          red: 'var(--color-red)',
          warmGray: 'var(--color-warm-gray)',
          paleGray: 'var(--color-pale-gray)',
          sectionMint: 'var(--color-section-mint)',
          teaGreen: 'var(--color-tea-green)',
        },
      },
      backgroundImage: {
        spring: 'var(--gradient-spring)',
        hero: 'var(--gradient-hero)',
        seaBreeze: 'var(--gradient-sea-breeze)',
        cottonCandy: 'var(--gradient-cotton-candy)',
        lavender: 'var(--gradient-lavender)',
        quiz: 'var(--gradient-quiz)',
        card: 'var(--gradient-card)',
        mint: 'var(--gradient-mint)',
        button: 'var(--gradient-button)',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        button: 'var(--shadow-button)',
        card: 'var(--shadow-card)',
        panel: 'var(--shadow-panel)',
        strongButton: 'var(--shadow-strong-button)',
      },
    },
  },
  plugins: [],
};