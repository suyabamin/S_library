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
          DEFAULT: '#00A8DC',
          hover: '#008FC7',
          soft: '#E8F6FD',
          50: '#F2FAFE',
          100: '#E8F6FD',
          200: '#C7E8F8',
          300: '#8BD2F0',
          400: '#3BBDE8',
          500: '#00A8DC',
          600: '#008FC7',
          700: '#0073A8',
          800: '#005B85',
          900: '#123047',
        },
        accent: {
          DEFAULT: '#D71920',
          hover: '#B71419',
          soft: '#FDE8E8',
        },
        brand: {
          text: '#123047',
          muted: '#617789',
          bg: '#F2FAFE',
          surface: '#FFFFFF',
          border: '#D9EDF7',
          success: '#16803C',
          warning: '#B7791F',
          danger: '#D71920',
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
        card: '0 2px 10px rgba(0, 143, 199, 0.08)',
        'card-hover': '0 8px 24px rgba(0, 143, 199, 0.16)',
      }
    },
  },
  plugins: [],
};
