/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        canvas: {
          grouped: "#F2F2F7",
        },
        surface: {
          card: "#FFFFFF",
          glass: "rgba(255, 255, 255, 0.85)",
          subtle: "#F1F5F9",
        },
        brand: {
          primary: "#2A134D",
          "primary-light": "#3E1B6B",
        },
        action: {
          orange: "#FF5E00",
        },
        text: {
          label: "#000000",
          secondary: "#8E8E93",
        },
        status: {
          success: "#34C759",
          warning: "#FF9500",
          error: "#FF3B30",
          info: "#007AFF",
        },
      },
      borderRadius: {
        squircle: "22px",
      },
    },
  },
  plugins: [],
};
