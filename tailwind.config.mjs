/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        // 白守专属配色：深蓝灰主调 + 浅蓝点缀
        void: '#0a0f1e',
        surface: '#101728',
        surfaceLight: '#1a2138',
        accent: '#9AD4EA',
        accentDeep: '#6fb4d0',
        textPrimary: '#e8eaed',
        textSecondary: '#a0a8b8',
        textMuted: '#6b7488',
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        display: ['"Noto Sans SC"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
        cardLg: '16px',
      },
      backdropBlur: {
        soft: '8px',
      },
    },
  },
  plugins: [],
};