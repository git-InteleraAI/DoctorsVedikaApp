/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./index.ts",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0284C7", // Healthcare Primary Blue
          light: "#38BDF8",
          dark: "#0369A1",
        },
        emerald: {
          DEFAULT: "#0F766E", // Medical Emerald Accent
          light: "#14B8A6",
          dark: "#115E59",
        },
        accent: "#F0FDFA",
        surface: "#F8FAFC",
      },
    },
  },
  plugins: [],
};
