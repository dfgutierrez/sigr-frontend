import api from "./axiosConfig";

export const dashboardService = {
  // Obtener datos del dashboard por sede
  getDashboardBySede: async (sedeId) => {
    try {
      console.log(`📊 Dashboard: Solicitando datos para sede ${sedeId}`);
      const response = await api.get(`/dashboard/sede/${sedeId}`);
      console.log(`📊 Dashboard: Datos recibidos para sede ${sedeId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Dashboard: Error obteniendo datos para sede ${sedeId}:`, error);
      throw error;
    }
  }
};