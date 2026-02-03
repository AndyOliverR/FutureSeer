/**
 * Material 3 Animation Presets
 * Reusable animation configurations following Material 3 design principles
 * https://m3.material.io/styles/motion/overview
 */

import { Variants, Transition } from 'framer-motion'

/**
 * Material 3 Spring Physics Configuration
 * Standard easing curves for Material 3 animations
 */
export const m3SpringConfig: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
  mass: 0.8
}

/**
 * Material 3 Bouncy Spring (for interactive elements)
 */
export const m3BouncySpring: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 25,
  mass: 0.7
}

/**
 * Material 3 Smooth Ease (for transitions)
 */
export const m3SmoothEase: Transition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1] // Material 3 standard easing curve
}

/**
 * Material 3 Page Transition
 */
export const m3PageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

/**
 * Material 3 Card Hover Animation
 */
export const m3CardHover: Variants = {
  rest: { 
    scale: 1,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
  },
  hover: { 
    scale: 1.02,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
    transition: m3BouncySpring
  }
}

/**
 * Material 3 Button Press Animation
 */
export const m3ButtonPress: Variants = {
  rest: { scale: 1 },
  pressed: { 
    scale: 0.95,
    transition: { duration: 0.1 }
  }
}

/**
 * Material 3 Fade In Animation
 */
export const m3FadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: m3SmoothEase
  },
  exit: { 
    opacity: 0,
    transition: m3SmoothEase
  }
}

/**
 * Material 3 Slide Up Animation
 */
export const m3SlideUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: m3SpringConfig
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: m3SmoothEase
  }
}

/**
 * Material 3 Scale Animation (for icons, badges)
 */
export const m3Scale: Variants = {
  initial: { scale: 0 },
  animate: { 
    scale: 1,
    transition: m3BouncySpring
  }
}

/**
 * Material 3 Collapse Animation (for accordions)
 */
export const m3Collapse: Variants = {
  collapsed: { 
    height: 0, 
    opacity: 0,
    transition: m3SmoothEase
  },
  expanded: { 
    height: 'auto', 
    opacity: 1,
    transition: m3SpringConfig
  }
}

/**
 * Material 3 Elevation Shadow Classes
 * Dynamic elevation for Material 3 cards
 */
export const m3Elevation = {
  level0: 'shadow-none',
  level1: 'shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)]',
  level2: 'shadow-[0_3px_6px_rgba(0,0,0,0.16),0_3px_6px_rgba(0,0,0,0.23)]',
  level3: 'shadow-[0_10px_20px_rgba(0,0,0,0.19),0_6px_6px_rgba(0,0,0,0.23)]',
  level4: 'shadow-[0_14px_28px_rgba(0,0,0,0.25),0_10px_10px_rgba(0,0,0,0.22)]',
  level5: 'shadow-[0_19px_38px_rgba(0,0,0,0.30),0_15px_12px_rgba(0,0,0,0.22)]'
}

/**
 * Material 3 Hover Elevation
 */
export const m3HoverElevation = {
  base: m3Elevation.level2,
  hover: m3Elevation.level4
}
