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
        'beeline-yellow': '#F9C74F',
        'beeline-orange': '#F3722C',
        'beeline-amber': '#C97E2F',
        'beeline-yellow-dark': '#FFB300',
        'beeline-yellow-light': '#FFF9E6',
        'beeline-cream': '#FFF4E6',
        'beeline-black': '#1a1a1a',
        'beeline-gray': '#F0F3F5',
        'beeline-gray-light': '#F8FAFB',
        // Dark mode colors - Darker & more translucent
        'dark-bg': '#0F0F0F',
        'dark-bg-secondary': '#1A1A1A',
        'dark-bg-tertiary': '#242424',
        'dark-text': '#FFFFFF',
        'dark-text-secondary': 'rgba(255, 255, 255, 0.7)',
        'dark-text-tertiary': 'rgba(255, 255, 255, 0.5)',
        'dark-border': 'rgba(249, 199, 79, 0.1)',
        // Glass colors
        'glass-bg': 'rgba(26, 26, 26, 0.6)',
        'glass-border': 'rgba(249, 199, 79, 0.1)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-warm': 'linear-gradient(135deg, #FFF9E6 0%, #FFE8B3 50%, #FFD6A1 100%)',
        'gradient-soft': 'linear-gradient(135deg, #FFF9E6 0%, #FFFFFF 100%)',
        'gradient-card': 'linear-gradient(to bottom, #FFFFFF 0%, #F8FAFB 100%)',
        'gradient-beeline': 'linear-gradient(135deg, #F9C74F 0%, #F3722C 100%)',
        'gradient-dark-glow': 'radial-gradient(circle at 50% 0%, rgba(249, 199, 79, 0.15) 0%, transparent 50%)',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.05)',
        'medium': '0 4px 12px rgba(0, 0, 0, 0.12), 0 12px 32px rgba(0, 0, 0, 0.08)',
        'hover': '0 8px 20px rgba(255, 193, 7, 0.25), 0 16px 40px rgba(0, 0, 0, 0.1)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow': '0 0 40px rgba(249, 199, 79, 0.3)',
        'glow-lg': '0 0 60px rgba(249, 199, 79, 0.5)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
};

export default config;
