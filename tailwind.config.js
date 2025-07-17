/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Blue to light blue gradient palette system
        'primary': {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc5fb',
          400: '#36a9f7',
          500: '#0c8ee7',
          600: '#0072c3',
          700: '#005a9e',
          800: '#004d85',
          900: '#00416f',
          950: '#002a4d',
        },
        'secondary': {
          50: '#f0faff',
          100: '#e0f5fe',
          200: '#bae8fd',
          300: '#7dd5fb',
          400: '#38bef7',
          500: '#06a6e9',
          600: '#0085c5',
          700: '#006a9e',
          800: '#005885',
          900: '#004a70',
          950: '#002e4a',
        },
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px',
      },
      borderRadius: {
        'glass-card': '16px',
        'glass-button': '12px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
        'glass-hover': '0 8px 32px rgba(0, 0, 0, 0.15)',
        'glass-active': '0 4px 16px rgba(0, 0, 0, 0.2)',
        'mobile': '0 -2px 10px rgba(0, 0, 0, 0.1)',
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        'blue-gradient': 'linear-gradient(135deg, #0072c3 0%, #38bef7 100%)',
        'blue-light-gradient': 'linear-gradient(135deg, #38bef7 0%, #bae8fd 100%)',
        'blue-dark-gradient': 'linear-gradient(135deg, #004d85 0%, #0072c3 100%)',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
        'touch-target': '44px', // Minimum touch target size
      },
      minWidth: {
        'touch': '44px', // Minimum touch target width
      },
      minHeight: {
        'touch': '44px', // Minimum touch target height
      },
      fontSize: {
        'mobile-xs': '0.75rem',   // 12px
        'mobile-sm': '0.875rem',  // 14px
        'mobile-base': '1rem',    // 16px
        'mobile-lg': '1.125rem',  // 18px
        'mobile-xl': '1.25rem',   // 20px
      },
    },
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      // Breakpoints for device types
      'mobile': {'max': '639px'},
      'tablet': {'min': '640px', 'max': '1023px'},
      'desktop': {'min': '1024px'},
      // Breakpoints for orientation
      'portrait': {'raw': '(orientation: portrait)'},
      'landscape': {'raw': '(orientation: landscape)'},
      // Breakpoints for device features
      'touch': {'raw': '(hover: none) and (pointer: coarse)'},
      'stylus': {'raw': '(hover: none) and (pointer: fine)'},
      'mouse': {'raw': '(hover: hover) and (pointer: fine)'},
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    // Custom plugin for mobile-specific utilities
    function({ addUtilities }) {
      const newUtilities = {
        '.touch-action-none': {
          'touch-action': 'none',
        },
        '.touch-action-manipulation': {
          'touch-action': 'manipulation',
        },
        '.tap-highlight-transparent': {
          '-webkit-tap-highlight-color': 'transparent',
        },
        '.safe-bottom': {
          'padding-bottom': 'env(safe-area-inset-bottom)',
        },
        '.safe-top': {
          'padding-top': 'env(safe-area-inset-top)',
        },
        '.container-responsive': {
          'width': '100%',
          'margin-left': 'auto',
          'margin-right': 'auto',
          'padding-left': '1rem',
          'padding-right': '1rem',
          '@screen sm': {
            'max-width': '640px',
          },
          '@screen md': {
            'max-width': '768px',
          },
          '@screen lg': {
            'max-width': '1024px',
          },
          '@screen xl': {
            'max-width': '1280px',
          },
        },
        '.mobile-bottom-nav': {
          'position': 'fixed',
          'bottom': '0',
          'left': '0',
          'right': '0',
          'padding-bottom': 'env(safe-area-inset-bottom)',
          'background': 'rgba(15, 23, 42, 0.8)',
          'backdrop-filter': 'blur(20px)',
          'box-shadow': '0 -2px 10px rgba(0, 0, 0, 0.1)',
          'z-index': '50',
        },
      };
      addUtilities(newUtilities);
    },
  ],
}

