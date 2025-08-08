import api from "./axiosConfig";

export const menuService = {
  getMyMenus: async () => {
    try {
      console.log("📡 MenuService: Making request to /menus/my-menus");
      console.log("📡 MenuService: Current token:", localStorage.getItem("token"));
      
      const response = await api.get("/menus/my-menus");
      
      console.log("📡 MenuService: Response received:", response);
      console.log("📡 MenuService: Response data:", response.data);
      console.log("📡 MenuService: Response data.data:", response.data.data);
      
      return response.data.data;
    } catch (error) {
      console.error("❌ MenuService: Error fetching my menus:", error);
      console.error("❌ MenuService: Error response:", error.response?.data);
      console.error("❌ MenuService: Error status:", error.response?.status);
      throw error;
    }
  },

  getMenuByRole: async (rolId) => {
    try {
      const response = await api.get(`/menu/rol/${rolId}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching menu by role:", error);
      throw error;
    }
  },

  getAllMenus: async () => {
    try {
      const response = await api.get("/menu");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching all menus:", error);
      throw error;
    }
  }
};