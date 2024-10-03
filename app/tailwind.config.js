/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#AFEEEE", // Light cyan
        secondary: "#F6C1A6", // Light coral
        background: "#F6F6F6", // Light gray
        highlight: "#D5A6C4", // Light pink
        green: "#9BCA9C", // Light green
      },
      extend: {
        keyframes: {
          fadeIn: {
            "0%": { opacity: 0 },
            "100%": { opacity: 1 },
          },
          fadeOut: {
            "0%": { opacity: 1 },
            "100%": { opacity: 0 },
          },
        },
        animation: {
          "fade-in": "fadeIn 0.3s ease-in",
          "fade-out": "fadeOut 0.3s ease-out",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/aspect-ratio")],
};
