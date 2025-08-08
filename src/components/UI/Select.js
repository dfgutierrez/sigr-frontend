import React from 'react';

const Select = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  options = [],
  placeholder = 'Seleccionar...',
  error,
  required = false,
  disabled = false,
  className = '',
  labelClassName = '',
  selectClassName = '',
  ...props
}) => {
  const baseSelectClasses = 'border-0 px-3 py-3 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150';
  const errorClasses = error ? 'border-red-500 focus:ring-red-500' : '';
  const disabledClasses = disabled ? 'bg-blueGray-100 cursor-not-allowed' : '';

  const finalSelectClassName = `
    ${baseSelectClasses}
    ${errorClasses}
    ${disabledClasses}
    ${selectClassName}
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
      
      <select
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        className={finalSelectClassName}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => {
          const optionValue = typeof option === 'object' ? option.value : option;
          const optionLabel = typeof option === 'object' ? option.label : option;
          const optionKey = typeof option === 'object' ? option.key || option.value : option;
          
          return (
            <option key={optionKey} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
      
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center">
          <i className="fas fa-exclamation-triangle mr-1"></i>
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;