/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // Adjust paths as needed
    './public/index.html',
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
      },
      fontWeight: {
        semibold: 500,  // Ensure this is correctly set
        // Add other weights if needed
      }
    },
  },
  plugins: [],
}
