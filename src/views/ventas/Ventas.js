import React, { useState, useEffect } from "react";
import { ventaService } from "api/ventaService.js";
import { sedeService } from "api/sedeService.js";
import VentaForm from "components/Forms/VentaForm.js";
import ConfirmationModal from "components/Modals/ConfirmationModal.js";
import { useToast } from "hooks/useToast.js";
import { useAuth } from "contexts/AuthContext.js";

export default function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [ventaToCancel, setVentaToCancel] = useState(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [ventaToDeliver, setVentaToDeliver] = useState(null);
  const [expandedVenta, setExpandedVenta] = useState(null);
  // Función para obtener el primer día del mes actual
  const getPrimerDiaDelMes = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01T00:00:00`;
  };

  // Función para obtener el último día del mes actual
  const getUltimoDiaDelMes = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const lastDay = new Date(year, month, 0).getDate();
    const monthStr = String(month).padStart(2, '0');
    const dayStr = String(lastDay).padStart(2, '0');
    return `${year}-${monthStr}-${dayStr}T23:59:59`;
  };

  const [filters, setFilters] = useState(() => {
    const fechaInicio = getPrimerDiaDelMes();
    const fechaFin = getUltimoDiaDelMes();
    
    console.log('🎯 INICIALIZACIÓN: Filtros por defecto:', {
      fechaInicio,
      fechaFin
    });
    
    return {
      fechaInicio,
      fechaFin
    };
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);
  const { showToast } = useToast();
  const { user } = useAuth();

  const fetchVentas = async () => {
    console.log('🚀 FETCH VENTAS EJECUTÁNDOSE...');
    console.log('🚀 Filtros actuales:', filters);
    
    try {
      setLoading(true);
      
      // Obtener el sedeId del usuario autenticado con debugging extensivo
      console.log('👤 DEBUGGING USER OBJECT:');
      console.log('👤 Usuario completo:', JSON.stringify(user, null, 2));
      console.log('👤 Propiedades del user:', Object.keys(user || {}));
      
      const userSedeId = getUserSedeId(user);
      console.log('🏢 SedeId final encontrado:', userSedeId);
      
      if (!userSedeId) {
        console.warn("No se encontró sedeId para el usuario autenticado");
        showToast("Error: No se puede determinar la sede del usuario", "error");
        setLoading(false);
        return;
      }
      
      // IMPORTANTE: Usar SIEMPRE la sede del usuario logueado
      const sedeIdToUse = userSedeId;
      
      // Preparar fechas en formato ISO si están presentes
      let fechaDesde = null;
      let fechaHasta = null;
      
      if (filters.fechaInicio) {
        fechaDesde = filters.fechaInicio;
      }
      
      if (filters.fechaFin) {
        fechaHasta = filters.fechaFin;
      }
      
      console.log('🔍 Consultando ventas con:', {
        sedeId: sedeIdToUse,
        fechaDesde,
        fechaHasta,
        page: currentPage,
        size: pageSize
      });
      
      console.log('🌐 URL que se va a consumir:', 
        `/api/v1/ventas/sede/${sedeIdToUse}?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}&page=${currentPage}&size=${pageSize}`
      );
      
      console.log('⚡ ANTES DE LLAMAR AL SERVICIO - ventaService.obtenerTodasLasVentas...');
      
      // Usar el endpoint unificado de sede con filtros opcionales
      const response = await ventaService.obtenerTodasLasVentas(
        currentPage, 
        pageSize, 
        sedeIdToUse, 
        fechaDesde, 
        fechaHasta
      );
      
      console.log('✅ DESPUÉS DE LLAMAR AL SERVICIO - Response from API:', response);
      
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

  // useEffect para ejecutar al montar el componente (cuando se accede a HISTORIAL DE VENTAS)
  useEffect(() => {
    console.log('🏠 COMPONENTE MONTADO - Inicializando Historial de Ventas...');
    console.log('🏠 Estado inicial del usuario:', user);
    
    // Si ya tenemos usuario, ejecutar inmediatamente
    if (user) {
      console.log('🏠 Usuario disponible al montar, ejecutando fetchVentas...');
      fetchVentas();
      fetchSedes();
    }
  }, []); // Solo se ejecuta al montar

  useEffect(() => {
    console.log('🎯 useEffect EJECUTÁNDOSE - Condiciones:', { 
      hasUser: !!user, 
      currentPage, 
      filters,
      userSedeId: user?.sedeId || user?.sede?.id
    });
    
    if (user) {
      console.log('✅ Usuario encontrado, ejecutando fetchVentas y fetchSedes...');
      fetchVentas();
      fetchSedes();
    } else {
      console.log('❌ No hay usuario, saltando fetchVentas...');
    }
  }, [currentPage, filters, user]);

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

  const handleDeliver = (venta) => {
    setVentaToDeliver(venta);
    setShowDeliveryModal(true);
  };

  const confirmDelivery = async () => {
    try {
      await ventaService.marcarVentaComoEntregada(ventaToDeliver.id);
      showToast("Venta marcada como entregada exitosamente", "success");
      setShowDeliveryModal(false);
      setVentaToDeliver(null);
      fetchVentas();
    } catch (error) {
      console.error("Error marking sale as delivered:", error);
      showToast(
        error.response?.data?.message || "Error al marcar la venta como entregada",
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
      fechaInicio: getPrimerDiaDelMes(),
      fechaFin: getUltimoDiaDelMes()
    });
    setCurrentPage(0);
  };

  const setFiltroRapido = (tipo) => {
    const now = new Date();
    let fechaInicio, fechaFin;

    switch (tipo) {
      case 'hoy':
        const today = now.toISOString().split('T')[0];
        fechaInicio = `${today}T00:00:00`;
        fechaFin = `${today}T23:59:59`;
        break;
      case 'semana':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        fechaInicio = startOfWeek.toISOString().split('T')[0] + 'T00:00:00';
        fechaFin = endOfWeek.toISOString().split('T')[0] + 'T23:59:59';
        break;
      case 'mes':
        fechaInicio = getPrimerDiaDelMes();
        fechaFin = getUltimoDiaDelMes();
        break;
      default:
        return;
    }

    setFilters(prev => ({
      ...prev,
      fechaInicio,
      fechaFin
    }));
    setCurrentPage(0);
  };

  // Función para obtener sedeId del usuario con múltiples intentos
  const getUserSedeId = (user) => {
    if (!user) return null;
    
    // Estructura específica de la respuesta de login: user.sedes[0].id
    if (user.sedes && Array.isArray(user.sedes) && user.sedes.length > 0) {
      return user.sedes[0].id;
    }
    
    // Otras posibles ubicaciones del sedeId
    let sedeId = user?.sedeId || user?.sede?.id || user?.sedeID || user?.Sede?.id;
    
    // Si aún no se encuentra, buscar en todas las propiedades
    if (!sedeId) {
      for (const key in user) {
        if (key.toLowerCase().includes('sede') && user[key]) {
          const sedeValue = user[key];
          // Si es un objeto, intentar extraer el id
          if (typeof sedeValue === 'object' && sedeValue?.id) {
            sedeId = sedeValue.id;
          } else if (typeof sedeValue === 'number' || typeof sedeValue === 'string') {
            sedeId = sedeValue;
          }
          break;
        }
      }
    }
    
    // Asegurar que siempre devuelve un número o string, nunca un objeto
    return sedeId;
  };

  // Función de prueba para verificar el endpoint
  const testearEndpoint = async () => {
    console.log('🧪 PRUEBA MANUAL DEL ENDPOINT');
    const userSedeId = getUserSedeId(user);
    
    console.log('🧪 Usuario completo:', user);
    console.log('🧪 SedeId del usuario logueado:', userSedeId);
    console.log('🧪 Filtros actuales:', filters);
    
    if (userSedeId) {
      try {
        console.log('🧪 EJECUTANDO SERVICIO CON SEDE DEL USUARIO LOGUEADO...');
        console.log(`🧪 URL que se consumirá: /api/v1/ventas/sede/${userSedeId}?fechaDesde=${filters.fechaInicio}&fechaHasta=${filters.fechaFin}&page=0&size=10`);
        
        const result = await ventaService.obtenerTodasLasVentas(
          0, 
          10, 
          userSedeId,  // SIEMPRE usar la sede del usuario logueado
          filters.fechaInicio, 
          filters.fechaFin
        );
        console.log('🧪 RESULTADO DE PRUEBA:', result);
        showToast(`Prueba completada - Sede ${userSedeId} - revisar consola`, 'success');
      } catch (error) {
        console.error('🧪 ERROR DE PRUEBA:', error);
        showToast('Error en prueba - revisar consola', 'error');
      }
    } else {
      console.error('🧪 NO SE ENCONTRÓ SEDE ID EN EL USUARIO');
      console.error('🧪 Estructura del usuario:', JSON.stringify(user, null, 2));
      showToast('Error: No se encontró sedeId del usuario logueado', 'error');
    }
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

  const getEstadoEntregaColor = (fechaEntrega) => {
    return fechaEntrega 
      ? "text-green-800 bg-green-200" 
      : "text-orange-800 bg-orange-200";
  };

  const getEstadoEntregaText = (fechaEntrega) => {
    return fechaEntrega ? "Entregada" : "Pendiente";
  };

  const formatDateDelivery = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES") + " " + date.toLocaleTimeString("es-ES", { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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
                    Historial de Ventas
                  </h3>
                  <div className="text-xs text-blueGray-500 mt-1">
                    <i className="fas fa-calendar mr-1"></i>
                    Mostrando: {new Date().toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
                    {" - Sede del usuario logueado"}
                  </div>
                </div>
                <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
                  <button
                    onClick={fetchVentas}
                    className="bg-yellow-500 text-white active:bg-yellow-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                  >
                    🔄 Refrescar
                  </button>
                  <button
                    className="bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={handleCreate}
                  >
                    Nueva Venta
                  </button>
                </div>
              </div>
              

              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-bold text-blueGray-600 mb-1">
                    Sede
                  </label>
                  <div className="border-0 px-3 py-2 text-blueGray-700 bg-gray-100 rounded text-sm shadow w-full flex items-center">
                    <i className="fas fa-building mr-2 text-blueGray-400"></i>
                    <span className="font-medium">
                      {sedes.find(s => s.id === getUserSedeId(user))?.nombre || 'Sede del usuario logueado'}
                    </span>
                    <span className="ml-2 text-xs text-blueGray-500">
                      (ID: {getUserSedeId(user) || 'No encontrado'})
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-bold text-blueGray-600 mb-1">
                    Fecha Desde
                  </label>
                  <input
                    type="datetime-local"
                    name="fechaInicio"
                    value={filters.fechaInicio}
                    onChange={handleFilterChange}
                    className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                    title="Fecha y hora de inicio del filtro"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-bold text-blueGray-600 mb-1">
                    Fecha Hasta
                  </label>
                  <input
                    type="datetime-local"
                    name="fechaFin"
                    value={filters.fechaFin}
                    onChange={handleFilterChange}
                    className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                    title="Fecha y hora de fin del filtro"
                  />
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
                        Estado Entrega
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
                            <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full ${getEstadoEntregaColor(venta.fechaEntrega)}`}>
                              {getEstadoEntregaText(venta.fechaEntrega)}
                            </span>
                            {venta.fechaEntrega && (
                              <div className="text-xs text-blueGray-400 mt-1">
                                {formatDateDelivery(venta.fechaEntrega)}
                              </div>
                            )}
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => toggleExpandVenta(venta.id)}
                                className="text-blue-500 hover:text-blue-700 p-2 rounded hover:bg-blue-50 transition-all duration-200"
                                title="Ver detalles"
                              >
                                <i className={`fas ${expandedVenta === venta.id ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                              </button>
                              
                              {venta.estado && (
                                <button
                                  onClick={() => handleCancel(venta)}
                                  className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-all duration-200"
                                  title="Anular venta"
                                >
                                  <i className="fas fa-ban"></i>
                                </button>
                              )}
                              
                              {venta.estado && !venta.fechaEntrega && (
                                <button
                                  onClick={() => handleDeliver(venta)}
                                  className="text-green-500 hover:text-green-700 p-2 rounded hover:bg-green-50 transition-all duration-200"
                                  title="Marcar como entregada"
                                >
                                  <i className="fas fa-truck"></i>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        
                        {/* Expanded details */}
                        {expandedVenta === venta.id && venta.detalles && (
                          <tr>
                            <td colSpan="8" className="border-t-0 px-6 py-4 bg-blueGray-50">
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
        onCancel={() => setShowCancelModal(false)}
        onConfirm={confirmCancel}
        title="Anular Venta"
        message={`¿Está seguro que desea anular la venta #${ventaToCancel?.id}? Esta acción devolverá el stock al inventario.`}
        confirmText="Anular"
        cancelText="Cancelar"
        type="danger"
      />

      <ConfirmationModal
        isOpen={showDeliveryModal}
        onCancel={() => setShowDeliveryModal(false)}
        onConfirm={confirmDelivery}
        title="Confirmar Entrega"
        message={`¿Confirma que la venta #${ventaToDeliver?.id} ha sido entregada al cliente? Se registrará la fecha y hora actual de entrega.`}
        confirmText="Confirmar Entrega"
        cancelText="Cancelar"
        type="info"
      />
    </>
  );
}