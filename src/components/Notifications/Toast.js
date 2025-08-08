import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

export default function Toast({ 
  message, 
  type = "info", 
  duration = 4000, 
  onClose, 
  isVisible = true 
}) {
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(() => onClose && onClose(), 300); // Wait for animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          bgColor: "bg-green-500",
          icon: "fas fa-check-circle",
          textColor: "text-white"
        };
      case "error":
        return {
          bgColor: "bg-red-500",
          icon: "fas fa-exclamation-circle",
          textColor: "text-white"
        };
      case "warning":
        return {
          bgColor: "bg-yellow-500",
          icon: "fas fa-exclamation-triangle",
          textColor: "text-white"
        };
      case "info":
      default:
        return {
          bgColor: "bg-blue-500",
          icon: "fas fa-info-circle",
          textColor: "text-white"
        };
    }
  };

  const styles = getTypeStyles();

  if (!show) return null;

  return (
    <div className={`fixed top-4 right-4 transform transition-all duration-300 ${
      show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`} style={{zIndex: 10000}}>
      <div className={`${styles.bgColor} ${styles.textColor} px-4 py-3 rounded-lg shadow-lg flex items-center max-w-sm`}>
        <i className={`${styles.icon} mr-3 text-lg`}></i>
        <span className="flex-1 text-sm font-medium">{message}</span>
        <button
          onClick={() => {
            setShow(false);
            setTimeout(() => onClose && onClose(), 300);
          }}
          className={`ml-3 ${styles.textColor} hover:opacity-75 transition-opacity`}
        >
          <i className="fas fa-times text-sm"></i>
        </button>
      </div>
    </div>
  );
}

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(["success", "error", "warning", "info"]),
  duration: PropTypes.number,
  onClose: PropTypes.func,
  isVisible: PropTypes.bool
};