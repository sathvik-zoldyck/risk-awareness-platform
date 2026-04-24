import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        headline: ['Sora', 'sans-serif'],
        code: ['DM Mono', 'monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: '#00D4FF',
          foreground: '#0A0C10',
        },
        secondary: {
          DEFAULT: '#7B61FF',
          foreground: '#F0F4F8',
        },
        muted: {
          DEFAULT: 'rgba(255, 255, 255, 0.05)',
          foreground: '#6B7280',
        },
        accent: {
          DEFAULT: 'rgba(0, 212, 255, 0.1)',
          foreground: '#00D4FF',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#F0F4F8',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        border: 'rgba(255, 255, 255, 0.07)',
        input: 'rgba(255, 255, 255, 0.05)',
        ring: '#00D4FF',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;