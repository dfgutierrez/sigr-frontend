import React from 'react';

const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
  labelClassName = '',
  inputClassName = '',
  icon = null,
  ...props
}) => {
  const baseInputClasses = 'border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150';
  const errorClasses = error ? 'border-red-500 focus:ring-red-500' : '';
  const disabledClasses = disabled ? 'bg-blueGray-100 cursor-not-allowed' : '';

  const finalInputClassName = `
    ${baseInputClasses}
    ${errorClasses}
    ${disabledClasses}
    ${inputClassName}
  `.trim();

  const finalLabelClassName = `
    block uppercase text-blueGray-600 text-xs font-bold mb-2
    ${labelClassName}
  `.trim();

  return (
    <div className={`relative w-full mb-3 ${className}`}>
      {label && (
        <label htmlFor={name} className={finalLabelClassName}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className={`${icon} text-blueGray-400`}></i>
          </div>
        )}
        
        <input
          id={name}
          name={name}
          type={type}
          value={value || ''}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`${finalInputClassName} ${icon ? 'pl-10' : ''}`}
          {...props}
        />
      </div>
      
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center">
          <i className="fas fa-exclamation-triangle mr-1"></i>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;