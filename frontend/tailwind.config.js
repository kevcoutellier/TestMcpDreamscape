/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'float-slow': 'float 15s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      },
      backgroundImage: {
        'hero-pattern': "url('https://images.unsplash.com/photo-1642427749670-f20e2e76ed8c?auto=format&fit=crop&q=80')",
      },
    },
  },
  plugins: [],
};