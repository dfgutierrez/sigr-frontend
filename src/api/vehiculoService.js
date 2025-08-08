import api from "./axiosConfig";
import { mockVehiculoService, shouldUseMock } from "./mockServices";

export const vehiculoService = {
  getAllVehiculos: async () => {
    if (shouldUseMock()) {
      return await mockVehiculoService.getAllVehiculos();
    }
    try {
      const response = await api.get("/vehiculos");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching vehiculos:", error);
      throw error;
    }
  },

  getAllVehiculosPaginated: async (page = 0, size = 10) => {
    if (shouldUseMock()) {
      return await mockVehiculoService.getAllVehiculosPaginated(page, size);
    }
    try {
      const response = await api.get("/vehiculos/paginated", {
        params: { page, size }
      });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching paginated vehiculos:", error);
      throw error;
    }
  },

  getVehiculoById: async (id) => {
    try {
      const response = await api.get(`/vehiculos/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching vehiculo ${id}:`, error);
      throw error;
    }
  },

  createVehiculo: async (vehiculoData) => {
    try {
      const response = await api.post("/vehiculos", vehiculoData);
      return response.data.data;
    } catch (error) {
      console.error("Error creating vehiculo:", error);
      throw error;
    }
  },

  updateVehiculo: async (id, vehiculoData) => {
    try {
      const response = await api.put(`/vehiculos/${id}`, vehiculoData);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating vehiculo ${id}:`, error);
      throw error;
    }
  },

  deleteVehiculo: async (id) => {
    try {
      const response = await api.delete(`/vehiculos/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting vehiculo ${id}:`, error);
      throw error;
    }
  },

  getVehiculosByTipo: async (tipo) => {
    try {
      const response = await api.get(`/vehiculos/tipo/${tipo}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching vehiculos by tipo ${tipo}:`, error);
      throw error;
    }
  },

  getVehiculosBySede: async (sedeId) => {
    try {
      const response = await api.get(`/vehiculos/sede/${sedeId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching vehiculos by sede ${sedeId}:`, error);
      throw error;
    }
  },

  getVehiculosByEstado: async (estado) => {
    if (shouldUseMock()) {
      return await mockVehiculoService.getVehiculosByEstado(estado);
    }
    try {
      const response = await api.get(`/vehiculos/estado/${estado}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching vehiculos by estado ${estado}:`, error);
      throw error;
    }
  },

  searchVehiculosByPlaca: async (placa) => {
    try {
      const response = await api.get("/vehiculos/search", {
        params: { placa }
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error searching vehiculos by placa ${placa}:`, error);
      throw error;
    }
  },

  searchVehiculoForSale: async (placa) => {
    try {
      const response = await api.get(`/vehiculos/search-for-sale/${placa}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error searching vehiculo for sale by placa ${placa}:`, error);
      throw error;
    }
  }
};