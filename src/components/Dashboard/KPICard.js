import React from "react";

export default function KPICard({ 
  title, 
  value, 
  previousValue, 
  icon, 
  color = "lightBlue", 
  prefix = "", 
  suffix = "" 
}) {
  // Calcular porcentaje de cambio
  const calculateChange = () => {
    if (!previousValue || previousValue === 0) return 0;
    return ((value - previousValue) / previousValue * 100).toFixed(1);
  };

  const change = calculateChange();
  const isPositive = change >= 0;

  const colorClasses = {
    lightBlue: {
      bg: "bg-lightBlue-500",
      icon: "text-lightBlue-500",
      border: "border-lightBlue-200"
    },
    emerald: {
      bg: "bg-emerald-500", 
      icon: "text-emerald-500",
      border: "border-emerald-200"
    },
    orange: {
      bg: "bg-orange-500",
      icon: "text-orange-500", 
      border: "border-orange-200"
    },
    purple: {
      bg: "bg-purple-500",
      icon: "text-purple-500",
      border: "border-purple-200"
    }
  };

  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white rounded mb-6 xl:mb-0 shadow-lg">
      <div className="flex-auto p-4">
        <div className="flex flex-wrap">
          <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
            <h5 className="text-blueGray-400 uppercase font-bold text-xs">
              {title}
            </h5>
            <span className="font-semibold text-xl text-blueGray-700">
              {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
            </span>
          </div>
          <div className="relative w-auto pl-4 flex-initial">
            <div className={`text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full ${colorClasses[color].bg}`}>
              <i className={icon}></i>
            </div>
          </div>
        </div>
        {previousValue && (
          <p className="text-sm text-blueGray-400 mt-4">
            <span className={`mr-2 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
              <i className={`fas ${isPositive ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i> {Math.abs(change)}%
            </span>
            <span className="whitespace-nowrap">vs mes anterior</span>
          </p>
        )}
      </div>
    </div>
  );
}