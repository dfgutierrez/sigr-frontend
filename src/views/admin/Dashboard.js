import React, { useState, useEffect } from "react";

// Components
import SimpleLineChart from "components/Dashboard/SimpleLineChart.js";
import TopProductsChart from "components/Dashboard/TopProductsChart.js";

// Services
import { dashboardService } from "api/dashboardService.js";

// Context
import { useAuth } from "contexts/AuthContext.js";

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    kpis: {
      totalVentas: 0,
      totalVentasAnterior: 0,
      productosEnStock: 0,
      vehiculosActivos: 0,
      ventasDiarias: 0
    },
    ventasMensuales: [],
    topProductos: [],
    loading: true
  });

  // Función para obtener sedeId del usuario
  const getUserSedeId = (user) => {
    if (!user) return null;
    
    if (user.sedes && Array.isArray(user.sedes) && user.sedes.length > 0) {
      return user.sedes[0].id;
    }
    
    return user?.sedeId || user?.sede?.id;
  };

  useEffect(() => {
    if (user) {
      console.log('🏠 Dashboard: useEffect ejecutándose - cargando datos...');
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      console.log('📊 Dashboard: Iniciando carga de datos...');
      setDashboardData(prev => ({ ...prev, loading: true }));

      // Obtener sedeId del usuario
      const sedeId = getUserSedeId(user);
      if (!sedeId) {
        console.log('📊 Dashboard: No se pudo obtener sedeId del usuario');
        setDashboardData(prev => ({ ...prev, loading: false }));
        return;
      }

      console.log('📊 Dashboard: Obteniendo datos para sede:', sedeId);
      
      // Consumir la nueva API del dashboard
      const response = await dashboardService.getDashboardBySede(sedeId);
      
      if (response.success && response.data) {
        const apiData = response.data;
        
        console.log('📊 Dashboard: Datos recibidos de la API:', apiData);

        // Mapear datos de ventas mensuales
        const ventasMensuales = (apiData.ventasMensuales || []).map(venta => ({
          ...venta,
          label: venta.mes // Mapear 'mes' a 'label' para el componente gráfico
        }));
        
        // Mapear productos más vendidos
        const topProductos = (apiData.productosMasVendidos || []).map(producto => ({
          name: producto.nombre,
          value: producto.cantidadVendida
        }));

        // Obtener KPIs
        const kpis = apiData.kpis || {};
        
        setDashboardData({
          kpis: {
            totalVentas: kpis.ventasMesActual?.total || 0,
            totalVentasAnterior: kpis.ventasMesAnterior?.total || 0,
            productosEnStock: kpis.inventario?.productosEnStock || 0,
            vehiculosActivos: apiData.vehiculosNuevosDiaActual || 0, // Usando vehículos nuevos del día
            ventasDiarias: kpis.ventasMesActual?.cantidad || 0
          },
          ventasMensuales: ventasMensuales,
          topProductos: topProductos,
          loading: false
        });
        
        console.log('✅ Dashboard: Datos cargados exitosamente');
      } else {
        console.log('⚠️ Dashboard: Respuesta sin datos válidos');
        setDashboardData(prev => ({ ...prev, loading: false }));
      }

    } catch (error) {
      console.error("❌ Dashboard: Error loading dashboard data:", error);
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  };

  if (dashboardData.loading) {
    return (
      <div className="flex flex-wrap mt-4">
        <div className="w-full mb-12 px-4">
          <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
            <div className="rounded-t mb-0 px-4 py-3 border-0">
              <div className="flex flex-wrap items-center">
                <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                  <h3 className="font-semibold text-base text-blueGray-700">
                    Cargando Dashboard...
                  </h3>
                </div>
              </div>
            </div>
            <div className="block w-full overflow-x-auto p-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lightBlue-500 mx-auto"></div>
                <p className="text-blueGray-500 mt-4">Obteniendo datos del sistema...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap">
        {/* Gráfico de Ventas Mensuales */}
        <div className="w-full xl:w-8/12 mb-12 xl:mb-0 px-4">
          <SimpleLineChart
            data={dashboardData.ventasMensuales}
            title="Ventas Mensuales"
            height={350}
            color="#0ea5e9"
          />
        </div>

        {/* Top Productos */}
        <div className="w-full xl:w-4/12 px-4">
          <TopProductsChart
            data={dashboardData.topProductos}
            title="Productos Más Vendidos"
            maxItems={8}
          />
        </div>
      </div>

      <div className="flex flex-wrap mt-4">
        <div className="w-full mb-12 px-4">
          <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
            <div className="rounded-t mb-0 px-4 py-3 border-0">
              <div className="flex flex-wrap items-center">
                <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                  <h3 className="font-semibold text-base text-blueGray-700">
                    Resumen Ejecutivo
                  </h3>
                </div>
                <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
                  <button
                    className="bg-lightBlue-500 text-white active:bg-lightBlue-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={loadDashboardData}
                  >
                    <i className="fas fa-sync-alt mr-1"></i>
                    Actualizar
                  </button>
                </div>
              </div>
            </div>
            <div className="block w-full overflow-x-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blueGray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-bold text-blueGray-700 mb-2">
                    <i className="fas fa-chart-bar mr-2 text-lightBlue-500"></i>
                    Estado de Ventas
                  </h4>
                  <p className="text-xs text-blueGray-600">
                    Las ventas del mes actual {dashboardData.kpis.totalVentas > dashboardData.kpis.totalVentasAnterior ? 'superan' : 'están por debajo'} del mes anterior.
                  </p>
                </div>
                <div className="bg-blueGray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-bold text-blueGray-700 mb-2">
                    <i className="fas fa-boxes mr-2 text-emerald-500"></i>
                    Inventario
                  </h4>
                  <p className="text-xs text-blueGray-600">
                    {dashboardData.kpis.productosEnStock} productos disponibles en stock.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
