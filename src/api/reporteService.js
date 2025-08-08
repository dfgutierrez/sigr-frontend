import api from "./axiosConfig";

export const reporteService = {
  // Reportes de ventas
  generarReporteVentas: async (fechaInicio, fechaFin, sedeId) => {
    try {
      const response = await api.get("/reportes/ventas", {
        params: {
          fechaInicio,
          fechaFin,
          sedeId
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error generating sales report:", error);
      throw error;
    }
  },

  generarReporteVentasPorUsuario: async (usuarioId, fechaInicio, fechaFin) => {
    try {
      const response = await api.get(`/reportes/ventas/usuario/${usuarioId}`, {
        params: {
          fechaInicio,
          fechaFin
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error generating user sales report:", error);
      throw error;
    }
  },

  generarReporteComparativoSedes: async (fechaInicio, fechaFin) => {
    try {
      const response = await api.get("/reportes/ventas/comparativo-sedes", {
        params: {
          fechaInicio,
          fechaFin
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error generating comparative report:", error);
      throw error;
    }
  },

  // Reportes de usuarios
  generarReporteRendimientoUsuarios: async (fechaInicio, fechaFin, sedeId = null) => {
    try {
      const params = { fechaInicio, fechaFin };
      if (sedeId) params.sedeId = sedeId;
      
      const response = await api.get("/reportes/usuarios/rendimiento", {
        params
      });
      return response.data;
    } catch (error) {
      console.error("Error generating user performance report:", error);
      throw error;
    }
  },

  // Reportes de productos
  obtenerProductosConStockBajo: async (sedeId) => {
    try {
      const response = await api.get("/reportes/productos-stock-bajo", {
        params: { sedeId }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching low stock products:", error);
      throw error;
    }
  },

  obtenerProductosMasVendidos: async (fechaInicio, fechaFin, sedeId, limite = 10) => {
    try {
      const response = await api.get("/reportes/productos-mas-vendidos", {
        params: {
          fechaInicio,
          fechaFin,
          sedeId,
          limite
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching top selling products:", error);
      throw error;
    }
  },

  // Reportes de movimientos
  generarReporteMovimientos: async (fechaInicio, fechaFin, sedeId) => {
    try {
      const response = await api.get("/reportes/movimientos", {
        params: {
          fechaInicio,
          fechaFin,
          sedeId
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error generating movements report:", error);
      throw error;
    }
  },

  // Reportes de inventario
  generarReporteInventario: async (sedeId) => {
    try {
      const response = await api.get("/reportes/inventario", {
        params: { sedeId }
      });
      return response.data;
    } catch (error) {
      console.error("Error generating inventory report:", error);
      throw error;
    }
  },

  generarReporteInventarioCompleto: async () => {
    try {
      const response = await api.get("/reportes/inventario/completo");
      return response.data;
    } catch (error) {
      console.error("Error generating complete inventory report:", error);
      throw error;
    }
  }
};