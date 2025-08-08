import React, { useState, useEffect } from "react";
import { reporteService } from "api/reporteService.js";
import { sedeService } from "api/sedeService.js";
import { useToast } from "hooks/useToast.js";

export default function DashboardReportes() {
  const [sedes, setSedes] = useState([]);
  const [selectedSede, setSelectedSede] = useState("");
  const [dateRange, setDateRange] = useState({
    fechaInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 16),
    fechaFin: new Date().toISOString().slice(0, 16)
  });
  const [reportData, setReportData] = useState({
    ventas: null,
    inventario: null,
    movimientos: null,
    productosMasVendidos: [],
    productosStockBajo: [],
    rendimientoUsuarios: []
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchSedes();
  }, []);

  useEffect(() => {
    if (selectedSede) {
      generateReports();
    }
  }, [selectedSede, dateRange]);

  const fetchSedes = async () => {
    try {
      const data = await sedeService.getAllSedes();
      setSedes(data);
      if (data.length > 0) {
        setSelectedSede(data[0].id.toString());
      }
    } catch (error) {
      console.error("Error fetching sedes:", error);
      showToast("Error al cargar las sedes", "error");
    }
  };

  const generateReports = async () => {
    if (!selectedSede) return;

    setLoading(true);
    try {
      const [
        ventasReport,
        inventarioReport,
        movimientosReport,
        productosMasVendidos,
        productosStockBajo,
        rendimientoUsuarios
      ] = await Promise.all([
        reporteService.generarReporteVentas(dateRange.fechaInicio, dateRange.fechaFin, selectedSede),
        reporteService.generarReporteInventario(selectedSede),
        reporteService.generarReporteMovimientos(dateRange.fechaInicio, dateRange.fechaFin, selectedSede),
        reporteService.obtenerProductosMasVendidos(dateRange.fechaInicio, dateRange.fechaFin, selectedSede, 5),
        reporteService.obtenerProductosConStockBajo(selectedSede),
        reporteService.generarReporteRendimientoUsuarios(dateRange.fechaInicio, dateRange.fechaFin, selectedSede)
      ]);

      setReportData({
        ventas: ventasReport,
        inventario: inventarioReport,
        movimientos: movimientosReport,
        productosMasVendidos,
        productosStockBajo,
        rendimientoUsuarios
      });
    } catch (error) {
      console.error("Error generating reports:", error);
      showToast("Error al generar los reportes", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <>
      <div className="flex flex-wrap">
        <div className="w-full px-4">
          <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
            <div className="rounded-t mb-0 px-4 py-3 border-0">
              <div className="flex flex-wrap items-center">
                <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                  <h3 className="font-semibold text-base text-blueGray-700">
                    Dashboard de Reportes
                  </h3>
                </div>
              </div>
              
              <div className="flex flex-wrap mt-4 gap-4">
                <div className="flex-1 min-w-0">
                  <label className="block text-blueGray-600 text-xs font-bold mb-2">
                    Sede
                  </label>
                  <select
                    value={selectedSede}
                    onChange={(e) => setSelectedSede(e.target.value)}
                    className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                  >
                    <option value="">Seleccionar sede</option>
                    {sedes.map((sede) => (
                      <option key={sede.id} value={sede.id}>
                        {sede.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-blueGray-600 text-xs font-bold mb-2">
                    Fecha Inicio
                  </label>
                  <input
                    type="datetime-local"
                    value={dateRange.fechaInicio}
                    onChange={(e) => handleDateChange('fechaInicio', e.target.value)}
                    className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-blueGray-600 text-xs font-bold mb-2">
                    Fecha Fin
                  </label>
                  <input
                    type="datetime-local"
                    value={dateRange.fechaFin}
                    onChange={(e) => handleDateChange('fechaFin', e.target.value)}
                    className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-wrap">
          <div className="w-full px-4">
            <div className="text-center py-8">
              <span className="text-blueGray-400">Generando reportes...</span>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Tarjetas de resumen */}
          <div className="flex flex-wrap">
            <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
              <div className="relative flex flex-col min-w-0 break-words bg-white rounded mb-6 xl:mb-0 shadow-lg">
                <div className="flex-auto p-4">
                  <div className="flex flex-wrap">
                    <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
                      <h5 className="text-blueGray-400 uppercase font-bold text-xs">
                        Total Ventas
                      </h5>
                      <span className="font-semibold text-xl text-blueGray-700">
                        {reportData.ventas ? formatCurrency(reportData.ventas.totalVentas) : 'N/A'}
                      </span>
                    </div>
                    <div className="relative w-auto pl-4 flex-initial">
                      <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-red-500">
                        <i className="fas fa-chart-bar"></i>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-blueGray-400 mt-4">
                    <span className="text-emerald-500 mr-2">
                      <i className="fas fa-arrow-up"></i> {reportData.ventas?.cantidadVentas || 0}
                    </span>
                    <span className="whitespace-nowrap">
                      ventas realizadas
                    </span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
              <div className="relative flex flex-col min-w-0 break-words bg-white rounded mb-6 xl:mb-0 shadow-lg">
                <div className="flex-auto p-4">
                  <div className="flex flex-wrap">
                    <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
                      <h5 className="text-blueGray-400 uppercase font-bold text-xs">
                        Promedio Venta
                      </h5>
                      <span className="font-semibold text-xl text-blueGray-700">
                        {reportData.ventas ? formatCurrency(reportData.ventas.promedioVenta) : 'N/A'}
                      </span>
                    </div>
                    <div className="relative w-auto pl-4 flex-initial">
                      <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-orange-500">
                        <i className="fas fa-chart-pie"></i>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-blueGray-400 mt-4">
                    <span className="whitespace-nowrap">
                      Por venta realizada
                    </span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
              <div className="relative flex flex-col min-w-0 break-words bg-white rounded mb-6 xl:mb-0 shadow-lg">
                <div className="flex-auto p-4">
                  <div className="flex flex-wrap">
                    <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
                      <h5 className="text-blueGray-400 uppercase font-bold text-xs">
                        Productos en Stock
                      </h5>
                      <span className="font-semibold text-xl text-blueGray-700">
                        {reportData.inventario?.totalProductos || 0}
                      </span>
                    </div>
                    <div className="relative w-auto pl-4 flex-initial">
                      <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-pink-500">
                        <i className="fas fa-users"></i>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-blueGray-400 mt-4">
                    <span className="text-red-500 mr-2">
                      <i className="fas fa-arrow-down"></i> {reportData.inventario?.productosStockBajo || 0}
                    </span>
                    <span className="whitespace-nowrap">
                      stock bajo
                    </span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
              <div className="relative flex flex-col min-w-0 break-words bg-white rounded mb-6 xl:mb-0 shadow-lg">
                <div className="flex-auto p-4">
                  <div className="flex flex-wrap">
                    <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
                      <h5 className="text-blueGray-400 uppercase font-bold text-xs">
                        Valor Inventario
                      </h5>
                      <span className="font-semibold text-xl text-blueGray-700">
                        {reportData.inventario ? formatCurrency(reportData.inventario.valorTotalInventario) : 'N/A'}
                      </span>
                    </div>
                    <div className="relative w-auto pl-4 flex-initial">
                      <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-lightBlue-500">
                        <i className="fas fa-percent"></i>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-blueGray-400 mt-4">
                    <span className="whitespace-nowrap">
                      Total en inventario
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tablas de datos */}
          <div className="flex flex-wrap mt-4">
            {/* Productos más vendidos */}
            <div className="w-full xl:w-6/12 px-4">
              <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
                <div className="rounded-t mb-0 px-4 py-3 border-0">
                  <div className="flex flex-wrap items-center">
                    <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                      <h3 className="font-semibold text-base text-blueGray-700">
                        Productos Más Vendidos
                      </h3>
                    </div>
                  </div>
                </div>
                <div className="block w-full overflow-x-auto">
                  <table className="items-center w-full bg-transparent border-collapse">
                    <thead>
                      <tr>
                        <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                          Producto
                        </th>
                        <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                          Cantidad
                        </th>
                        <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.productosMasVendidos.map((producto, index) => (
                        <tr key={index}>
                          <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                            <span className="font-bold">{producto.productoNombre}</span>
                          </th>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            {producto.cantidadVendida}
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            {formatCurrency(producto.totalVentas)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {reportData.productosMasVendidos.length === 0 && (
                    <div className="text-center py-4">
                      <span className="text-blueGray-400">No hay datos disponibles</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Productos con stock bajo */}
            <div className="w-full xl:w-6/12 px-4">
              <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
                <div className="rounded-t mb-0 px-4 py-3 border-0">
                  <div className="flex flex-wrap items-center">
                    <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                      <h3 className="font-semibold text-base text-blueGray-700">
                        Productos con Stock Bajo
                      </h3>
                    </div>
                  </div>
                </div>
                <div className="block w-full overflow-x-auto">
                  <table className="items-center w-full bg-transparent border-collapse">
                    <thead>
                      <tr>
                        <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                          Producto
                        </th>
                        <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                          Stock
                        </th>
                        <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                          Precio
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.productosStockBajo.map((producto, index) => (
                        <tr key={index}>
                          <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                            <span className="font-bold">{producto.productoNombre}</span>
                          </th>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            <span className="text-red-500 font-bold">{producto.cantidad}</span>
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            {formatCurrency(producto.precioVenta)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {reportData.productosStockBajo.length === 0 && (
                    <div className="text-center py-4">
                      <span className="text-blueGray-400">No hay productos con stock bajo</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}