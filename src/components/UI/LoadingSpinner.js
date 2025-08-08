import React from 'react';

const LoadingSpinner = ({
  size = 'medium',
  color = 'blueGray',
  text = 'Cargando...',
  showText = true,
  className = ''
}) => {
  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  const colorClasses = {
    blueGray: 'text-blueGray-400',
    lightBlue: 'text-lightBlue-500',
    blue: 'text-blue-500',
    green: 'text-green-500',
    red: 'text-red-500',
    orange: 'text-orange-500'
  };

  const finalClassName = `
    ${sizeClasses[size]}
    ${colorClasses[color]}
    ${className}
  `.trim();

  return (
    <div className={`flex flex-col items-center justify-center py-4 ${className}`}>
      <i className={`fas fa-spinner fa-spin ${finalClassName} mb-2`}></i>
      {showText && (
        <p className={`text-xs ${colorClasses[color]} mt-2`}>{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;