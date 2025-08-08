import React from 'react';

const Card = ({
  children,
  title,
  className = '',
  bodyClassName = '',
  headerClassName = '',
  ...props
}) => {
  return (
    <div 
      className={`relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded ${className}`}
      {...props}
    >
      {title && (
        <div className={`rounded-t mb-0 px-4 py-3 border-0 ${headerClassName}`}>
          <div className="flex flex-wrap items-center">
            <div className="relative w-full px-4 max-w-full flex-grow flex-1">
              <h3 className="font-semibold text-base text-blueGray-700">
                {title}
              </h3>
            </div>
          </div>
        </div>
      )}
      <div className={`flex-auto px-4 lg:px-10 py-10 pt-0 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;