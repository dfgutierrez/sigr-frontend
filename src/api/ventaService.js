import api from "./axiosConfig";
import { mockVentaService, shouldUseMock } from "./mockServices";

export const ventaService = {
  // Operaciones CRUD básicas
  obtenerTodasLasVentas: async (page = 0, size = 10) => {
    try {
      const response = await api.get("/ventas", {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching all sales:", error);
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

  obtenerVentasPorSede: async (sedeId, page = 0, size = 10) => {
    try {
      const response = await api.get(`/ventas/sede/${sedeId}`, {
        params: { page, size }
      });
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
  }
};