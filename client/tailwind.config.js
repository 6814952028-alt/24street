/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: { paper: "#f6f1e8", ink: "#151515", rust: "#e26f42", sage: "#a9c5b6", sun: "#e7cd3f" },
      fontFamily: { display: ["Oswald", "sans-serif"], serif: ["Fraunces", "serif"], mono: ["DM Mono", "monospace"] }
    }
  },
  plugins: []
};
