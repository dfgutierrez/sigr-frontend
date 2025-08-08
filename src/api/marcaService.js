import apiClient from './axiosConfig';

// NOTA: Las marcas están relacionadas con vehículos, no con productos
// Se obtienen desde el endpoint de vehículos
export const marcaService = {
  // Obtener todas las marcas desde vehículos
  getAll: async () => {
    try {
      console.log('🚗 MarcaService: Fetching vehiculos from API...');
      const response = await apiClient.get('/vehiculos');
      console.log('🚗 MarcaService: Vehiculos response:', response);
      
      // Extraer marcas únicas de los vehículos
      const marcas = [];
      const marcasMap = new Map();
      
      // Verificar diferentes estructuras de respuesta
      let vehiculosData = [];
      if (Array.isArray(response.data)) {
        vehiculosData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        vehiculosData = response.data.data;
      } else if (response.data && Array.isArray(response.data.vehiculos)) {
        vehiculosData = response.data.vehiculos;
      }
      
      vehiculosData.forEach(vehiculo => {
        if (vehiculo.marcaNombre && !marcasMap.has(vehiculo.marcaNombre)) {
          const vehiculos_count = vehiculosData.filter(v => 
            v.marcaNombre === vehiculo.marcaNombre
          ).length;
          
          marcasMap.set(vehiculo.marcaNombre, {
            id: marcasMap.size + 1, // ID temporal
            nombre: vehiculo.marcaNombre,
            vehiculos_count: vehiculos_count
          });
        }
      });
      marcas.push(...marcasMap.values());
      
      console.log('🚗 MarcaService: Extracted marcas:', marcas);
      return { data: marcas };
    } catch (error) {
      console.error('🚗 MarcaService: Error fetching vehiculos:', error);
      // Si no hay vehículos o hay error, retornar array vacío sin relanzar el error
      return { data: [] };
    }
  },
  
  // Obtener marca por ID (simulado)
  getById: async (id) => {
    const allBrands = await marcaService.getAll();
    const marca = allBrands.data.find(m => m.id === parseInt(id));
    return { data: marca };
  },
  
  // Crear nueva marca
  create: async (marcaData) => {
    try {
      console.log('🚗 MarcaService: Creating marca:', marcaData);
      const response = await apiClient.post('/marcas', marcaData);
      console.log('🚗 MarcaService: Marca created:', response);
      return response;
    } catch (error) {
      console.error('🚗 MarcaService: Error creating marca:', error);
      throw error;
    }
  },
  
  // Actualizar marca
  update: async (id, marcaData) => {
    try {
      console.log('🚗 MarcaService: Updating marca:', id, marcaData);
      const response = await apiClient.put(`/marcas/${id}`, marcaData);
      console.log('🚗 MarcaService: Marca updated:', response);
      return response;
    } catch (error) {
      console.error('🚗 MarcaService: Error updating marca:', error);
      throw error;
    }
  },
  
  // Eliminar marca
  delete: async (id) => {
    try {
      console.log('🚗 MarcaService: Deleting marca:', id);
      const response = await apiClient.delete(`/marcas/${id}`);
      console.log('🚗 MarcaService: Marca deleted:', response);
      return response;
    } catch (error) {
      console.error('🚗 MarcaService: Error deleting marca:', error);
      throw error;
    }
  },

  // Obtener todas las marcas directamente
  getAllMarcas: async () => {
    try {
      console.log('🚗 MarcaService: Fetching marcas from API...');
      const response = await apiClient.get('/marcas');
      console.log('🚗 MarcaService: Marcas response:', response);
      return response.data;
    } catch (error) {
      console.error('🚗 MarcaService: Error fetching marcas:', error);
      throw error;
    }
  }
};