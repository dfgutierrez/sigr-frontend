import apiClient from './axiosConfig';
import { mockInventarioService, shouldUseMock } from "./mockServices";

export const productoService = {
  // Obtener todos los productos
  getAll: async () => {
    if (shouldUseMock()) {
      const productos = await mockInventarioService.getAllProductos();
      return { data: productos };
    }
    return await apiClient.get('/productos');
  },

  // Alias para compatibilidad con formularios existentes
  getAllProductos: async () => {
    try {
      if (shouldUseMock()) {
        return await mockInventarioService.getAllProductos();
      }
      
      const response = await apiClient.get('/productos');
      console.log('🛒 ProductoService: Products loaded from /api/v1/productos:', response.data);
      
      // Manejar diferentes estructuras de respuesta
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('❌ ProductoService: Error fetching products:', error);
      throw error;
    }
  },
  
  // Obtener producto por ID
  getById: async (id) => {
    return await apiClient.get(`/productos/${id}`);
  },
  
  // Crear nuevo producto
  create: async (productoData) => {
    return await apiClient.post('/productos', productoData);
  },
  
  // Actualizar producto
  update: async (id, productoData) => {
    return await apiClient.put(`/productos/${id}`, productoData);
  },
  
  // Eliminar producto
  delete: async (id) => {
    return await apiClient.delete(`/productos/${id}`);
  },
  
  // Buscar productos por código de barra
  getByCodigoBarra: async (codigoBarra) => {
    return await apiClient.get(`/productos/codigo/${codigoBarra}`);
  },
  
  // Obtener productos por categoría
  getByCategoria: async (categoriaId) => {
    return await apiClient.get(`/productos/categoria/${categoriaId}`);
  },
  
  // Buscar productos
  search: async (query) => {
    return await apiClient.get(`/productos/search`, {
      params: { q: query }
    });
  },

  // Obtener productos por sede con stock
  getBySedeWithStock: async (sedeId, soloConStock = true) => {
    try {
      console.log(`🏢 ProductoService: Fetching products for sede ${sedeId} with stock filter: ${soloConStock}`);
      const response = await apiClient.get(`/productos/sede/${sedeId}/con-stock`, {
        params: { soloConStock }
      });
      
      console.log('✅ ProductoService: Products with stock loaded:', {
        sedeId,
        soloConStock,
        count: Array.isArray(response.data?.data) ? response.data.data.length : 0,
        response: response.data
      });
      
      // Manejar diferentes estructuras de respuesta
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error(`❌ ProductoService: Error fetching products for sede ${sedeId}:`, error);
      throw error;
    }
  }
};