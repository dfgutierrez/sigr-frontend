import api from "./axiosConfig";
import { mockVentaService, shouldUseMock } from "./mockServices";

export const ventaService = {
  // Operaciones CRUD básicas
  obtenerTodasLasVentas: async (page = 0, size = 10, sedeId = null, fechaDesde = null, fechaHasta = null) => {
    try {
      console.log('🔥🔥 obtenerTodasLasVentas EJECUTÁNDOSE...');
      console.log('🔥🔥 Parámetros recibidos:', { page, size, sedeId, fechaDesde, fechaHasta });
      
      // IMPORTANTE: SIEMPRE usar el endpoint específico de sede si se proporciona sedeId
      if (sedeId) {
        console.log('🔥🔥 USANDO ENDPOINT DE SEDE CON FILTROS DE FECHA');
        
        const params = { page, size };
        
        // Agregar filtros de fecha si están presentes
        if (fechaDesde) {
          params.fechaDesde = fechaDesde;
          console.log('🔥🔥 Agregando fechaDesde:', fechaDesde);
        }
        if (fechaHasta) {
          params.fechaHasta = fechaHasta;
          console.log('🔥🔥 Agregando fechaHasta:', fechaHasta);
        }
        
        const finalUrl = `/ventas/sede/${sedeId}`;
        console.log('🔥🔥 URL final:', finalUrl);
        console.log('🔥🔥 Parámetros finales:', params);
        console.log(`🔥🔥 URL COMPLETA: ${api.defaults.baseURL}${finalUrl}?${new URLSearchParams(params).toString()}`);
        
        const response = await api.get(finalUrl, { params });
        
        console.log('🔥🔥 Respuesta HTTP recibida:', response);
        console.log('🔥🔥 Status:', response.status);
        console.log('🔥🔥 Data:', response.data);
        return response.data;
      } else {
        console.log('🔥🔥 NO SE PROPORCIONÓ SEDE ID - USANDO ENDPOINT GENERAL');
        // Fallback al endpoint general (en caso de que se necesite)
        const response = await api.get("/ventas", {
          params: { page, size }
        });
        return response.data;
      }
    } catch (error) {
      console.error("🔥🔥 ERROR EN obtenerTodasLasVentas:", error);
      console.error("🔥🔥 Error response:", error.response);
      console.error("🔥🔥 Error status:", error.response?.status);
      console.error("🔥🔥 Error data:", error.response?.data);
      throw error;
    }
  },

  obtenerVentaPorId: async (id) => {
    try {
      const response = await api.get(`/ventas/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching sale ${id}:`, error);
      throw error;
    }
  },

  crearVenta: async (ventaData) => {
    try {
      const response = await api.post("/ventas", ventaData);
      return response.data;
    } catch (error) {
      console.error("Error creating sale:", error);
      throw error;
    }
  },

  anularVenta: async (id) => {
    try {
      const response = await api.delete(`/ventas/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error cancelling sale ${id}:`, error);
      throw error;
    }
  },

  // Consultas específicas
  obtenerVentasPorUsuario: async (usuarioId, page = 0, size = 10) => {
    try {
      const response = await api.get(`/ventas/usuario/${usuarioId}`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching sales for user ${usuarioId}:`, error);
      throw error;
    }
  },

  obtenerVentasPorSede: async (sedeId, page = 0, size = 10, fechaDesde = null, fechaHasta = null) => {
    try {
      const params = { page, size };
      
      // Agregar filtros de fecha si están presentes con los nombres correctos
      if (fechaDesde) {
        params.fechaDesde = fechaDesde;
      }
      if (fechaHasta) {
        params.fechaHasta = fechaHasta;
      }
      
      console.log(`📅 Consultando ventas de sede ${sedeId} con parámetros:`, params);
      console.log(`🌐 URL que se construirá: /api/v1/ventas/sede/${sedeId}?${new URLSearchParams(params).toString()}`);
      
      const response = await api.get(`/ventas/sede/${sedeId}`, {
        params
      });
      
      console.log(`✅ Respuesta recibida para sede ${sedeId}:`, response);
      return response.data;
    } catch (error) {
      console.error(`Error fetching sales for sede ${sedeId}:`, error);
      throw error;
    }
  },

  obtenerVentasDelDia: async (sedeId) => {
    try {
      const response = await api.get(`/ventas/sede/${sedeId}/hoy`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching today's sales for sede ${sedeId}:`, error);
      throw error;
    }
  },

  obtenerVentasPorFecha: async (fechaInicio, fechaFin, page = 0, size = 10) => {
    // Usar mock si estamos en modo desarrollo sin backend
    if (shouldUseMock()) {
      return await mockVentaService.obtenerVentasPorFecha(fechaInicio, fechaFin);
    }
    
    try {
      const response = await api.get("/ventas/fecha", {
        params: {
          fechaInicio,
          fechaFin,
          page,
          size
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching sales by date range:", error);
      throw error;
    }
  },

  // Marcar venta como entregada
  marcarVentaComoEntregada: async (ventaId, fechaEntrega = null) => {
    try {
      let fechaEntregaFinal;
      
      if (fechaEntrega) {
        fechaEntregaFinal = fechaEntrega;
      } else {
        // Crear fecha actual en formato local sin conversión UTC
        const now = new Date();
        
        // Formatear fecha en formato ISO local (YYYY-MM-DDTHH:mm:ss)
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        fechaEntregaFinal = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      }
      
      console.log('Fecha de entrega enviada (hora local):', fechaEntregaFinal);
      console.log('Hora actual del navegador:', new Date().toLocaleString());
      
      const response = await api.patch(`/ventas/${ventaId}/fecha-entrega`, null, {
        params: {
          fechaEntrega: fechaEntregaFinal
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error marking sale ${ventaId} as delivered:`, error);
      throw error;
    }
  }
};