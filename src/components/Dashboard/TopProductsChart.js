import React from "react";

export default function TopProductsChart({ 
  data = [], 
  title = "Top Productos",
  maxItems = 10 
}) {
  if (!data || data.length === 0) {
    return (
      <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded bg-white">
        <div className="rounded-t mb-0 px-4 py-3 bg-transparent">
          <h6 className="uppercase text-blueGray-400 mb-1 text-xs font-semibold">
            {title}
          </h6>
        </div>
        <div className="p-4 flex-auto">
          <div className="text-center text-blueGray-500 py-8">
            <i className="fas fa-chart-bar text-4xl mb-4"></i>
            <p>No hay datos disponibles</p>
          </div>
        </div>
      </div>
    );
  }

  // Ordenar y limitar datos
  const sortedData = [...data]
    .sort((a, b) => b.value - a.value)
    .slice(0, maxItems);

  // Encontrar el valor máximo para calcular porcentajes
  const maxValue = sortedData[0]?.value || 1;

  const colors = [
    "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
    "#06b6d4", "#84cc16", "#f97316", "#ec4899", "#6366f1"
  ];

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded bg-white">
      <div className="rounded-t mb-0 px-4 py-3 bg-transparent">
        <div className="flex flex-wrap items-center">
          <div className="relative w-full max-w-full flex-grow flex-1">
            <h6 className="uppercase text-blueGray-400 mb-1 text-xs font-semibold">
              {title}
            </h6>
            <h2 className="text-blueGray-700 text-xl font-semibold">
              {sortedData.length} productos
            </h2>
          </div>
        </div>
      </div>
      <div className="p-4 flex-auto">
        <div className="space-y-3">
          {sortedData.map((item, index) => {
            const percentage = (item.value / maxValue) * 100;
            const color = colors[index % colors.length];
            
            return (
              <div key={index} className="flex items-center">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-blueGray-700 truncate">
                      {item.name}
                    </span>
                    <span className="text-sm font-bold text-blueGray-900">
                      {item.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-blueGray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: color
                      }}
                    ></div>
                  </div>
                </div>
                <div className="ml-3 flex-shrink-0">
                  <span 
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold"
                    style={{ backgroundColor: color }}
                  >
                    {index + 1}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        {data.length > maxItems && (
          <div className="mt-4 pt-4 border-t border-blueGray-200">
            <p className="text-xs text-blueGray-500 text-center">
              Mostrando top {maxItems} de {data.length} productos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}