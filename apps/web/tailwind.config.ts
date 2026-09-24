import type { Config } from 'tailwindcss';

// Colors reference CSS variables (defined per-theme in globals.css) rather
// than fixed hex values. This is what makes light/dark mode work without
// touching a single page: every existing `bg-ink`, `text-bone`, etc. call
// site keeps working exactly as written — only the underlying variable
// value changes depending on the active theme. The `<alpha-value>` token
// is Tailwind's syntax for keeping opacity modifiers (e.g. `border-gold/30`,
// used throughout the app already) working with CSS-variable colors.
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'rgb(var(--ink) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        gold: 'rgb(var(--gold) / <alpha-value>)',
        'gold-bright': 'rgb(var(--gold-bright) / <alpha-value>)',
        bone: 'rgb(var(--bone) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
