/** @type {import('tailwindcss').Config} */
const { baseTailwindConfig } = require("@repo/tailwind-config");

module.exports = {
  ...baseTailwindConfig,
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
    "../../packages/theme-provider/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    ...baseTailwindConfig.theme,
    extend: {
      ...baseTailwindConfig.theme.extend,
      colors: {
        ...baseTailwindConfig.theme.extend.colors,
        filter: {
          DEFAULT: "#ffffff",
          dark: "#141414",
        },
      },
    },
  },
}
