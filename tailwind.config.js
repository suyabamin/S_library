/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#087F5B',
          hover: '#06684B',
          soft: '#E8F5EF',
          50: '#F0FDF4',
          100: '#E8F5EF',
          200: '#C6E7D9',
          300: '#8FD1B5',
          400: '#4AB689',
          500: '#087F5B',
          600: '#06684B',
          700: '#05543D',
          800: '#054331',
          900: '#032C20',
        },
        accent: {
          DEFAULT: '#168AAD',
          hover: '#137492',
          soft: '#E0F2FE',
        },
        brand: {
          text: '#182B25',
          muted: '#64736D',
          bg: '#F6F9F7',
          surface: '#FFFFFF',
          border: '#DDE7E1',
          success: '#16803C',
          warning: '#B7791F',
          danger: '#C0392B',
        }
      },
      fontFamily: {
        bengali: ['"Hind Siliguri"', '"Noto Sans Bengali"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        control: '8px',
      },
      boxShadow: {
        card: '0 2px 10px rgba(16, 45, 34, 0.06)',
        'card-hover': '0 8px 24px rgba(16, 45, 34, 0.12)',
      }
    },
  },
  plugins: [],
};
