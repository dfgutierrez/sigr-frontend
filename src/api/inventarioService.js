import apiClient from './axiosConfig';
import { mockInventarioService, shouldUseMock } from "./mockServices";

export const inventarioService = {
  // Obtener todos los inventarios
  getAll: async () => {
    if (shouldUseMock()) {
      return await mockInventarioService.getAll();
    }
    return apiClient.get('/inventarios');
  },
  
  // Obtener inventario por ID
  getById: (id) => apiClient.get(`/inventarios/${id}`),
  
  // Crear nuevo inventario
  create: (inventario) => apiClient.post('/inventarios', inventario),
  
  // Actualizar inventario
  update: (id, inventario) => apiClient.put(`/inventarios/${id}`, inventario),
  
  // Eliminar inventario
  delete: (id) => apiClient.delete(`/inventarios/${id}`),
  
  // Obtener inventarios por sede
  getBySede: (sedeId) => apiClient.get(`/inventarios/sede/${sedeId}`),
  
  // Obtener inventarios por producto
  getByProducto: (productoId) => apiClient.get(`/inventarios/producto/${productoId}`),
  
  // Obtener inventario específico por producto y sede
  getByProductoSede: (productoId, sedeId) => 
    apiClient.get(`/inventarios/producto/${productoId}/sede/${sedeId}`),
  
  // Obtener inventarios con stock bajo
  getLowStock: (cantidad = 5) => 
    apiClient.get(`/inventarios/low-stock?cantidad=${cantidad}`),
  
  // Obtener inventarios con stock bajo por sede
  getLowStockBySede: (sedeId, cantidad = 5) => 
    apiClient.get(`/inventarios/sede/${sedeId}/low-stock?cantidad=${cantidad}`),
  
  // Ajustar stock
  adjustStock: (id, ajuste, motivo = '') => 
    apiClient.put(`/inventarios/${id}/adjust-stock?ajuste=${ajuste}&motivo=${encodeURIComponent(motivo)}`), 
  
  // Descontar stock (nuevo endpoint específico para ventas)
  deductStock: (id, cantidad, sedeId, motivo = 'Venta', observaciones = '') => 
    apiClient.put(`/inventarios/${id}/deduct-stock`, {
      cantidad,
      sedeId,
      motivo,
      observaciones
    }),
  
  // Verificar si existe inventario
  exists: (productoId, sedeId) => 
    apiClient.get(`/inventarios/exists?productoId=${productoId}&sedeId=${sedeId}`),
  
  // Obtener inventarios paginados
  getPaginated: (page = 0, size = 10, sort = []) => 
    apiClient.get('/inventarios/paginated', {
      params: { page, size, sort }
    })
};