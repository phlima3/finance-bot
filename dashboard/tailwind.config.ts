import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          card: 'var(--bg-card)',
          'card-hover': 'var(--bg-card-hover)',
        },
        accent: {
          gold: 'var(--accent-gold)',
          'gold-dim': 'var(--accent-gold-dim)',
          'gold-glow': 'var(--accent-gold-glow)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        income: {
          DEFAULT: 'var(--color-income)',
          dim: 'var(--color-income-dim)',
        },
        expense: {
          DEFAULT: 'var(--color-expense)',
          dim: 'var(--color-expense-dim)',
        },
        border: {
          subtle: 'var(--border-subtle)',
          gold: 'var(--border-gold)',
        },
      },
      fontFamily: {
        sans: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
