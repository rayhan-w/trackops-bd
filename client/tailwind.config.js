/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f5ff',
          100: '#e0ecff',
          200: '#c7dcfe',
          300: '#a2c4fd',
          400: '#75a3fc',
          500: '#467df8',
          600: '#265be7',
          700: '#1d46c8',
          800: '#1a3ca2',
          900: '#0f235d',
          navy: '#0b192c',
          sidebar: '#0e1c36',
          violet: '#6366f1',
          accent: '#3b82f6',
        }
      }
    },
  },
  plugins: [],
}
