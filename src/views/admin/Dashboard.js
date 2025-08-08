import React, { useState, useEffect } from "react";

// Components
import KPICard from "components/Dashboard/KPICard.js";
import SimpleLineChart from "components/Dashboard/SimpleLineChart.js";
import TopProductsChart from "components/Dashboard/TopProductsChart.js";

// Services
import { ventaService } from "api/ventaService.js";
import { productoService } from "api/productoService.js";
import { vehiculoService } from "api/vehiculoService.js";

export default function Dashboard() {
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

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true }));

      // Obtener fecha actual y anterior
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

      // Preparar llamadas paralelas
      const promises = [];

      // 1. Ventas del mes actual
      promises.push(
        ventaService.obtenerVentasPorFecha(
          `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`,
          `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${new Date(currentYear, currentMonth, 0).getDate()}`
        ).catch(() => [])
      );

      // 2. Ventas del mes anterior
      promises.push(
        ventaService.obtenerVentasPorFecha(
          `${previousYear}-${previousMonth.toString().padStart(2, '0')}-01`,
          `${previousYear}-${previousMonth.toString().padStart(2, '0')}-${new Date(previousYear, previousMonth, 0).getDate()}`
        ).catch(() => [])
      );

      // 3. Productos en stock
      promises.push(
        productoService.getAll().then(response => response.data || []).catch(() => [])
      );

      // 4. Vehículos
      promises.push(
        vehiculoService.getAllVehiculosPaginated(0, 1000).then(response => response.content || []).catch(() => [])
      );

      // 5. Ventas de los últimos 6 meses para el gráfico
      const ventasMensualesPromises = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentYear, currentMonth - 1 - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const lastDay = new Date(year, month, 0).getDate();
        
        ventasMensualesPromises.push(
          ventaService.obtenerVentasPorFecha(
            `${year}-${month.toString().padStart(2, '0')}-01`,
            `${year}-${month.toString().padStart(2, '0')}-${lastDay}`
          ).then(ventas => ({
            label: date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
            value: ventas.reduce((sum, venta) => sum + (venta.total || 0), 0),
            month: month,
            year: year
          })).catch(() => ({
            label: date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
            value: 0,
            month: month,
            year: year
          }))
        );
      }

      // Ejecutar todas las promesas
      const [
        ventasActuales,
        ventasAnteriores, 
        productos,
        vehiculos,
        ...ventasMensuales
      ] = await Promise.all([...promises, ...ventasMensualesPromises]);

      // Calcular KPIs
      const totalVentasActual = ventasActuales.reduce((sum, venta) => sum + (venta.total || 0), 0);
      const totalVentasAnterior = ventasAnteriores.reduce((sum, venta) => sum + (venta.total || 0), 0);
      const productosEnStock = productos.filter(p => (p.stock || 0) > 0).length;
      const vehiculosActivos = vehiculos.filter(v => v.estado === 'ACTIVO').length;
      const ventasDiarias = Math.round(totalVentasActual / now.getDate());

      // Preparar datos de productos más vendidos (simulado por ahora)
      const topProductos = productos
        .filter(p => p.stock > 0)
        .slice(0, 10)
        .map((producto, index) => ({
          name: producto.nombre,
          value: Math.floor(Math.random() * 100) + 10 // Datos simulados
        }));

      setDashboardData({
        kpis: {
          totalVentas: totalVentasActual,
          totalVentasAnterior: totalVentasAnterior,
          productosEnStock: productosEnStock,
          vehiculosActivos: vehiculosActivos,
          ventasDiarias: ventasDiarias
        },
        ventasMensuales: ventasMensuales,
        topProductos: topProductos,
        loading: false
      });

    } catch (error) {
      console.error("Error loading dashboard data:", error);
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
        {/* KPI Cards */}
        <div className="w-full xl:w-3/12 mb-12 xl:mb-0 px-4">
          <KPICard
            title="Ventas del Mes"
            value={dashboardData.kpis.totalVentas}
            previousValue={dashboardData.kpis.totalVentasAnterior}
            icon="fas fa-dollar-sign"
            color="lightBlue"
            prefix="$"
          />
        </div>
        <div className="w-full xl:w-3/12 mb-12 xl:mb-0 px-4">
          <KPICard
            title="Productos en Stock"
            value={dashboardData.kpis.productosEnStock}
            icon="fas fa-box"
            color="emerald"
          />
        </div>
        <div className="w-full xl:w-3/12 mb-12 xl:mb-0 px-4">
          <KPICard
            title="Vehículos Activos"
            value={dashboardData.kpis.vehiculosActivos}
            icon="fas fa-truck"
            color="orange"
          />
        </div>
        <div className="w-full xl:w-3/12 mb-12 xl:mb-0 px-4">
          <KPICard
            title="Promedio Diario"
            value={dashboardData.kpis.ventasDiarias}
            icon="fas fa-chart-line"
            color="purple"
            prefix="$"
          />
        </div>
      </div>

      <div className="flex flex-wrap mt-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <div className="bg-blueGray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-bold text-blueGray-700 mb-2">
                    <i className="fas fa-truck mr-2 text-orange-500"></i>
                    Flota
                  </h4>
                  <p className="text-xs text-blueGray-600">
                    {dashboardData.kpis.vehiculosActivos} vehículos en operación.
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
