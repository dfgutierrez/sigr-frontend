import React, { useState, useEffect } from "react";

// components
import CardStats from "components/Cards/CardStats.js";

// services
import { dashboardService } from "api/dashboardService.js";

// context
import { useAuth } from "contexts/AuthContext.js";

export default function HeaderStats() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    productosVendidosMes: [],
    productosVendidosDia: [],
    vehiculosNuevosDia: 0,
    productosPorSede: [],
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
    const loadDashboardData = async () => {
      if (!user) {
        console.log('📊 HeaderStats: Usuario no disponible aún');
        return;
      }

      const sedeId = getUserSedeId(user);
      if (!sedeId) {
        console.log('📊 HeaderStats: No se pudo obtener sedeId del usuario');
        setDashboardData(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        console.log('📊 HeaderStats: Cargando datos para sede:', sedeId);
        const response = await dashboardService.getDashboardBySede(sedeId);
        
        if (response.success && response.data) {
          setDashboardData({
            productosVendidosMes: response.data.productosVendidosMesActual || [],
            productosVendidosDia: response.data.productosVendidosDiaActual || [],
            vehiculosNuevosDia: response.data.vehiculosNuevosDiaActual || 0,
            productosPorSede: response.data.productosPorSede || [],
            loading: false
          });
          console.log('✅ HeaderStats: Datos cargados exitosamente:', response.data);
        } else {
          console.log('⚠️ HeaderStats: Respuesta sin datos válidos');
          setDashboardData(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('❌ HeaderStats: Error cargando datos del dashboard:', error);
        setDashboardData(prev => ({ ...prev, loading: false }));
      }
    };

    loadDashboardData();
  }, [user]);

  // Obtener valores para mostrar en las tarjetas
  const getProductosVendidosMes = () => {
    if (!dashboardData.productosVendidosMes || dashboardData.productosVendidosMes.length === 0) return 0;
    return dashboardData.productosVendidosMes.reduce((sum, item) => sum + item.cantidadProductosVendidos, 0);
  };

  const getProductosVendidosDia = () => {
    if (!dashboardData.productosVendidosDia || dashboardData.productosVendidosDia.length === 0) return 0;
    return dashboardData.productosVendidosDia.reduce((sum, item) => sum + item.cantidadProductosVendidos, 0);
  };

  const getTotalProductos = () => {
    if (!dashboardData.productosPorSede || dashboardData.productosPorSede.length === 0) return 0;
    return dashboardData.productosPorSede.reduce((sum, item) => sum + item.cantidadProductos, 0);
  };

  return (
    <>
      {/* Header */}
      <div className="relative bg-lightBlue-600 md:pt-32 pb-32 pt-12">
        <div className="px-4 md:px-10 mx-auto w-full">
          <div>
            {/* Card stats */}
            <div className="flex flex-wrap">
              <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                <CardStats
                  statSubtitle="PRODUCTOS VENDIDOS HOY"
                  statTitle={dashboardData.loading ? "..." : getProductosVendidosDia().toString()}
                  statArrow="up"
                  statPercent="0"
                  statPercentColor="text-emerald-500"
                  statDescripiron="Productos vendidos hoy"
                  statIconName="fas fa-shopping-cart"
                  statIconColor="bg-red-500"
                />
              </div>
              <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                <CardStats
                  statSubtitle="PRODUCTOS VENDIDOS MES"
                  statTitle={dashboardData.loading ? "..." : getProductosVendidosMes().toString()}
                  statArrow="up"
                  statPercent="0"
                  statPercentColor="text-emerald-500"
                  statDescripiron="Productos vendidos este mes"
                  statIconName="fas fa-chart-line"
                  statIconColor="bg-orange-500"
                />
              </div>
              <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                <CardStats
                  statSubtitle="VEHÍCULOS NUEVOS HOY"
                  statTitle={dashboardData.loading ? "..." : dashboardData.vehiculosNuevosDia.toString()}
                  statArrow="up"
                  statPercent="0"
                  statPercentColor="text-emerald-500"
                  statDescripiron="Vehículos registrados hoy"
                  statIconName="fas fa-car"
                  statIconColor="bg-pink-500"
                />
              </div>
              <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                <CardStats
                  statSubtitle="TOTAL PRODUCTOS"
                  statTitle={dashboardData.loading ? "..." : getTotalProductos().toString()}
                  statArrow="up"
                  statPercent="0"
                  statPercentColor="text-emerald-500"
                  statDescripiron="Productos disponibles en sede"
                  statIconName="fas fa-boxes"
                  statIconColor="bg-lightBlue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
