/** @type {import('tailwindcss').Config} */
export default {
  content: {
    primary: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  },
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Swiss design tokens
        surface: '#FFFFFF',
        'surface-muted': '#F7F7F8',
        'surface-card': '#FAFAFA',
        accent: '#002FA7',
        'accent-hover': '#00268a',
        'signal-online': '#1B8C3E',
        'signal-offline': '#C62828',
        'signal-warning': '#E65100',
        'signal-synced': '#1B8C3E',
        border: '#E0E0E0',
        'text-primary': '#1A1A1A',
        'text-secondary': '#6B6B6B',
        'bg-panel': '#F5F5F5',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      spacing: {
        'grid': '8px',
        'touch': '44px',
      },
      borderRadius: {
        'card': '8px',
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0,0,0,0.08)',
        'card': '0 1px 3px rgba(0,0,0,0.08)',
        'elevated': '0 2px 12px rgba(0,0,0,0.04)',
      },
    },
  },
}