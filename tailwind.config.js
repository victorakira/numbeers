/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        "purple-heart": {
          50: "#eef0ff",
          100: "#e1e4fe",
          200: "#c8cdfd",
          300: "#a7acfa",
          400: "#8784f5",
          500: "#7266ee",
          600: "#563adf",
          700: "#563bc7",
          800: "#4533a0",
          900: "#3c307f",
          950: "#241c4a",
        },
      },
    },
  },
  plugins: [],
};
