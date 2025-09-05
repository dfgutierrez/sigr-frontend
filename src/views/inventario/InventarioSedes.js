import React, { useState, useEffect } from "react";
import { inventarioService } from "api/inventarioService";
import { sedeService } from "api/sedeService";
import InventarioTable from "components/Cards/InventarioTable";
import { useToast } from "hooks/useToastSimple";
import { useAuth } from "contexts/AuthContext";
import * as XLSX from 'xlsx';

export default function InventarioSedes() {
  const { user } = useAuth();
  const [inventario, setInventario] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [selectedSedeId, setSelectedSedeId] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [downloadingCSV, setDownloadingCSV] = useState(false);
  const { showToast } = useToast();

  // Función para obtener el sedeId del usuario logueado
  const getUserSedeId = () => {
    if (!user) return null;
    
    // Estructura específica de la respuesta de login: user.sedes[0].id
    if (user.sedes && Array.isArray(user.sedes) && user.sedes.length > 0) {
      return user.sedes[0].id.toString();
    }
    
    // Otras posibles ubicaciones del sedeId
    return user?.sedeId?.toString() || user?.sede?.id?.toString() || null;
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        
        // Primero cargar las sedes
        try {
          const sedesData = await sedeService.getAll();
          console.log('🏢 Sedes data received:', sedesData);
          
          // Validar que sedesData sea un array
          const validSedesData = Array.isArray(sedesData) ? sedesData : [];
          setSedes(validSedesData);
          console.log('✅ Sedes set:', validSedesData.length, 'items');
        } catch (sedesError) {
          console.error('❌ Error loading sedes:', sedesError);
          setSedes([]); // Asegurar que siempre sea un array
          showToast('Error al cargar sedes', 'warning');
        }
        
        // Obtener la sede del usuario logueado
        const userSedeId = getUserSedeId();
        
        if (userSedeId) {
          console.log('🏢 Preseleccionando sede del usuario:', userSedeId);
          setSelectedSedeId(userSedeId);
          // Cargar inventario de la sede del usuario
          await fetchData(userSedeId);
        } else {
          console.log('⚠️ No se encontró sede del usuario, cargando todos los inventarios');
          // Si no se encuentra sede del usuario, cargar todos
          await fetchData();
        }
      } catch (error) {
        console.error('Error initializing InventarioSedes:', error);
        showToast('Error al inicializar la página', 'error');
      }
    };

    if (user) {
      initialize();
    }
  }, [user]);

  const fetchData = async (sedeId = null) => {
    try {
      setLoading(true);
      
      // Intentar cargar inventario
      let inventarioData = [];
      try {
        let inventarioResponse;
        
        if (sedeId) {
          // Usar el servicio específico para obtener inventarios por sede
          inventarioResponse = await inventarioService.getBySede(sedeId);
          console.log('🔍 Inventario por sede API response:', inventarioResponse);
        } else {
          // Obtener todos los inventarios
          inventarioResponse = await inventarioService.getAll();
          console.log('🔍 Full inventario API response:', inventarioResponse);
        }
        
        // Manejar diferentes estructuras de respuesta
        if (inventarioResponse?.data?.data && Array.isArray(inventarioResponse.data.data)) {
          // Estructura del nuevo endpoint: { success: true, data: [...] }
          inventarioData = inventarioResponse.data.data;
        } else if (inventarioResponse?.data?.content) {
          // Estructura paginada: { success: true, data: { content: [...] } }
          inventarioData = inventarioResponse.data.content;
        } else if (Array.isArray(inventarioResponse?.data)) {
          // Estructura: { data: [...] }
          inventarioData = inventarioResponse.data;
        } else if (Array.isArray(inventarioResponse)) {
          // Array directo
          inventarioData = inventarioResponse;
        } else {
          inventarioData = [];
        }
        
        console.log('✅ Inventario processed:', inventarioData.length, 'items');
        console.log('📋 Sample inventario item:', inventarioData[0]);
      } catch (inventarioError) {
        console.error('❌ Error loading inventario:', inventarioError);
        const errorMsg = sedeId 
          ? `Error al cargar inventario para la sede: ${inventarioError.message || inventarioError}`
          : `Error al cargar inventario: ${inventarioError.message || inventarioError}`;
        showToast(errorMsg, 'error');
        inventarioData = [];
      }
      
      // Intentar cargar sedes solo la primera vez o si no están cargadas
      let sedesData = sedes.length > 0 ? sedes : [];
      if (sedesData.length === 0) {
        try {
          const sedesResponse = await sedeService.getAllSedes();
          console.log('🔍 Sedes API response:', sedesResponse);
          sedesData = Array.isArray(sedesResponse) ? sedesResponse : [];
          console.log('✅ Sedes loaded:', sedesData.length, 'items');
        } catch (sedesError) {
          console.error('❌ Error loading sedes:', sedesError);
          showToast('Error al cargar sedes', 'error');
          sedesData = [];
        }
      }
      
      setInventario(inventarioData);
      setSedes(sedesData);
      
    } catch (error) {
      console.error('❌ General error fetching data:', error);
      showToast('Error general al cargar datos', 'error');
      setInventario([]);
      setSedes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCantidad = async (productoId, sedeId, nuevaCantidad) => {
    try {
      // Validar que inventario sea un array
      const inventarioArray = Array.isArray(inventario) ? inventario : [];
      
      // Buscar el inventario específico
      const inventarioItem = inventarioArray.find(item => 
        item.productoId === productoId && item.sedeId === sedeId
      );
      
      if (!inventarioItem) {
        showToast('No se encontró el item de inventario', 'error');
        return;
      }
      
      // Actualizar estado local primero (optimistic update)
      setInventario(prev => {
        const prevArray = Array.isArray(prev) ? prev : [];
        return prevArray.map(item =>
          item.id === inventarioItem.id
            ? { ...item, cantidad: nuevaCantidad }
            : item
        );
      });
      
      try {
        // Intentar actualizar en el backend
        await inventarioService.update(inventarioItem.id, { cantidad: nuevaCantidad });
        showToast('Cantidad actualizada correctamente', 'success');
      } catch (updateError) {
        console.error('❌ Error updating cantidad in backend:', updateError);
        // Revertir el cambio local si falla el backend
        setInventario(prev => {
          const prevArray = Array.isArray(prev) ? prev : [];
          return prevArray.map(item =>
            item.id === inventarioItem.id
              ? { ...item, cantidad: inventarioItem.cantidad }
              : item
          );
        });
        showToast('Error al actualizar cantidad en el servidor. Cambio revertido.', 'error');
      }
      
    } catch (error) {
      console.error('❌ General error updating cantidad:', error);
      showToast('Error general al actualizar cantidad', 'error');
    }
  };

  const handleSedeChange = async (sedeId) => {
    setSelectedSedeId(sedeId);
    if (sedeId) {
      await fetchData(sedeId);
    } else {
      await fetchData(); // Cargar todos los inventarios
    }
  };

  const getTotalProductos = () => {
    const inventarioArray = Array.isArray(inventario) ? inventario : [];
    return inventarioArray.length;
  };

  const getTotalStock = () => {
    const inventarioArray = Array.isArray(inventario) ? inventario : [];
    return inventarioArray.reduce((total, item) => total + (item.cantidad || 0), 0);
  };

  const getStockBajo = () => {
    const inventarioArray = Array.isArray(inventario) ? inventario : [];
    return inventarioArray.filter(item => (item.cantidad || 0) <= 10 && (item.cantidad || 0) > 0).length;
  };

  const getProductosAgotados = () => {
    const inventarioArray = Array.isArray(inventario) ? inventario : [];
    return inventarioArray.filter(item => (item.cantidad || 0) === 0).length;
  };

  const getValorTotal = () => {
    const inventarioArray = Array.isArray(inventario) ? inventario : [];
    return inventarioArray.reduce((total, item) => {
      const cantidad = item.cantidad || 0;
      const precio = item.precio_venta || item.precioVenta || item.producto?.precioVenta || item.producto?.precio_venta || 0;
      return total + (cantidad * precio);
    }, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Función para descargar inventario en Excel (.xlsx)
  const downloadInventarioExcel = async () => {
    try {
      setDownloadingExcel(true);
      
      // Pequeña pausa para mostrar el estado de carga
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const inventarioArray = Array.isArray(inventario) ? inventario : [];
      
      if (inventarioArray.length === 0) {
        showToast('No hay datos para descargar', 'warning');
        setDownloadingExcel(false);
        return;
      }

      // Preparar los datos para Excel
      const excelData = inventarioArray.map(item => {
        const producto = item.producto || {};
        const sede = sedes.find(s => s.id === item.sedeId) || {};
        const precio = item.precio_venta || item.precioVenta || producto.precioVenta || producto.precio_venta || 0;
        
        return {
          'Sede': sede.nombre || 'Sin sede',
          'Código': producto.codigoBarra || 'Sin código',
          'Producto': producto.nombre || 'Sin nombre',
          'Categoría': producto.categoria?.nombre || 'Sin categoría',
          'Marca': producto.marca?.nombre || 'Sin marca',
          'Cantidad': item.cantidad || 0,
          'Precio Unitario': precio,
          'Valor Total': (item.cantidad || 0) * precio,
          'Estado': (item.cantidad || 0) === 0 ? 'Agotado' : (item.cantidad || 0) <= 10 ? 'Stock Bajo' : 'Disponible'
        };
      });

      // Crear workbook y worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      
      // Nombre del archivo con fecha y sede
      const fechaActual = new Date().toISOString().split('T')[0];
      const sedeNombre = selectedSedeId 
        ? `_${sedes.find(s => s.id.toString() === selectedSedeId)?.nombre || 'sede'}`
        : '_todas_sedes';
      const fileName = `inventario${sedeNombre}_${fechaActual}.xlsx`;
      
      // Agregar worksheet al workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Inventario');
      
      // Descargar archivo
      XLSX.writeFile(wb, fileName);
      
      showToast(`Archivo ${fileName} descargado exitosamente`, 'success');
      
    } catch (error) {
      console.error('Error downloading Excel inventory:', error);
      showToast('Error al descargar el inventario Excel', 'error');
    } finally {
      setDownloadingExcel(false);
    }
  };

  // Función para descargar inventario en CSV
  const downloadInventarioCSV = async () => {
    try {
      setDownloadingCSV(true);
      
      // Pequeña pausa para mostrar el estado de carga
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const inventarioArray = Array.isArray(inventario) ? inventario : [];
      
      if (inventarioArray.length === 0) {
        showToast('No hay datos para descargar', 'warning');
        setDownloadingCSV(false);
        return;
      }

      // Preparar los datos para el CSV
      const csvData = inventarioArray.map(item => {
        const producto = item.producto || {};
        const sede = sedes.find(s => s.id === item.sedeId) || {};
        const precio = item.precio_venta || item.precioVenta || producto.precioVenta || producto.precio_venta || 0;
        
        return {
          'Sede': sede.nombre || 'Sin sede',
          'Código': producto.codigoBarra || 'Sin código',
          'Producto': producto.nombre || 'Sin nombre',
          'Categoría': producto.categoria?.nombre || 'Sin categoría',
          'Marca': producto.marca?.nombre || 'Sin marca',
          'Cantidad': item.cantidad || 0,
          'Precio Unitario': precio,
          'Valor Total': (item.cantidad || 0) * precio,
          'Estado': (item.cantidad || 0) === 0 ? 'Agotado' : (item.cantidad || 0) <= 10 ? 'Stock Bajo' : 'Disponible'
        };
      });

      // Convertir a CSV
      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(','), // Header row
        ...csvData.map(row => 
          headers.map(header => {
            const value = row[header];
            // Escapar valores que contengan comas o comillas
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      // Crear y descargar archivo
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      // Nombre del archivo con fecha y sede
      const fechaActual = new Date().toISOString().split('T')[0];
      const sedeNombre = selectedSedeId 
        ? `_${sedes.find(s => s.id.toString() === selectedSedeId)?.nombre || 'sede'}`
        : '_todas_sedes';
      const fileName = `inventario${sedeNombre}_${fechaActual}.csv`;
      
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast(`Archivo ${fileName} descargado exitosamente`, 'success');
      
    } catch (error) {
      console.error('Error downloading CSV inventory:', error);
      showToast('Error al descargar el inventario CSV', 'error');
    } finally {
      setDownloadingCSV(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap mt-4">
        {/* Estadísticas */}
        <div className="w-full xl:w-8/12 mb-12 xl:mb-0 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Productos */}
            <div className="relative flex flex-col min-w-0 break-words bg-white rounded mb-6 xl:mb-0 shadow-lg">
              <div className="flex-auto p-4">
                <div className="flex flex-wrap">
                  <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
                    <h5 className="text-blueGray-400 uppercase font-bold text-xs">
                      Total Productos
                    </h5>
                    <span className="font-semibold text-xl text-blueGray-700">
                      {getTotalProductos()}
                    </span>
                  </div>
                  <div className="relative w-auto pl-4 flex-initial">
                    <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-lightBlue-500">
                      <i className="fas fa-box"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Stock */}
            <div className="relative flex flex-col min-w-0 break-words bg-white rounded mb-6 xl:mb-0 shadow-lg">
              <div className="flex-auto p-4">
                <div className="flex flex-wrap">
                  <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
                    <h5 className="text-blueGray-400 uppercase font-bold text-xs">
                      Total Stock
                    </h5>
                    <span className="font-semibold text-xl text-blueGray-700">
                      {getTotalStock().toLocaleString()}
                    </span>
                  </div>
                  <div className="relative w-auto pl-4 flex-initial">
                    <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-green-500">
                      <i className="fas fa-cubes"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stock Bajo */}
            <div className="relative flex flex-col min-w-0 break-words bg-white rounded mb-6 xl:mb-0 shadow-lg">
              <div className="flex-auto p-4">
                <div className="flex flex-wrap">
                  <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
                    <h5 className="text-blueGray-400 uppercase font-bold text-xs">
                      Stock Bajo
                    </h5>
                    <span className="font-semibold text-xl text-yellow-600">
                      {getStockBajo()}
                    </span>
                  </div>
                  <div className="relative w-auto pl-4 flex-initial">
                    <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-yellow-500">
                      <i className="fas fa-exclamation-triangle"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Productos Agotados */}
            <div className="relative flex flex-col min-w-0 break-words bg-white rounded mb-6 xl:mb-0 shadow-lg">
              <div className="flex-auto p-4">
                <div className="flex flex-wrap">
                  <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
                    <h5 className="text-blueGray-400 uppercase font-bold text-xs">
                      Agotados
                    </h5>
                    <span className="font-semibold text-xl text-red-600">
                      {getProductosAgotados()}
                    </span>
                  </div>
                  <div className="relative w-auto pl-4 flex-initial">
                    <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-red-500">
                      <i className="fas fa-ban"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Valor Total */}
        <div className="w-full xl:w-4/12 px-4">
          <div className="relative flex flex-col min-w-0 break-words bg-white rounded mb-6 xl:mb-0 shadow-lg">
            <div className="flex-auto p-4">
              <div className="flex flex-wrap">
                <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
                  <h5 className="text-blueGray-400 uppercase font-bold text-xs">
                    Valor Total Inventario
                  </h5>
                  <span className="font-semibold text-2xl text-emerald-500">
                    {formatCurrency(getValorTotal())}
                  </span>
                </div>
                <div className="relative w-auto pl-4 flex-initial">
                  <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-emerald-500">
                    <i className="fas fa-dollar-sign"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap mt-4">
        <div className="w-full mb-12 px-4">
          {/* Header */}
          <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded bg-white">
            <div className="rounded-t mb-0 px-4 py-3 border-0">
              <div className="flex flex-wrap items-center">
                <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                  <h3 className="font-semibold text-base text-blueGray-700">
                    Inventario por Sede
                  </h3>
                  <p className="text-sm text-blueGray-500 mt-1">
                    Gestione el stock de productos en cada sede
                  </p>
                </div>
                <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
                  <button
                    className={`font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-2 mb-1 ease-linear transition-all duration-150 min-w-[140px] ${
                      downloadingExcel 
                        ? 'bg-green-400 text-white cursor-not-allowed opacity-75' 
                        : loading || (!Array.isArray(inventario) || inventario.length === 0)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700'
                    }`}
                    style={{
                      backgroundColor: downloadingExcel 
                        ? '#10b981' 
                        : loading || (!Array.isArray(inventario) || inventario.length === 0)
                        ? '#d1d5db'
                        : '#059669',
                      color: downloadingExcel || (!loading && Array.isArray(inventario) && inventario.length > 0)
                        ? '#ffffff'
                        : '#6b7280'
                    }}
                    type="button"
                    onClick={downloadInventarioExcel}
                    disabled={loading || downloadingExcel || (!Array.isArray(inventario) || inventario.length === 0)}
                    title="Descargar inventario en Excel (.xlsx)"
                  >
                    <i className={`${downloadingExcel ? 'fas fa-spinner fa-spin' : 'fas fa-file-excel'} mr-2`}></i>
                    {downloadingExcel ? 'Descargando...' : 'Descargar Excel'}
                  </button>
                  <button
                    className={`font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-2 mb-1 ease-linear transition-all duration-150 min-w-[140px] ${
                      downloadingCSV 
                        ? 'bg-blue-400 text-white cursor-not-allowed opacity-75' 
                        : loading || (!Array.isArray(inventario) || inventario.length === 0)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
                    }`}
                    style={{
                      backgroundColor: downloadingCSV 
                        ? '#60a5fa' 
                        : loading || (!Array.isArray(inventario) || inventario.length === 0)
                        ? '#d1d5db'
                        : '#3b82f6',
                      color: downloadingCSV || (!loading && Array.isArray(inventario) && inventario.length > 0)
                        ? '#ffffff'
                        : '#6b7280'
                    }}
                    type="button"
                    onClick={downloadInventarioCSV}
                    disabled={loading || downloadingCSV || (!Array.isArray(inventario) || inventario.length === 0)}
                    title="Descargar inventario en CSV"
                  >
                    <i className={`${downloadingCSV ? 'fas fa-spinner fa-spin' : 'fas fa-file-csv'} mr-2`}></i>
                    {downloadingCSV ? 'Descargando...' : 'Descargar CSV'}
                  </button>
                  <button
                    className="bg-lightBlue-500 text-white active:bg-lightBlue-600 text-xs font-bold uppercase px-4 py-2 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 min-w-[140px]"
                    type="button"
                    onClick={() => fetchData(selectedSedeId)}
                  >
                    <i className="fas fa-sync-alt mr-2"></i>
                    Actualizar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Selector de Sede */}
          <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded bg-white">
            <div className="rounded-t mb-0 px-4 py-3 border-0">
              <div className="flex flex-wrap items-center">
                <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                  <h4 className="font-semibold text-base text-blueGray-700 mb-2">
                    Filtrar por Sede
                  </h4>
                  <div className="flex items-center gap-4">
                    <select
                      value={selectedSedeId}
                      onChange={(e) => handleSedeChange(e.target.value)}
                      className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring"
                    >
                      <option value="">Todas las sedes</option>
                      {Array.isArray(sedes) && sedes.map(sede => (
                        <option key={sede.id} value={sede.id}>
                          {sede.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de inventario */}
          <InventarioTable
            inventario={inventario}
            sedes={sedes}
            onUpdateCantidad={handleUpdateCantidad}
            loading={loading}
          />
        </div>
      </div>
    </>
  );
}