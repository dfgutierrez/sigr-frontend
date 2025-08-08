import React from "react";
import PropTypes from "prop-types";
import SimpleModal from "components/Modals/SimpleModal.js";

export default function ConfirmationModal({ 
  isOpen, 
  title, 
  message, 
  confirmText = "Confirmar", 
  cancelText = "Cancelar", 
  onConfirm, 
  onCancel, 
  loading = false,
  type = "danger" // danger, warning, info
}) {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          icon: "fas fa-exclamation-triangle",
          iconColor: "text-red-500",
          iconBg: "bg-red-100",
          confirmButton: "bg-red-600 hover:bg-red-700 focus:ring-red-500"
        };
      case "warning":
        return {
          icon: "fas fa-exclamation-circle",
          iconColor: "text-yellow-500",
          iconBg: "bg-yellow-100",
          confirmButton: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500"
        };
      case "info":
        return {
          icon: "fas fa-info-circle",
          iconColor: "text-blue-500",
          iconBg: "bg-blue-100",
          confirmButton: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
        };
      default:
        return {
          icon: "fas fa-question-circle",
          iconColor: "text-gray-500",
          iconBg: "bg-gray-100",
          confirmButton: "bg-gray-600 hover:bg-gray-700 focus:ring-gray-500"
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <SimpleModal isOpen={isOpen} onClose={() => !loading && onCancel()}>
      <div className="max-w-md w-full">
        <div className="px-6 py-4">
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${styles.iconBg} rounded-full p-3 mr-4`}>
              <i className={`${styles.icon} ${styles.iconColor} text-xl`}></i>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-blueGray-900">
                {title}
              </h3>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4">
          <p className="text-sm text-blueGray-600">
            {message}
          </p>
        </div>

        <div className="px-6 py-4 bg-blueGray-50 rounded-b-lg flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="bg-white text-blueGray-700 border border-blueGray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-blueGray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`${styles.confirmButton} text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Procesando...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </SimpleModal>
  );
}

ConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  type: PropTypes.oneOf(["danger", "warning", "info"])
};