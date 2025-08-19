import { ToastOptions } from 'react-toastify';
import { toastColors } from './colors';

// Base toast configuration
const baseToastConfig: ToastOptions = {
  position: "top-right",
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  pauseOnFocusLoss: true,
};

// Toast configurations for different types
export const toastConfig = {
  // Success toast configuration
  success: {
    ...baseToastConfig,
    autoClose: 2000, // 2 seconds for success messages
    style: {
      backgroundColor: toastColors.success.background, // #16a34a
      color: toastColors.success.text,
    },
    progressStyle: {
      backgroundColor: toastColors.success.progress,
    },
  } as ToastOptions,

  // Error toast configuration
  error: {
    ...baseToastConfig,
    autoClose: 2000, // 2 seconds for error messages (longer for users to read)
    style: {
      backgroundColor: toastColors.error.background,
      color: toastColors.error.text,
    },
    progressStyle: {
      backgroundColor: toastColors.error.progress,
    },
  } as ToastOptions,

  // Warning toast configuration
  warning: {
    ...baseToastConfig,
    autoClose: 2000, // 2 seconds for warnings
    style: {
      backgroundColor: toastColors.warning.background,
      color: toastColors.warning.text,
    },
    progressStyle: {
      backgroundColor: toastColors.warning.progress,
    },
  } as ToastOptions,

  // Info toast configuration
  info: {
    ...baseToastConfig,
    autoClose: 2000, // 2 seconds for info messages
    style: {
      backgroundColor: toastColors.info.background,
      color: toastColors.info.text,
    },
    progressStyle: {
      backgroundColor: toastColors.info.progress,
    },
  } as ToastOptions,

  // Loading toast configuration (usually doesn't auto-close)
  loading: {
    ...baseToastConfig,
    autoClose: false, // Loading toasts should be manually dismissed
    closeOnClick: false,
    pauseOnHover: false,
  } as ToastOptions,

  // Quick notification (shorter duration)
  quick: {
    ...baseToastConfig,
    autoClose: 3000, // 3 seconds for quick notifications
  } as ToastOptions,

  // Persistent notification (requires manual close)
  persistent: {
    ...baseToastConfig,
    autoClose: false,
    closeOnClick: true,
  } as ToastOptions,
};

// Container configuration for ToastContainer component
export const toastContainerConfig = {
  position: "top-right" as const,
  autoClose: 5000,
  hideProgressBar: false,
  newestOnTop: false,
  closeOnClick: true,
  rtl: false,
  pauseOnFocusLoss: true,
  draggable: true,
  pauseOnHover: true,
  theme: "colored" as const,
};

// Helper functions for common toast patterns
export const showSuccessToast = (message: string, customConfig?: Partial<ToastOptions>) => {
  return {
    message: `🎉 ${message}`,
    config: { ...toastConfig.success, ...customConfig }
  };
};

export const showErrorToast = (message: string, customConfig?: Partial<ToastOptions>) => {
  return {
    message: `❌ ${message}`,
    config: { ...toastConfig.error, ...customConfig }
  };
};

export const showWarningToast = (message: string, customConfig?: Partial<ToastOptions>) => {
  return {
    message: `⚠️ ${message}`,
    config: { ...toastConfig.warning, ...customConfig }
  };
};

export const showInfoToast = (message: string, customConfig?: Partial<ToastOptions>) => {
  return {
    message: `ℹ️ ${message}`,
    config: { ...toastConfig.info, ...customConfig }
  };
};
