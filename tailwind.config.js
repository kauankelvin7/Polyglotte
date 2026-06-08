/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['"Outfit"', 'sans-serif'],
      },
      colors: {
        pg: {
          bg:        '#09090B',
          surface:   '#111113',
          glass:     'rgba(255,255,255,0.05)',
          border:    'rgba(255,255,255,0.08)',
          accent:    '#22d3ee',
          purple:    '#a855f7',
          muted:     'rgba(255,255,255,0.35)',
        }
      },
      backgroundImage: {
        'text-gradient':  'linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #94a3b8 100%)',
        'logo-gradient':  'linear-gradient(90deg, #22d3ee, #a855f7)',
        'card-shine':     'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 60%)',
        'hero-glow':      'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34,211,238,0.15), transparent)',
      },
      animation: {
        'fade-up':    'fadeUp 0.4s ease forwards',
        'shimmer':    'shimmer 1.8s infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:     { '0%': { opacity: 0, transform: 'translateY(12px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        shimmer:    { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } },
        pulseSoft:  { '0%,100%': { opacity: 0.6 }, '50%': { opacity: 1 } },
      }
    },
  },
  plugins: [],
}
