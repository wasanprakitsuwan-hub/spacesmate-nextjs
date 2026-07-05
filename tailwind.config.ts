import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        spacemate: {
          brandDark:    '#02402e',   // 50% Primary — Deep Forest Green
          brandTeal:    '#048c73',   // 20% Secondary — Vibrant Teal
          brandGold:    '#d97f11',   // 10% Highlight — Ochre Gold
          textCharcoal: '#231f20',   // Body text
          bgLight:      '#F8FAFC',   // Page background
          white:        '#ffffff',
          borderLight:  '#E2E8F0',
        },
      },
      fontFamily: {
        sans: ['var(--font-prompt)', 'sans-serif'],
      },
      boxShadow: {
        'premium':       '0 4px 20px -2px rgba(2, 64, 46, 0.04)',
        'premium-hover': '0 12px 30px -4px rgba(2, 64, 46, 0.1)',
      },
      backgroundImage: {
        'hero-gradient':  'linear-gradient(135deg, #02402e 0%, #036b52 50%, #048c73 100%)',
        'card-gradient':  'linear-gradient(135deg, #02402e 0%, #048c73 100%)',
        'gold-gradient':  'linear-gradient(135deg, #d97f11 0%, #f0a030 100%)',
      },
    },
  },
  plugins: [],
}

export default config
