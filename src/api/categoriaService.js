import apiClient from './axiosConfig';

export const categoriaService = {
  // Obtener todas las categorías
  getAll: async () => {
    return await apiClient.get('/categorias');
  },
  
  // Obtener categoría por ID
  getById: async (id) => {
    return await apiClient.get(`/categorias/${id}`);
  },
  
  // Crear nueva categoría
  create: async (categoriaData) => {
    return await apiClient.post('/categorias', categoriaData);
  },
  
  // Actualizar categoría
  update: async (id, categoriaData) => {
    return await apiClient.put(`/categorias/${id}`, categoriaData);
  },
  
  // Eliminar categoría
  delete: async (id) => {
    return await apiClient.delete(`/categorias/${id}`);
  },
  
  // Obtener productos de una categoría
  getProductos: async (id) => {
    return await apiClient.get(`/categorias/${id}/productos`);
  }
};