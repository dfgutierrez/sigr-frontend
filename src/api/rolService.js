import api from "./axiosConfig";

export const rolService = {
  getAllRoles: async () => {
    try {
      const response = await api.get("/roles");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw error;
    }
  },

  getRolById: async (id) => {
    try {
      const response = await api.get(`/roles/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching rol with id ${id}:`, error);
      throw error;
    }
  },

  createRol: async (rol) => {
    try {
      const response = await api.post("/roles", rol);
      return response.data;
    } catch (error) {
      console.error("Error creating rol:", error);
      throw error;
    }
  },

  updateRol: async (id, rol) => {
    try {
      const response = await api.put(`/roles/${id}`, rol);
      return response.data;
    } catch (error) {
      console.error(`Error updating rol with id ${id}:`, error);
      throw error;
    }
  },

  deleteRol: async (id) => {
    try {
      const response = await api.delete(`/roles/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting rol with id ${id}:`, error);
      throw error;
    }
  }
};