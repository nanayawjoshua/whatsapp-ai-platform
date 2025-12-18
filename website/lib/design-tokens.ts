/**
 * Adonis Golden Ratio Design System
 * Based on the golden ratio (φ = 1.618)
 * All proportions and spacing follow golden ratio relationships
 */

export const goldenRatio = 1.618;

/**
 * Spacing Scale (powers of φ)
 * Base unit: 4px
 */
export const spacing = {
  xs: `${4 / goldenRatio}px`,      // 2.48px
  sm: '4px',                       // Base unit
  md: `${4 * goldenRatio}px`,      // 6.47px
  lg: `${4 * goldenRatio ** 2}px`, // 10.47px
  xl: `${4 * goldenRatio ** 3}px`, // 16.94px
  '2xl': `${4 * goldenRatio ** 4}px`, // 27.41px
  '3xl': `${4 * goldenRatio ** 5}px`, // 44.35px
  '4xl': `${4 * goldenRatio ** 6}px`, // 71.76px
  '5xl': `${4 * goldenRatio ** 7}px`, // 116.11px
};

/**
 * Typography Scale (powers of φ)
 */
export const typography = {
  fontSize: {
    xs: `${12 / goldenRatio}px`,      // 7.42px
    sm: '12px',
    base: `${12 * goldenRatio}px`,    // 19.42px
    lg: `${12 * goldenRatio ** 2}px`, // 31.42px
    xl: `${12 * goldenRatio ** 3}px`, // 50.84px
    '2xl': `${12 * goldenRatio ** 4}px`, // 82.26px
    '3xl': `${12 * goldenRatio ** 5}px`, // 133.10px
    '4xl': `${12 * goldenRatio ** 6}px`, // 215.36px
  },
  lineHeight: {
    tight: goldenRatio - 0.2,  // 1.418
    normal: goldenRatio,        // 1.618
    relaxed: goldenRatio + 0.2, // 1.818
  },
};

/**
 * Layout Proportions
 */
export const layout = {
  sidebar: {
    collapsed: `${64 / goldenRatio}px`, // 39.57px
    expanded: '256px', // 64 * 4
  },
  header: {
    height: '64px', // 64px
  },
  card: {
    padding: `${16 * goldenRatio}px`, // 25.89px
    borderRadius: `${8 * goldenRatio}px`, // 12.94px
  },
  button: {
    height: `${40 * goldenRatio}px`, // 64.72px
    paddingX: `${16 * goldenRatio}px`, // 25.89px
  },
};

/**
 * Component Ratios
 */
export const components = {
  aspectRatio: {
    card: goldenRatio,        // 1.618:1
    avatar: 1,                // 1:1
    logo: goldenRatio / 2,    // 0.809:1 (wider)
    hero: goldenRatio * 2,    // 3.236:1 (very wide)
  },
  iconSize: {
    xs: `${16 / goldenRatio}px`,     // 9.89px
    sm: '16px',
    md: `${16 * goldenRatio}px`,     // 25.89px
    lg: `${16 * goldenRatio ** 2}px`, // 41.89px
    xl: `${16 * goldenRatio ** 3}px`, // 67.78px
  },
};

/**
 * Animation Timing (powers of φ)
 */
export const animation = {
  duration: {
    fast: `${150 / goldenRatio}ms`,     // 92.86ms
    normal: '150ms',
    slow: `${150 * goldenRatio}ms`,     // 242.7ms
  },
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)', // Material Design easing
};

/**
 * Color Harmony (golden ratio based)
 */
export const color = {
  opacity: {
    disabled: 1 / goldenRatio ** 2, // 0.382
    hover: 1 / goldenRatio,         // 0.618
    active: goldenRatio - 1,        // 0.618
  },
};