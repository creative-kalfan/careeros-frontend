// src/lib/motion.ts
// Shared motion variants for CareerOS spatial UI
// All durations in seconds. Respects prefers-reduced-motion via Framer Motion's built-in support.

import type { Variants, Transition } from 'framer-motion';

// Spring configs
export const spring = {
  snappy: { type: 'spring', stiffness: 400, damping: 30 } as Transition,
  smooth: { type: 'spring', stiffness: 300, damping: 35 } as Transition,
  gentle: { type: 'spring', stiffness: 200, damping: 30 } as Transition,
};

// Easing
export const ease = {
  out: [0.16, 1, 0.3, 1] as [number, number, number, number],
  inOut: [0.45, 0, 0.55, 1] as [number, number, number, number],
};

// Page transitions — direction-aware slide + fade
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 12, scale: 0.995 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -8, scale: 1.002, transition: { duration: 0.14, ease: [0.45, 0, 0.55, 1] } },
};

// Stagger container
export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.04 } },
};

// Stagger item — slide up + fade
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } },
};

// Slide in from right (panel)
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 28 },
  show: { opacity: 1, x: 0, transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.16, ease: [0.45, 0, 0.55, 1] } },
};

// Slide in from left
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } },
};

// Scale in (for cards, modals)
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.14, ease: [0.45, 0, 0.55, 1] } },
};

// Fade only (for reduced-motion contexts)
export const fadeOnly: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, transition: { duration: 0.12 } },
};

// Suggestion card accept/reject
export const suggestionAccept: Variants = {
  idle: { opacity: 1, scale: 1, x: 0 },
  accepted: { opacity: 0, scale: 0.95, x: 16, transition: { duration: 0.22, ease: [0.45, 0, 0.55, 1] } },
  rejected: { opacity: 0, scale: 0.95, x: -16, transition: { duration: 0.22, ease: [0.45, 0, 0.55, 1] } },
};
