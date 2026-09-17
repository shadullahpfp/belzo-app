/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          grouped: "#F2F2F7",
        },
        surface: {
          card: "#FFFFFF",
          subtle: "#F8F9FD",
        },
        brand: {
          primary: "#2A134D",
          "primary-light": "#3E1B6B",
          dark: "#170A2D",
        },
        action: {
          orange: "#FF5E00",
          hover: "#E05300",
        },
        status: {
          success: "#34C759",
          warning: "#FF9500",
          error: "#FF3B30",
          info: "#007AFF",
        },
      },
    },
  },
  plugins: [],
};
