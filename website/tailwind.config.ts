import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'beeline-yellow': '#FFC107',
        'beeline-yellow-dark': '#FFB300',
        'beeline-yellow-light': '#FFF9E6',
        'beeline-cream': '#FFFBF0',
        'beeline-black': '#1a1a1a',
        'beeline-gray': '#F0F3F5',
        'beeline-gray-light': '#F8FAFB',
        // Dark mode colors
        'dark-bg': '#0a0a0a',
        'dark-bg-secondary': '#1a1a1a',
        'dark-bg-tertiary': '#2a2a2a',
        'dark-text': '#e5e5e5',
        'dark-text-secondary': '#a3a3a3',
        'dark-border': '#333333',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-warm': 'linear-gradient(135deg, #FFF9E6 0%, #FFE8B3 50%, #FFD6A1 100%)',
        'gradient-soft': 'linear-gradient(135deg, #FFF9E6 0%, #FFFFFF 100%)',
        'gradient-card': 'linear-gradient(to bottom, #FFFFFF 0%, #F8FAFB 100%)',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.05)',
        'medium': '0 4px 12px rgba(0, 0, 0, 0.12), 0 12px 32px rgba(0, 0, 0, 0.08)',
        'hover': '0 8px 20px rgba(255, 193, 7, 0.25), 0 16px 40px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};

export default config;
