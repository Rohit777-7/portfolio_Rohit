/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0a0a0b",
        surface: "#121214",
        raised: "#18181b",
        line: "rgba(255,255,255,0.08)",
        fg: "#f2f2ee",
        muted: "#8d8d94",
        accent: "#c8ff3d",
      },
      fontFamily: {
        sans: ['"Inter Tight"', "system-ui", "sans-serif"],
        serif: ['"Instrument Serif"', "Georgia", "serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      screens: {
        xs: "450px",
      },
      maxWidth: {
        site: "1320px",
      },
      letterSpacing: {
        tightest: "-0.05em",
      },
    },
  },
  plugins: [],
};
