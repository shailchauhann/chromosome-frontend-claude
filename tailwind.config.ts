import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx}',
    './content/**/*.mdx',
    './lib/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0A0A0B',
          surface: '#141414',
          gold: '#E8B11E',
          'gold-soft': '#F4C842',
          text: '#F5F2E8',
          muted: '#A8A29A',
          rule: '#2A2A2A',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Bodoni Moda', 'Didot', 'serif'],
        sub: ['var(--font-sub)', 'Cormorant Garamond', 'Playfair Display', 'serif'],
        body: ['var(--font-body)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Fluid display scale — clamp(min, preferred, max)
        'display-xl': ['clamp(3rem, 9vw, 12rem)', { lineHeight: '0.92', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2.5rem, 7vw, 8rem)', { lineHeight: '0.95', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(2rem, 5vw, 5rem)', { lineHeight: '1', letterSpacing: '-0.015em' }],
      },
      letterSpacing: {
        tight: '-0.01em',
      },
      transitionTimingFunction: {
        cinematic: 'cubic-bezier(0.65, 0.05, 0.36, 1)',
      },
      animation: {
        'marquee-l': 'marquee-l 40s linear infinite',
        'marquee-r': 'marquee-r 40s linear infinite',
        'scroll-cue': 'scroll-cue 1.8s ease-in-out infinite',
        'page-curtain': 'page-curtain 0.6s cubic-bezier(0.65,0.05,0.36,1) forwards',
      },
      keyframes: {
        'marquee-l': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-r': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'scroll-cue': {
          '0%, 100%': { transform: 'translateY(0)', opacity: '0.6' },
          '50%': { transform: 'translateY(8px)', opacity: '1' },
        },
        // Gold curtain wipe between routes — slides up from below, holds, exits up.
        'page-curtain': {
          '0%': { transform: 'scaleY(0)', transformOrigin: 'bottom' },
          '45%': { transform: 'scaleY(1)', transformOrigin: 'bottom' },
          '55%': { transform: 'scaleY(1)', transformOrigin: 'top' },
          '100%': { transform: 'scaleY(0)', transformOrigin: 'top' },
        },
      },
    },
  },
  plugins: [typography],
};

export default config;
