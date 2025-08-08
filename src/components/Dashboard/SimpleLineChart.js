import React from "react";

export default function SimpleLineChart({ 
  data = [], 
  title = "Gráfico", 
  height = 300,
  color = "#0ea5e9" 
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
            <i className="fas fa-chart-line text-4xl mb-4"></i>
            <p>No hay datos disponibles</p>
          </div>
        </div>
      </div>
    );
  }

  // Calcular dimensiones
  const width = 400;
  const padding = 40;
  const chartWidth = width - (padding * 2);
  const chartHeight = height - (padding * 2);

  // Encontrar valores min y max
  const values = data.map(d => d.value);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const valueRange = maxValue - minValue || 1;

  // Generar puntos para la línea
  const points = data.map((d, index) => {
    const x = padding + (index * chartWidth) / (data.length - 1);
    const y = padding + chartHeight - ((d.value - minValue) / valueRange) * chartHeight;
    return { x, y, ...d };
  }).filter(p => !isNaN(p.x) && !isNaN(p.y));

  // Crear path string para la línea
  const pathString = points.reduce((path, point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${path} ${command} ${point.x} ${point.y}`;
  }, '');

  // Crear área bajo la línea
  const areaString = points.length > 0 ? 
    `${pathString} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z` : '';

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded bg-white">
      <div className="rounded-t mb-0 px-4 py-3 bg-transparent">
        <div className="flex flex-wrap items-center">
          <div className="relative w-full max-w-full flex-grow flex-1">
            <h6 className="uppercase text-blueGray-400 mb-1 text-xs font-semibold">
              {title}
            </h6>
            <h2 className="text-blueGray-700 text-xl font-semibold">
              {data.length > 0 ? `${data[data.length - 1].value.toLocaleString()} (${data[data.length - 1].label})` : "Sin datos"}
            </h2>
          </div>
        </div>
      </div>
      <div className="p-4 flex-auto">
        <div className="relative" style={{ height: `${height}px` }}>
          <svg width="100%" height={height} className="absolute inset-0">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Área bajo la línea */}
            {areaString && (
              <path
                d={areaString}
                fill={color}
                fillOpacity="0.1"
              />
            )}
            
            {/* Línea principal */}
            {pathString && (
              <path
                d={pathString}
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            
            {/* Puntos en la línea */}
            {points.map((point, index) => (
              <g key={index}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill={color}
                  stroke="white"
                  strokeWidth="2"
                />
                {/* Tooltip hover area */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="10"
                  fill="transparent"
                  className="hover:fill-black hover:fill-opacity-10 cursor-pointer"
                >
                  <title>{`${point.label}: ${point.value.toLocaleString()}`}</title>
                </circle>
              </g>
            ))}
            
            {/* Etiquetas del eje X */}
            {points.map((point, index) => (
              index % Math.ceil(points.length / 6) === 0 && (
                <text
                  key={`label-${index}`}
                  x={point.x}
                  y={height - 10}
                  textAnchor="middle"
                  className="text-xs fill-blueGray-400"
                >
                  {point.label}
                </text>
              )
            ))}
            
            {/* Etiquetas del eje Y */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
              const value = minValue + (valueRange * ratio);
              const y = padding + chartHeight - (ratio * chartHeight);
              return (
                <text
                  key={`y-label-${index}`}
                  x={padding - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-xs fill-blueGray-400"
                >
                  {value.toLocaleString()}
                </text>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}