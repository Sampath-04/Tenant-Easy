// Reusable CSS class constants for consistent styling across the application

export const LAYOUT_CLASSES = {
  // Main container layout with responsive padding and max width
  MAIN_CONTAINER: " mx-auto px-4 md:px-6 py-4",
  
  // Common card/container styling with backdrop blur and borders
  CARD_CONTAINER: "bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50",
  
  // Enhanced card styling with higher opacity
  CARD_CONTAINER_ENHANCED: "bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/50",
  
  // Glass morphism effect for overlays and modals
  GLASS_MORPHISM: "bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-xl",
  
  // Common button styling
  BUTTON_PRIMARY: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200",
  BUTTON_SECONDARY: "px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 rounded-md transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/30",
  
  // Status badge styling
  STATUS_ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  STATUS_INACTIVE: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  
  // Text styling
  TEXT_PRIMARY: "text-gray-900 dark:text-white",
  TEXT_SECONDARY: "text-gray-600 dark:text-gray-400",
  TEXT_MUTED: "text-gray-500 dark:text-gray-500",
  
  // Spacing utilities
  SECTION_SPACING: "mb-8",
  ITEM_SPACING: "space-y-4",
  GRID_LAYOUT: "grid grid-cols-2 gap-4",
} as const;

// Type for accessing the constants
export type LayoutClassKey = keyof typeof LAYOUT_CLASSES;
