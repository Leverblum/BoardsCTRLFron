/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Asegúrate de que Tailwind busque en todos tus archivos .js y .jsx
  ],
  theme: {
    extend: {
      keyframes: {
        progress: {
          '0%': {width: '100%' },
          '100%': {width: '0%'},
        },
      },
      animation: {
          progress: 'progress var (--tw-duration) linear forwards'
      },
    },
  },
  plugins: [],
};
