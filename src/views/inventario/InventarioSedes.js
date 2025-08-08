import React, { useState, useEffect } from "react";
import { inventarioService } from "api/inventarioService";
import { sedeService } from "api/sedeService";
import InventarioTable from "components/Cards/InventarioTable";
import { useToast } from "hooks/useToastSimple";

export default function InventarioSedes() {
  const [inventario, setInventario] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [selectedSedeId, setSelectedSedeId] = useState("");
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

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
                    className="bg-lightBlue-500 text-white active:bg-lightBlue-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
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
                      {sedes.map(sede => (
                        <option key={sede.id} value={sede.id}>
                          {sede.nombre}
                        </option>
                      ))}
                    </select>
                    {selectedSedeId && (
                      <span className="text-sm text-blueGray-500">
                        Mostrando inventario de: <strong>{sedes.find(s => s.id.toString() === selectedSedeId)?.nombre}</strong>
                      </span>
                    )}
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