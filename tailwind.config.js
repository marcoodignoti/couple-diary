/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Couple Diary warm palette
        primary: {
          DEFAULT: '#E8B4B8',
          light: '#F5D4D7',
          dark: '#D99CA1',
        },
        secondary: {
          DEFAULT: '#A7C7E7',
          light: '#C5DBF0',
          dark: '#89B5DE',
        },
        accent: {
          gold: '#FFD700',
          rose: '#FFB6C1',
        },
        background: {
          DEFAULT: '#FAF9F6',
          dark: '#1A1A2E',
        },
        text: {
          DEFAULT: '#2C3E50',
          light: '#F5F5F5',
          muted: '#7F8C8D',
        },
        fog: {
          DEFAULT: 'rgba(200, 200, 200, 0.8)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
