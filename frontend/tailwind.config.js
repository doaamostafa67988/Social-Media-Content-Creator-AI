/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"DM Mono"', '"Fira Code"', 'monospace'],
        head: ['Syne', 'sans-serif'],
      },
      colors: {
        accent: "#c8f060",
        blue:   "#5b6bfa",
        green:  "#40d996",
        pink:   "#fa5b8a",
      },
    },
  },
  plugins: [],
}
