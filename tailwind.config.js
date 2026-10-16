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
          50: '#F0F7F3',
          100: '#EEF5EF',
          200: '#D5E6D8',
          500: '#2A7A57',
          600: '#1B6547',
          700: '#14533B', // Primary deep forest green
          800: '#103D2C', // Dark evergreen
          900: '#0B291D',
        },
        surface: {
          bg: '#F8FAF8',
          card: '#FFFFFF',
          mint: '#EEF5EF',
          muted: '#F1F5F2',
          border: '#E2E9E3',
        },
        ink: {
          primary: '#18231D',
          secondary: '#66736B',
          tertiary: '#94A39A',
          inverse: '#FFFFFF',
        },
        status: {
          critical: {
            text: '#991B1B',
            bg: '#FEF2F2',
            border: '#FCA5A5',
            badge: '#B91C1C'
          },
          warning: {
            text: '#854D0E',
            bg: '#FEFCE8',
            border: '#FDE047',
            badge: '#D6A441'
          },
          success: {
            text: '#166534',
            bg: '#F0FDF4',
            border: '#86EFAC',
            badge: '#15803D'
          },
          info: {
            text: '#1E40AF',
            bg: '#EFF6FF',
            border: '#93C5FD',
            badge: '#2563EB'
          },
          neutral: {
            text: '#374151',
            bg: '#F3F4F6',
            border: '#E5E7EB',
            badge: '#6B7280'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(24, 35, 29, 0.05)',
        'card': '0 1px 3px 0 rgba(24, 35, 29, 0.08), 0 1px 2px -1px rgba(24, 35, 29, 0.08)',
        'card-hover': '0 4px 6px -1px rgba(24, 35, 29, 0.08), 0 2px 4px -2px rgba(24, 35, 29, 0.05)',
        'modal': '0 20px 25px -5px rgba(24, 35, 29, 0.1), 0 8px 10px -6px rgba(24, 35, 29, 0.06)',
      }
    },
  },
  plugins: [],
}
