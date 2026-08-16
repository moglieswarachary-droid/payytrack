/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        red: {
          primary:   '#C62828',
          strong:    '#D32F2F',
          dark:      '#8E1B1B',
          soft:      '#FDECEC',
          'very-soft': '#FFF6F6',
        },
        surface:    '#FFFFFF',
        background: '#FAFAFA',
        text: {
          primary:   '#171717',
          secondary: '#666666',
          muted:     '#999999',
        },
        border:     '#EAEAEA',
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'fin-xl':  ['2.5rem',  { lineHeight: '1', letterSpacing: '-0.03em', fontWeight: '700' }],
        'fin-lg':  ['1.875rem',{ lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '600' }],
        'fin-md':  ['1.375rem',{ lineHeight: '1.1', letterSpacing: '-0.01em', fontWeight: '600' }],
      },
      borderRadius: {
        card:   '16px',
        btn:    '10px',
        input:  '8px',
      },
      boxShadow: {
        card:   '0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px 0 rgba(0,0,0,0.05)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.10)',
        'red':  '0 4px 14px 0 rgba(198,40,40,0.25)',
      },
      animation: {
        'fade-in':   'fadeIn 0.2s ease-out',
        'slide-up':  'slideUp 0.25s ease-out',
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:      { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:     { from: { transform: 'translateY(8px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        slideInRight:{ from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        pulseSoft:   { '0%,100%': { opacity: '0.7' }, '50%': { opacity: '1' } },
      },
    },
  },
  plugins: [],
}
