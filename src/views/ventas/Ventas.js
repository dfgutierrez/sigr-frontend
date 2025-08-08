import React, { useState, useEffect } from "react";
import { ventaService } from "api/ventaService.js";
import { sedeService } from "api/sedeService.js";
import VentaForm from "components/Forms/VentaForm.js";
import ConfirmationModal from "components/Modals/ConfirmationModal.js";
import { useToast } from "hooks/useToast.js";

export default function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [ventaToCancel, setVentaToCancel] = useState(null);
  const [expandedVenta, setExpandedVenta] = useState(null);
  const [filters, setFilters] = useState({
    sedeId: "",
    fechaInicio: "",
    fechaFin: ""
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);
  const { showToast } = useToast();

  useEffect(() => {
    fetchVentas();
    fetchSedes();
  }, [currentPage, filters]);

  const fetchVentas = async () => {
    try {
      setLoading(true);
      
      let response;
      
      if (filters.sedeId && filters.fechaInicio && filters.fechaFin) {
        // Filter by sede and date range
        response = await ventaService.obtenerVentasPorSede(filters.sedeId, currentPage, pageSize);
      } else if (filters.fechaInicio && filters.fechaFin) {
        // Filter by date range
        response = await ventaService.obtenerVentasPorFecha(
          filters.fechaInicio,
          filters.fechaFin,
          currentPage,
          pageSize
        );
      } else if (filters.sedeId) {
        // Filter by sede only
        response = await ventaService.obtenerVentasPorSede(filters.sedeId, currentPage, pageSize);
      } else {
        // Get all sales
        response = await ventaService.obtenerTodasLasVentas(currentPage, pageSize);
      }
      
      console.log('🔍 Response from API:', response);
      
      // Manejar la estructura de respuesta anidada: response.data.content
      let ventasData, totalPagesData;
      
      if (response?.data?.content) {
        // Estructura: { success: true, data: { content: [...], totalPages: N } }
        ventasData = response.data.content;
        totalPagesData = response.data.totalPages;
      } else if (response?.content) {
        // Estructura directa: { content: [...], totalPages: N }
        ventasData = response.content;
        totalPagesData = response.totalPages;
      } else if (Array.isArray(response?.data)) {
        // Estructura: { data: [...] }
        ventasData = response.data;
        totalPagesData = 1;
      } else if (Array.isArray(response)) {
        // Array directo
        ventasData = response;
        totalPagesData = 1;
      } else {
        ventasData = [];
        totalPagesData = 1;
      }
      
      console.log('✅ Processed ventas data:', ventasData);
      console.log('📄 Total pages:', totalPagesData);
      
      setVentas(Array.isArray(ventasData) ? ventasData : []);
      setTotalPages(totalPagesData || 1);
    } catch (error) {
      console.error("Error fetching ventas:", error);
      setVentas([]); // Asegurar que ventas sea un array vacío en caso de error
      setTotalPages(1);
      showToast("Error al cargar las ventas", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchSedes = async () => {
    try {
      const data = await sedeService.getAllSedes();
      setSedes(data);
    } catch (error) {
      console.error("Error fetching sedes:", error);
    }
  };

  const handleCreate = () => {
    setShowForm(true);
  };

  const handleCancel = (venta) => {
    setVentaToCancel(venta);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    try {
      await ventaService.anularVenta(ventaToCancel.id);
      showToast("Venta anulada exitosamente", "success");
      setShowCancelModal(false);
      setVentaToCancel(null);
      fetchVentas();
    } catch (error) {
      console.error("Error cancelling sale:", error);
      showToast(
        error.response?.data?.message || "Error al anular la venta",
        "error"
      );
    }
  };

  const handleFormSave = () => {
    setShowForm(false);
    fetchVentas();
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(0);
  };

  const clearFilters = () => {
    setFilters({
      sedeId: "",
      fechaInicio: "",
      fechaFin: ""
    });
    setCurrentPage(0);
  };

  const toggleExpandVenta = (ventaId) => {
    setExpandedVenta(expandedVenta === ventaId ? null : ventaId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES") + " " + date.toLocaleTimeString("es-ES", { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  };

  const getEstadoColor = (estado) => {
    return estado 
      ? "text-green-800 bg-green-200" 
      : "text-red-800 bg-red-200";
  };

  const getEstadoText = (estado) => {
    return estado ? "Activa" : "Anulada";
  };

  if (showForm) {
    return (
      <div className="flex flex-wrap">
        <div className="w-full px-4">
          <VentaForm
            onSave={handleFormSave}
            onCancel={handleFormCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap">
        <div className="w-full px-4">
          <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
            <div className="rounded-t mb-0 px-4 py-3 border-0">
              <div className="flex flex-wrap items-center">
                <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                  <h3 className="font-semibold text-base text-blueGray-700">
                    Gestión de Ventas
                  </h3>
                </div>
                <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
                  <button
                    className="bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={handleCreate}
                  >
                    Nueva Venta
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap mt-4 gap-4">
                <div className="flex-1 min-w-0">
                  <select
                    name="sedeId"
                    value={filters.sedeId}
                    onChange={handleFilterChange}
                    className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                  >
                    <option value="">Todas las sedes</option>
                    {sedes.map((sede) => (
                      <option key={sede.id} value={sede.id}>
                        {sede.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="datetime-local"
                    name="fechaInicio"
                    value={filters.fechaInicio}
                    onChange={handleFilterChange}
                    className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                    placeholder="Fecha inicio"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="datetime-local"
                    name="fechaFin"
                    value={filters.fechaFin}
                    onChange={handleFilterChange}
                    className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                    placeholder="Fecha fin"
                  />
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={clearFilters}
                    className="bg-gray-500 text-white active:bg-gray-600 text-xs font-bold uppercase px-3 py-2 rounded outline-none focus:outline-none ease-linear transition-all duration-150"
                  >
                    Limpiar
                  </button>
                </div>
              </div>
            </div>

            <div className="block w-full overflow-x-auto">
              {loading ? (
                <div className="text-center py-4">
                  <span className="text-blueGray-400">Cargando ventas...</span>
                </div>
              ) : (
                <table className="items-center w-full bg-transparent border-collapse">
                  <thead>
                    <tr>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        ID
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Fecha
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Usuario
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Sede
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Total
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Estado
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(ventas) && ventas.map((venta) => (
                      <React.Fragment key={venta.id}>
                        <tr>
                          <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left text-blueGray-700">
                            <span className="font-bold">#{venta.id}</span>
                          </th>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            {formatDate(venta.fecha)}
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            {venta.usuarioNombre || venta.usuario?.nombreCompleto || "N/A"}
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            {venta.sedeNombre || venta.sede?.nombre || "N/A"}
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            <span className="font-bold">{formatCurrency(venta.total)}</span>
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full ${getEstadoColor(venta.estado)}`}>
                              {getEstadoText(venta.estado)}
                            </span>
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            <button
                              onClick={() => toggleExpandVenta(venta.id)}
                              className="text-blue-500 hover:text-blue-700 mr-2"
                              title="Ver detalles"
                            >
                              <i className={`fas ${expandedVenta === venta.id ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                            </button>
                            {venta.estado && (
                              <button
                                onClick={() => handleCancel(venta)}
                                className="text-red-500 hover:text-red-700"
                                title="Anular venta"
                              >
                                <i className="fas fa-ban"></i>
                              </button>
                            )}
                          </td>
                        </tr>
                        
                        {/* Expanded details */}
                        {expandedVenta === venta.id && venta.detalles && (
                          <tr>
                            <td colSpan="7" className="border-t-0 px-6 py-4 bg-blueGray-50">
                              <div className="text-sm">
                                <div className="flex justify-between items-start mb-4">
                                  <h4 className="font-bold text-blueGray-700">Detalles de la Venta</h4>
                                  {venta.vehiculo && (
                                    <div className="bg-white px-3 py-2 rounded shadow-sm">
                                      <div className="text-xs text-blueGray-500 uppercase font-bold">Vehículo Asociado</div>
                                      <div className="font-bold text-blueGray-700">{venta.vehiculo.placa}</div>
                                      <div className="text-xs text-blueGray-500">
                                        {venta.vehiculo.tipo} - {venta.vehiculo.nombreConductor || 'Sin conductor'}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <table className="w-full bg-white rounded shadow-sm">
                                  <thead>
                                    <tr className="bg-blueGray-100">
                                      <th className="px-4 py-2 text-left text-xs font-bold text-blueGray-600">Producto</th>
                                      <th className="px-4 py-2 text-left text-xs font-bold text-blueGray-600">Cantidad</th>
                                      <th className="px-4 py-2 text-left text-xs font-bold text-blueGray-600">Precio Unitario</th>
                                      <th className="px-4 py-2 text-left text-xs font-bold text-blueGray-600">Subtotal</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {venta.detalles.map((detalle, index) => (
                                      <tr key={index} className="border-b border-blueGray-100">
                                        <td className="px-4 py-2 text-xs">
                                          <div>
                                            <div className="font-bold">{detalle.producto?.nombre || "Producto N/A"}</div>
                                            <div className="text-blueGray-500">{detalle.producto?.codigoBarra || ""}</div>
                                          </div>
                                        </td>
                                        <td className="px-4 py-2 text-xs">{detalle.cantidad}</td>
                                        <td className="px-4 py-2 text-xs">{formatCurrency(detalle.precioUnitario)}</td>
                                        <td className="px-4 py-2 text-xs font-bold">{formatCurrency(detalle.subtotal)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              )}
              
              {Array.isArray(ventas) && ventas.length === 0 && !loading && (
                <div className="text-center py-4">
                  <span className="text-blueGray-400">No hay ventas registradas</span>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Página <span className="font-medium">{currentPage + 1}</span> de{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                        disabled={currentPage === 0}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <i className="fas fa-chevron-left"></i>
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                        disabled={currentPage >= totalPages - 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={confirmCancel}
        title="Anular Venta"
        message={`¿Está seguro que desea anular la venta #${ventaToCancel?.id}? Esta acción devolverá el stock al inventario.`}
        confirmText="Anular"
        cancelText="Cancelar"
        confirmButtonClass="bg-red-500 hover:bg-red-700"
      />
    </>
  );
}