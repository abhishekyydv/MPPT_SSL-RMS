/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // watches all JS/TS components
    "./src/**/**/*.{js,jsx,ts,tsx}", // watches deeper nested folders
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1E3A8A",
        secondary: "#10B981",
      },
    },
  },
  plugins: [],
};
