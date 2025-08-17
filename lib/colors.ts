// Global Color Management for Easy Tenant Application

export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',   // Main primary color
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },

  // Success Colors (Green)
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',   // Your selected color
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Error Colors (Red)
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Warning Colors (Amber/Orange)
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Info Colors (Blue)
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Neutral/Gray Colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Background Colors
  background: {
    light: '#ffffff',
    dark: '#0a0a0a',
    gray: {
      light: '#f9fafb',
      dark: '#1f2937',
    },
  },

  // Text Colors
  text: {
    primary: {
      light: '#111827',
      dark: '#f9fafb',
    },
    secondary: {
      light: '#6b7280',
      dark: '#d1d5db',
    },
    muted: {
      light: '#9ca3af',
      dark: '#6b7280',
    },
  },

  // Border Colors
  border: {
    light: '#e5e7eb',
    dark: '#374151',
    focus: '#3b82f6',
  },

  // Status Colors (simplified access)
  status: {
    success: '#16a34a',      // Your selected green
    error: '#dc2626',
    warning: '#f59e0b',
    info: '#3b82f6',
  },
} as const;

// Toast-specific colors
export const toastColors = {
  success: {
    background: colors.success[600],  // #16a34a
    text: '#ffffff',
    progress: colors.success[700],    // Darker green for progress
  },
  error: {
    background: colors.error[600],
    text: '#ffffff',
    progress: colors.error[700],
  },
  warning: {
    background: colors.warning[500],
    text: '#ffffff',
    progress: colors.warning[600],
  },
  info: {
    background: colors.info[500],
    text: '#ffffff',
    progress: colors.info[600],
  },
} as const;

// Utility functions for color usage
export const getColor = (colorPath: string) => {
  const keys = colorPath.split('.');
  let result: any = colors;
  
  for (const key of keys) {
    result = result[key];
    if (result === undefined) {
      console.warn(`Color path "${colorPath}" not found`);
      return '#000000'; // fallback
    }
  }
  
  return result;
};

// Common color combinations
export const colorCombinations = {
  // Button variants
  primaryButton: {
    background: colors.primary[500],
    hover: colors.primary[600],
    text: '#ffffff',
  },
  successButton: {
    background: colors.success[600],  // Your selected color
    hover: colors.success[700],
    text: '#ffffff',
  },
  dangerButton: {
    background: colors.error[600],
    hover: colors.error[700],
    text: '#ffffff',
  },
  
  // Card styles
  card: {
    background: {
      light: colors.background.light,
      dark: colors.background.dark,
    },
    border: {
      light: colors.border.light,
      dark: colors.border.dark,
    },
  },
} as const;

export default colors;
