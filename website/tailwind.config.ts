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
        // Brand Colors (Keep the gradient)
        'beeline-yellow': '#F9C74F',
        'beeline-orange': '#F3722C',
        'beeline-amber': '#C97E2F',

        // Premium Light Theme (Apple/Stripe-inspired)
        'cream': '#FFFBF5',           // Primary background - warm, not stark
        'cream-dark': '#F8F5F0',      // Secondary background
        'cream-border': '#E8E4DF',    // Warm gray borders

        // Text Hierarchy
        'text-primary': '#1A1A1A',    // Near black, high contrast
        'text-secondary': '#6B6B6B',  // Medium gray
        'text-tertiary': '#9B9B9B',   // Light gray

        // Surface
        'surface': '#FFFFFF',          // Pure white cards
        'surface-hover': '#FAFAFA',    // Subtle hover state

        // Accents
        'success': '#10B981',          // Green for success states
        'warning': '#F59E0B',          // Amber for warnings
        'error': '#EF4444',            // Red for errors

        // Legacy (for backwards compatibility during migration)
        'beeline-black': '#1a1a1a',
        'beeline-cream': '#FFFBF5',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        // Premium Light Theme Gradients
        'gradient-beeline': 'linear-gradient(135deg, #F9C74F 0%, #F3722C 100%)',
        'gradient-cream': 'linear-gradient(to bottom, #FFFBF5 0%, #F8F5F0 100%)',
        'gradient-warm': 'radial-gradient(circle at top, rgba(249, 199, 79, 0.08) 0%, transparent 60%)',
        'gradient-glow': 'radial-gradient(circle at 50% 0%, rgba(249, 199, 79, 0.12) 0%, transparent 50%)',
        'gradient-card': 'linear-gradient(to bottom, #FFFFFF 0%, #FAFAFA 100%)',
        'gradient-mesh': 'radial-gradient(at 40% 20%, rgba(249, 199, 79, 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(243, 114, 44, 0.15) 0px, transparent 50%)',
      },
      boxShadow: {
        // Premium Light Theme Shadows (Subtle, not heavy)
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'soft': '0 2px 8px rgba(0, 0, 0, 0.06), 0 4px 16px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 12px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.06)',
        'large': '0 8px 24px rgba(0, 0, 0, 0.10), 0 16px 48px rgba(0, 0, 0, 0.08)',
        'hover': '0 8px 20px rgba(249, 199, 79, 0.20), 0 12px 32px rgba(0, 0, 0, 0.08)',
        'glow': '0 0 32px rgba(249, 199, 79, 0.25)',
        'glow-lg': '0 0 48px rgba(249, 199, 79, 0.35)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        blink: 'blink 1s infinite',
      },
    },
  },
  plugins: [],
};

export default config;
