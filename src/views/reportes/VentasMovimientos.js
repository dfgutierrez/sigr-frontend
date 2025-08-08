import React, { useState, useEffect } from "react";
import { reporteService } from "api/reporteService.js";
import { sedeService } from "api/sedeService.js";
import { useToast } from "hooks/useToast.js";

export default function VentasMovimientos() {
  const [sedes, setSedes] = useState([]);
  const [selectedSede, setSelectedSede] = useState("");
  const [dateRange, setDateRange] = useState({
    fechaInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 16),
    fechaFin: new Date().toISOString().slice(0, 16)
  });
  const [reporteVentas, setReporteVentas] = useState(null);
  const [reporteMovimientos, setReporteMovimientos] = useState(null);
  const [reporteComparativo, setReporteComparativo] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ventas');
  const { showToast } = useToast();

  useEffect(() => {
    fetchSedes();
  }, []);

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

  const generateReport = async () => {
    if (!selectedSede) {
      showToast("Por favor seleccione una sede", "warning");
      return;
    }

    setLoading(true);
    try {
      if (activeTab === 'ventas') {
        const data = await reporteService.generarReporteVentas(
          dateRange.fechaInicio,
          dateRange.fechaFin,
          selectedSede
        );
        setReporteVentas(data);
      } else if (activeTab === 'movimientos') {
        const data = await reporteService.generarReporteMovimientos(
          dateRange.fechaInicio,
          dateRange.fechaFin,
          selectedSede
        );
        setReporteMovimientos(data);
      } else if (activeTab === 'comparativo') {
        const data = await reporteService.generarReporteComparativoSedes(
          dateRange.fechaInicio,
          dateRange.fechaFin
        );
        setReporteComparativo(data);
      }
      showToast("Reporte generado exitosamente", "success");
    } catch (error) {
      console.error("Error generating report:", error);
      showToast("Error al generar el reporte", "error");
    } finally {
      setLoading(false);
    }
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
                    Reportes de Ventas y Movimientos
                  </h3>
                </div>
              </div>
              
              {/* Filtros */}
              <div className="flex flex-wrap mt-4 gap-4">
                <div className="flex-1 min-w-0">
                  <label className="block text-blueGray-600 text-xs font-bold mb-2">
                    Sede
                  </label>
                  <select
                    value={selectedSede}
                    onChange={(e) => setSelectedSede(e.target.value)}
                    className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                    disabled={activeTab === 'comparativo'}
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
                    onChange={(e) => setDateRange(prev => ({ ...prev, fechaInicio: e.target.value }))}
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
                    onChange={(e) => setDateRange(prev => ({ ...prev, fechaFin: e.target.value }))}
                    className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                  />
                </div>
                <div className="flex-shrink-0 flex items-end">
                  <button
                    onClick={generateReport}
                    disabled={loading}
                    className={`bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150 ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Generando...' : 'Generar'}
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap mt-4">
                <div className="w-full">
                  <ul className="flex mb-0 list-none flex-wrap pt-3 pb-4 flex-row">
                    <li className="-mb-px mr-2 last:mr-0 flex-auto text-center">
                      <a
                        className={`text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal ${
                          activeTab === 'ventas'
                            ? 'text-white bg-lightBlue-600'
                            : 'text-lightBlue-600 bg-white'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveTab('ventas');
                        }}
                        href="#"
                      >
                        Reporte de Ventas
                      </a>
                    </li>
                    <li className="-mb-px mr-2 last:mr-0 flex-auto text-center">
                      <a
                        className={`text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal ${
                          activeTab === 'movimientos'
                            ? 'text-white bg-lightBlue-600'
                            : 'text-lightBlue-600 bg-white'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveTab('movimientos');
                        }}
                        href="#"
                      >
                        Movimientos
                      </a>
                    </li>
                    <li className="-mb-px mr-2 last:mr-0 flex-auto text-center">
                      <a
                        className={`text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal ${
                          activeTab === 'comparativo'
                            ? 'text-white bg-lightBlue-600'
                            : 'text-lightBlue-600 bg-white'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveTab('comparativo');
                        }}
                        href="#"
                      >
                        Comparativo Sedes
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="block w-full overflow-x-auto">
              {/* Contenido del tab de Ventas */}
              {activeTab === 'ventas' && reporteVentas && (
                <div className="px-4 py-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
                      <h4 className="text-lg font-bold">Total Ventas</h4>
                      <p className="text-2xl font-bold">{formatCurrency(reporteVentas.totalVentas)}</p>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
                      <h4 className="text-lg font-bold">Cantidad de Ventas</h4>
                      <p className="text-2xl font-bold">{reporteVentas.cantidadVentas}</p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
                      <h4 className="text-lg font-bold">Promedio por Venta</h4>
                      <p className="text-2xl font-bold">{formatCurrency(reporteVentas.promedioVenta)}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-bold text-blueGray-700 mb-2">Información del Período</h5>
                    <p><strong>Sede:</strong> {reporteVentas.sedeNombre}</p>
                    <p><strong>Período:</strong> {formatDate(reporteVentas.fechaInicio)} - {formatDate(reporteVentas.fechaFin)}</p>
                    {reporteVentas.productoMasVendido && (
                      <p><strong>Producto más vendido:</strong> {reporteVentas.productoMasVendido.productoNombre} ({reporteVentas.productoMasVendido.cantidadVendida} unidades)</p>
                    )}
                  </div>
                </div>
              )}

              {/* Contenido del tab de Movimientos */}
              {activeTab === 'movimientos' && reporteMovimientos && (
                <div className="px-4 py-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-4 rounded-lg">
                      <h4 className="text-lg font-bold">Total Ingresos</h4>
                      <p className="text-xl font-bold">{reporteMovimientos.totalIngresos} movimientos</p>
                      <p className="text-lg">{formatCurrency(reporteMovimientos.valorTotalIngresos)}</p>
                    </div>
                    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg">
                      <h4 className="text-lg font-bold">Total Ventas</h4>
                      <p className="text-xl font-bold">{reporteMovimientos.totalVentas} ventas</p>
                      <p className="text-lg">{formatCurrency(reporteMovimientos.valorTotalVentas)}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-bold text-blueGray-700 mb-2">Información del Período</h5>
                    <p><strong>Sede:</strong> {reporteMovimientos.sedeNombre}</p>
                    <p><strong>Período:</strong> {formatDate(reporteMovimientos.fechaInicio)} - {formatDate(reporteMovimientos.fechaFin)}</p>
                    <p><strong>Margen de Beneficio:</strong> {formatCurrency(reporteMovimientos.margenBeneficio)}</p>
                  </div>
                </div>
              )}

              {/* Contenido del tab Comparativo */}
              {activeTab === 'comparativo' && reporteComparativo.length > 0 && (
                <table className="items-center w-full bg-transparent border-collapse">
                  <thead>
                    <tr>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Sede
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Total Ventas
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Cantidad
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Promedio
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reporteComparativo.map((sede, index) => (
                      <tr key={index}>
                        <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                          <span className="font-bold">{sede.sedeNombre}</span>
                        </th>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                          {formatCurrency(sede.totalVentas)}
                        </td>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                          {sede.cantidadVentas}
                        </td>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                          {formatCurrency(sede.promedioVenta)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Estados vacíos */}
              {activeTab === 'ventas' && !reporteVentas && !loading && (
                <div className="text-center py-8">
                  <span className="text-blueGray-400">Genere un reporte para ver los datos</span>
                </div>
              )}
              
              {activeTab === 'movimientos' && !reporteMovimientos && !loading && (
                <div className="text-center py-8">
                  <span className="text-blueGray-400">Genere un reporte para ver los datos</span>
                </div>
              )}
              
              {activeTab === 'comparativo' && reporteComparativo.length === 0 && !loading && (
                <div className="text-center py-8">
                  <span className="text-blueGray-400">Genere un reporte para ver los datos</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
