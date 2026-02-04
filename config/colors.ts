/**
 * Color theme configuration
 * Use these colors with Tailwind CSS by extending the config
 */

export const colors = {
  // Primary colors
  primary: "#dc2626", // Red-600
  primaryLight: "#ef4444", // Red-500
  primaryDark: "#991b1b", // Red-900
  primaryBg: "#fef2f2", // Red-50

  // Secondary colors
  secondary: "#f59e0b", // Amber-500
  secondaryLight: "#fbbf24", // Amber-400
  secondaryDark: "#d97706", // Amber-600
  secondaryBg: "#fffbeb", // Amber-50

  // Neutral colors
  white: "#ffffff",
  black: "#000000",
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray600: "#4b5563",
  gray700: "#374151",
  gray800: "#1f2937",
  gray900: "#111827",

  // Semantic colors
  success: "#10b981", // Green-500
  successBg: "#ecfdf5", // Green-50
  warning: "#f59e0b", // Amber-500
  warningBg: "#fffbeb", // Amber-50
  error: "#ef4444", // Red-500
  errorBg: "#fef2f2", // Red-50
  info: "#3b82f6", // Blue-500
  infoBg: "#eff6ff", // Blue-50
};

export type ColorKey = keyof typeof colors;
