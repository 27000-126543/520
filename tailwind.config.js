/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1536px',
      }
    },
    extend: {
      colors: {
        'arcane': {
          50: '#f5f0ff',
          100: '#ede0ff',
          200: '#d9c2ff',
          300: '#b899ff',
          400: '#8f66ff',
          500: '#6b33ff',
          600: '#5a1aeb',
          700: '#4a0fc9',
          800: '#3d10a3',
          900: '#1a0a2e',
          950: '#0d0517',
        },
        'gold': {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#d4af37',
          600: '#b8942a',
          700: '#9a7a1f',
          800: '#7c6118',
          900: '#654f14',
        },
        'blood': {
          400: '#b22222',
          500: '#8b0000',
          600: '#700000',
          700: '#5a0000',
        },
        'shadow': {
          500: '#2d1b69',
          600: '#1f1347',
          700: '#150d30',
        },
        'mystic': {
          400: '#6366f1',
          500: '#4f46e5',
          600: '#4338ca',
        }
      },
      fontFamily: {
        'display': ['Cinzel Decorative', 'serif'],
        'body': ['JetBrains Mono', 'monospace'],
        'gothic': ['Cinzel', 'serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'magic': 'magic 1.5s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #d4af37, 0 0 10px #d4af37' },
          '100%': { boxShadow: '0 0 20px #d4af37, 0 0 30px #d4af37, 0 0 40px #d4af37' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        magic: {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-arcane': 'linear-gradient(135deg, #1a0a2e 0%, #2d1b69 50%, #1a0a2e 100%)',
        'gradient-gold': 'linear-gradient(135deg, #d4af37 0%, #fbbf24 50%, #d4af37 100%)',
        'parchment': 'linear-gradient(135deg, #f5e6d3 0%, #e8d4a8 100%)',
      },
      boxShadow: {
        'gold': '0 0 20px rgba(212, 175, 55, 0.5)',
        'purple': '0 0 20px rgba(107, 51, 255, 0.5)',
        'inner-glow': 'inset 0 0 20px rgba(212, 175, 55, 0.2)',
      },
    },
  },
  plugins: [],
};
