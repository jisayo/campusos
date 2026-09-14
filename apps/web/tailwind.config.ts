import type { Config } from 'tailwindcss';

// Token system per brief §33 (black, gold, neutral; premium, not generic portal).
// Avoiding the near-black-#111 + single-accent-color "AI default" trap by
// giving gold a specific hue (amber-leaning, not neon) and pairing it with
// a warm-neutral (not pure) black.
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0E0D0B',       // base background — warm black, not #000/#111
        surface: '#17150F',   // card/panel background
        border: '#2A2620',    // hairline borders
        gold: '#D9A441',      // primary accent — muted amber gold, not neon
        'gold-bright': '#F0C265',
        bone: '#EDE8DD',      // primary text on dark
        muted: '#9C9384',     // secondary text
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],   // headline personality
        sans: ['"Inter"', 'sans-serif'],    // body/UI
      },
    },
  },
  plugins: [],
};

export default config;
