import { toast } from "react-toastify";
import {
  DEFAULT_TOAST_CONFIG,
  TOAST_MESSAGES,
} from "./toast.constants";

// Toast utility functions
export const showToast = {
  success: (message, customConfig = {}) =>
    toast.success(message, { ...DEFAULT_TOAST_CONFIG, ...customConfig }),

  error: (message, customConfig = {}) =>
    toast.error(message, {
      ...DEFAULT_TOAST_CONFIG,
      autoClose: 3000, // Error toast hiển thị lâu hơn
      ...customConfig,
    }),

  info: (message, customConfig = {}) =>
    toast.info(message, { ...DEFAULT_TOAST_CONFIG, ...customConfig }),

  warning: (message, customConfig = {}) =>
    toast.warning(message, { ...DEFAULT_TOAST_CONFIG, ...customConfig }),

  // Custom toast với icon
  successWithIcon: (message, icon = "✓") =>
    toast.success(`${icon} ${message}`, DEFAULT_TOAST_CONFIG),

  errorWithIcon: (message, icon = "✗") =>
    toast.error(`${icon} ${message}`, {
      ...DEFAULT_TOAST_CONFIG,
      autoClose: 3000,
    }),

  // Toast cho các action cụ thể
  loading: (message) =>
    toast.loading(message, {
      ...DEFAULT_TOAST_CONFIG,
      autoClose: false, // Loading toast không tự đóng
    }),

  // Update loading toast
  updateLoading: (toastId, message, type = "success") => {
    const config = {
      ...DEFAULT_TOAST_CONFIG,
      autoClose: type === "error" ? 3000 : 2500,
    };

    if (type === "success") {
      toast.update(toastId, {
        render: message,
        type: "success",
        isLoading: false,
        ...config,
      });
    } else if (type === "error") {
      toast.update(toastId, {
        render: message,
        type: "error",
        isLoading: false,
        ...config,
      });
    }
  },

  // Dismiss all toasts
  dismissAll: () => toast.dismiss(),

  // Dismiss specific toast
  dismiss: (toastId) => toast.dismiss(toastId),
};

// Export default config for manual usage
export const defaultToastConfig = DEFAULT_TOAST_CONFIG;

// Preset messages for common actions
export const toastMessages = TOAST_MESSAGES;

export default showToast;
