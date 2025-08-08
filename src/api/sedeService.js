import api from "./axiosConfig";

export const sedeService = {
  getAllSedes: async () => {
    try {
      const response = await api.get("/sedes");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching sedes:", error);
      throw error;
    }
  },

  // Alias para compatibilidad con componentes de inventario
  getAll: async () => {
    try {
      const response = await api.get("/sedes");
      return response.data;
    } catch (error) {
      console.error("Error fetching sedes:", error);
      throw error;
    }
  },

  getSedeById: async (id) => {
    try {
      const response = await api.get(`/sedes/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching sede with id ${id}:`, error);
      throw error;
    }
  },

  createSede: async (sede) => {
    try {
      const response = await api.post("/sedes", sede);
      return response.data;
    } catch (error) {
      console.error("Error creating sede:", error);
      throw error;
    }
  },

  updateSede: async (id, sede) => {
    try {
      const response = await api.put(`/sedes/${id}`, sede);
      return response.data;
    } catch (error) {
      console.error(`Error updating sede with id ${id}:`, error);
      throw error;
    }
  },

  deleteSede: async (id) => {
    try {
      const response = await api.delete(`/sedes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting sede with id ${id}:`, error);
      throw error;
    }
  }
};