import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon = null,
  className = '',
  ...props
}) => {
  const baseClasses = 'font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150';
  
  const variantClasses = {
    primary: 'bg-lightBlue-500 text-white active:bg-lightBlue-600',
    secondary: 'bg-blueGray-500 text-white active:bg-blueGray-600',
    success: 'bg-green-500 text-white active:bg-green-600',
    danger: 'bg-red-500 text-white active:bg-red-600',
    warning: 'bg-orange-500 text-white active:bg-orange-600',
    info: 'bg-blue-500 text-white active:bg-blue-600',
    outline: 'bg-transparent border border-lightBlue-500 text-lightBlue-500 hover:bg-lightBlue-50'
  };

  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-4 py-2 text-xs',
    large: 'px-6 py-3 text-sm'
  };

  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed' : '';

  const finalClassName = `
    ${baseClasses}
    ${variantClasses[variant] || variantClasses.primary}
    ${sizeClasses[size]}
    ${disabledClasses}
    ${className}
  `.trim();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={finalClassName}
      {...props}
    >
      {loading && (
        <i className="fas fa-spinner fa-spin mr-2"></i>
      )}
      {icon && !loading && (
        <i className={`${icon} mr-2`}></i>
      )}
      {children}
    </button>
  );
};

export default Button;