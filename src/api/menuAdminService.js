import api from "./axiosConfig";

export const menuAdminService = {
  // Obtener todos los menús - AHORA CON ENDPOINTS COMPLETOS
  getAllMenus: async () => {
    try {
      console.log("📡 MenuAdminService: Fetching all menus");
      const response = await api.get("/menus");
      console.log("📡 MenuAdminService: All menus response:", response.data);
      return response.data.data;
    } catch (error) {
      console.error("❌ MenuAdminService: Error fetching all menus:", error);
      // Fallback a my-menus si falla /menus
      try {
        console.log("⚠️ MenuAdminService: Fallback to my-menus");
        const response = await api.get("/menus/my-menus");
        return response.data.data;
      } catch (fallbackError) {
        console.error("❌ MenuAdminService: Both endpoints failed:", fallbackError);
        throw error;
      }
    }
  },

  // Obtener menús paginados
  getMenusPaginated: async (page = 0, size = 10, sort = ["orden,asc"]) => {
    try {
      console.log("📡 MenuAdminService: Fetching paginated menus");
      const response = await api.get("/menus/paginated", {
        params: { page, size, sort }
      });
      console.log("📡 MenuAdminService: Paginated menus response:", response.data);
      return response.data.data;
    } catch (error) {
      console.error("❌ MenuAdminService: Error fetching paginated menus:", error);
      throw error;
    }
  },

  // Obtener todos los roles disponibles - AHORA COMPLETO
  getAllRoles: async () => {
    try {
      console.log("📡 MenuAdminService: Fetching all roles");
      const response = await api.get("/roles");
      console.log("📡 MenuAdminService: All roles response:", response.data);
      return response.data.data;
    } catch (error) {
      console.error("❌ MenuAdminService: Error fetching all roles:", error);
      throw error;
    }
  },

  // Obtener todas las categorías - AHORA COMPLETO
  getAllCategorias: async () => {
    try {
      console.log("📡 MenuAdminService: Fetching all categories");
      const response = await api.get("/menus/categorias");
      console.log("📡 MenuAdminService: All categories response:", response.data);
      return response.data.data;
    } catch (error) {
      console.error("❌ MenuAdminService: Error fetching all categories:", error);
      throw error;
    }
  },

  // Buscar menús por nombre
  searchMenus: async (nombre) => {
    try {
      console.log("📡 MenuAdminService: Searching menus by name:", nombre);
      const response = await api.get("/menus/search", {
        params: { nombre }
      });
      console.log("📡 MenuAdminService: Search menus response:", response.data);
      return response.data.data;
    } catch (error) {
      console.error("❌ MenuAdminService: Error searching menus:", error);
      throw error;
    }
  },

  // Obtener menús por categoría
  getMenusByCategoria: async (categoria) => {
    try {
      console.log("📡 MenuAdminService: Fetching menus by category:", categoria);
      const response = await api.get(`/menus/categoria/${encodeURIComponent(categoria)}`);
      console.log("📡 MenuAdminService: Menus by category response:", response.data);
      return response.data.data;
    } catch (error) {
      console.error("❌ MenuAdminService: Error fetching menus by category:", error);
      throw error;
    }
  },

  // Crear nuevo menú - CON GESTIÓN DE ROLES
  createMenu: async (menuData) => {
    try {
      console.log("📡 MenuAdminService: Creating menu:", menuData);
      const payload = {
        nombre: menuData.nombre,
        ruta: menuData.ruta,
        icono: menuData.icono,
        categoria: menuData.categoria,
        orden: menuData.orden
      };
      
      // Agregar roleIds si están presentes
      if (menuData.roleIds && menuData.roleIds.length > 0) {
        payload.roleIds = menuData.roleIds;
      }
      
      const response = await api.post("/menus", payload);
      console.log("📡 MenuAdminService: Menu created:", response.data);
      return response.data.data;
    } catch (error) {
      console.error("❌ MenuAdminService: Error creating menu:", error);
      
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      const status = error.response?.status;
      
      if (status === 403) {
        throw new Error("No tienes permisos para crear menús. Contacta al administrador.");
      } else if (status === 409) {
        throw new Error("Ya existe un menú con ese nombre o ruta.");
      } else if (status === 400) {
        throw new Error(`Datos inválidos: ${errorMessage}`);
      } else {
        throw new Error(`Error al crear menú: ${errorMessage}`);
      }
    }
  },

  // Obtener menú por ID
  getMenuById: async (menuId) => {
    try {
      console.log("📡 MenuAdminService: Fetching menu by ID:", menuId);
      const response = await api.get(`/menus/${menuId}`);
      console.log("📡 MenuAdminService: Menu by ID response:", response.data);
      return response.data.data;
    } catch (error) {
      console.error("❌ MenuAdminService: Error fetching menu by ID:", error);
      throw error;
    }
  },

  // Actualizar menú existente - CON GESTIÓN DE ROLES
  updateMenu: async (menuId, menuData) => {
    try {
      console.log("📡 MenuAdminService: Updating menu:", menuId, menuData);
      const payload = {
        nombre: menuData.nombre,
        ruta: menuData.ruta,
        icono: menuData.icono,
        categoria: menuData.categoria,
        orden: menuData.orden
      };
      
      // Agregar roleIds si están presentes
      if (menuData.roleIds !== undefined) {
        payload.roleIds = menuData.roleIds;
      }
      
      const response = await api.put(`/menus/${menuId}`, payload);
      console.log("📡 MenuAdminService: Menu updated:", response.data);
      return response.data.data;
    } catch (error) {
      console.error("❌ MenuAdminService: Error updating menu:", error);
      
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      const status = error.response?.status;
      
      if (status === 403) {
        throw new Error("No tienes permisos para actualizar menús.");
      } else if (status === 404) {
        throw new Error("El menú no existe.");
      } else if (status === 400) {
        throw new Error(`Datos inválidos: ${errorMessage}`);
      } else {
        throw new Error(`Error al actualizar menú: ${errorMessage}`);
      }
    }
  },

  // Eliminar menú
  deleteMenu: async (menuId) => {
    try {
      console.log("📡 MenuAdminService: Deleting menu:", menuId);
      const response = await api.delete(`/menus/${menuId}`);
      console.log("📡 MenuAdminService: Menu deleted:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ MenuAdminService: Error deleting menu:", error);
      throw error;
    }
  },

  // Verificar si existe un menú
  checkMenuExists: async (nombre) => {
    try {
      console.log("📡 MenuAdminService: Checking if menu exists:", nombre);
      const response = await api.get("/menus/exists", {
        params: { nombre }
      });
      console.log("📡 MenuAdminService: Menu exists response:", response.data);
      return response.data.data;
    } catch (error) {
      console.error("❌ MenuAdminService: Error checking menu exists:", error);
      throw error;
    }
  },

  // Obtener estadísticas de menús - MEJORADO
  getMenuStats: async () => {
    try {
      console.log("📡 MenuAdminService: Calculating menu statistics");
      const [menus, roles, categories] = await Promise.all([
        menuAdminService.getAllMenus(),
        menuAdminService.getAllRoles(),
        menuAdminService.getAllCategorias()
      ]);

      const stats = {
        totalMenus: menus?.length || 0,
        totalRoles: roles?.length || 0,
        totalCategories: categories?.length || 0,
        menusByCategory: {},
        menusWithRoles: 0,
        menusWithoutRoles: 0
      };

      // Calcular estadísticas detalladas
      if (menus) {
        menus.forEach(menu => {
          const categoria = menu.categoria || 'Sin categoría';
          stats.menusByCategory[categoria] = (stats.menusByCategory[categoria] || 0) + 1;
          
          // Contar menús con y sin roles
          if (menu.roleIds && menu.roleIds.length > 0) {
            stats.menusWithRoles++;
          } else {
            stats.menusWithoutRoles++;
          }
        });
      }

      console.log("📡 MenuAdminService: Menu stats calculated:", stats);
      return stats;
    } catch (error) {
      console.error("❌ MenuAdminService: Error calculating menu stats:", error);
      throw error;
    }
  },

  // Validar disponibilidad de nombre de menú
  validateMenuName: async (nombre, excludeId = null) => {
    try {
      console.log("📡 MenuAdminService: Validating menu name:", nombre);
      const response = await api.get("/menus/exists", {
        params: { nombre }
      });
      
      const exists = response.data.data;
      
      // Si existe pero es el mismo menú que estamos editando, está bien
      if (exists && excludeId) {
        const existingMenu = await menuAdminService.searchMenus(nombre);
        if (existingMenu.length === 1 && existingMenu[0].id === excludeId) {
          return false; // No es conflicto
        }
      }
      
      return exists;
    } catch (error) {
      console.error("❌ MenuAdminService: Error validating menu name:", error);
      return false; // En caso de error, asumir que no existe
    }
  }
};