import { useCallback } from "react";

// Hook simplificado que usa console.log y alert para debugging
export const useToast = () => {
  const showToast = useCallback((message, type = "info", duration = 4000) => {
    // Log to console for debugging
    console.log(`🍞 Toast [${type.toUpperCase()}]:`, message);
    
    // Also show a simple alert for important messages
    if (type === "error") {
      console.error("❌ Error:", message);
      // Uncomment if you want alert popups: alert(`Error: ${message}`);
    } else if (type === "success") {
      console.log("✅ Success:", message);
    } else if (type === "warning") {
      console.warn("⚠️ Warning:", message);
    }
    
    return Date.now(); // Return an ID for compatibility
  }, []);

  const success = useCallback((message, duration) => {
    return showToast(message, "success", duration);
  }, [showToast]);

  const error = useCallback((message, duration) => {
    return showToast(message, "error", duration);
  }, [showToast]);

  const warning = useCallback((message, duration) => {
    return showToast(message, "warning", duration);
  }, [showToast]);

  const info = useCallback((message, duration) => {
    return showToast(message, "info", duration);
  }, [showToast]);

  return {
    showToast,
    success,
    error,
    warning,
    info,
    // For compatibility
    toasts: [],
    addToast: showToast,
    removeToast: () => {}
  };
};