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
  onClose,
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
    <SimpleModal isOpen={isOpen} onClose={() => !loading && (onClose || onCancel)()}>
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

        <div className="px-6 py-4 bg-blueGray-50 rounded-b-lg">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            alignItems: 'center', 
            gap: '12px',
            width: '100%',
            minHeight: '50px'
          }}>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              style={{
                backgroundColor: '#ffffff',
                color: '#374151',
                border: '1px solid #d1d5db',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                minWidth: '100px',
                height: '40px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#f9fafb';
                  e.target.style.borderColor = '#9ca3af';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.borderColor = '#d1d5db';
                }
              }}
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              style={{
                backgroundColor: type === 'info' ? '#2563eb' : type === 'danger' ? '#dc2626' : '#d97706',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                minWidth: '140px',
                height: '40px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? '0.5' : '1',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  const hoverColors = {
                    info: '#1d4ed8',
                    danger: '#b91c1c', 
                    warning: '#c2410c'
                  };
                  e.target.style.backgroundColor = hoverColors[type] || hoverColors.warning;
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  const originalColors = {
                    info: '#2563eb',
                    danger: '#dc2626',
                    warning: '#d97706'
                  };
                  e.target.style.backgroundColor = originalColors[type] || originalColors.warning;
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
                }
              }}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                  Procesando...
                </>
              ) : (
                confirmText || 'Confirmar'
              )}
            </button>
          </div>
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
  onCancel: PropTypes.func,
  onClose: PropTypes.func,
  loading: PropTypes.bool,
  type: PropTypes.oneOf(["danger", "warning", "info"])
};