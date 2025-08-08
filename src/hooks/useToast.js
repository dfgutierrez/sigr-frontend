import { useState, useCallback } from "react";

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      message,
      type,
      duration,
      isVisible: true
    };

    setToasts(prev => [...prev, newToast]);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((message, duration) => {
    return addToast(message, "success", duration);
  }, [addToast]);

  const error = useCallback((message, duration) => {
    return addToast(message, "error", duration);
  }, [addToast]);

  const warning = useCallback((message, duration) => {
    return addToast(message, "warning", duration);
  }, [addToast]);

  const info = useCallback((message, duration) => {
    return addToast(message, "info", duration);
  }, [addToast]);

  // Alias para compatibilidad con componentes existentes
  const showToast = useCallback((message, type = "info", duration = 4000) => {
    return addToast(message, type, duration);
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    showToast
  };
};