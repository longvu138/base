/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
    "../../packages/theme-provider/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--tenant-primary-color)",
        success: "var(--tenant-success-color)",
        warning: "var(--tenant-warning-color)",
        error: "var(--tenant-error-color)",
        border: "var(--tenant-border-color)",
      },
      borderRadius: {
        'antd': 'var(--tenant-radius-antd, 8px)',
      }
    },
  },
}
