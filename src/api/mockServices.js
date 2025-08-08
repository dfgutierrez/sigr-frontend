import { mockDataService } from "./mockDataService";

// Mock del servicio de ventas
export const mockVentaService = {
  obtenerVentasPorFecha: async (fechaInicio, fechaFin) => {
    console.log(`🔧 MockVentaService: Getting sales from ${fechaInicio} to ${fechaFin}`);
    await mockDataService.generateMockDelay();
    
    // Simular ventas del período solicitado
    const baseAmount = 50000;
    const variation = Math.random() * 100000;
    
    return mockDataService.ventasDelMes.map(venta => ({
      ...venta,
      total: baseAmount + variation * Math.random()
    }));
  },

  crearVenta: async (ventaData) => {
    console.log("🔧 MockVentaService: Creating sale:", ventaData);
    await mockDataService.generateMockDelay();
    
    return {
      id: Date.now(),
      ...ventaData,
      fecha: new Date().toISOString().split('T')[0],
      estado: 'COMPLETADA'
    };
  }
};

// Mock del servicio de inventario
export const mockInventarioService = {
  getAllProductos: async () => {
    console.log("🔧 MockInventarioService: Getting all products");
    await mockDataService.generateMockDelay();
    return mockDataService.productos;
  },

  getProductosPaginated: async (page = 0, size = 10) => {
    console.log(`🔧 MockInventarioService: Getting products page ${page}, size ${size}`);
    await mockDataService.generateMockDelay();
    return mockDataService.createPaginatedResponse(mockDataService.productos, page, size);
  },

  createProducto: async (productoData) => {
    console.log("🔧 MockInventarioService: Creating product:", productoData);
    await mockDataService.generateMockDelay();
    
    const newProduct = {
      id: Date.now(),
      ...productoData,
      fechaCreacion: new Date().toISOString()
    };
    
    mockDataService.productos.push(newProduct);
    return newProduct;
  }
};

// Mock del servicio de vehículos
export const mockVehiculoService = {
  getAllVehiculosPaginated: async (page = 0, size = 10) => {
    console.log(`🔧 MockVehiculoService: Getting vehicles page ${page}, size ${size}`);
    await mockDataService.generateMockDelay();
    return mockDataService.createPaginatedResponse(mockDataService.vehiculos, page, size);
  },

  createVehiculo: async (vehiculoData) => {
    console.log("🔧 MockVehiculoService: Creating vehicle:", vehiculoData);
    await mockDataService.generateMockDelay();
    
    const newVehicle = {
      id: Date.now(),
      ...vehiculoData,
      fechaRegistro: new Date().toISOString()
    };
    
    mockDataService.vehiculos.push(newVehicle);
    return newVehicle;
  }
};

// Mock del servicio de reportes
export const mockReporteService = {
  generarReporteVentas: async (fechaInicio, fechaFin) => {
    console.log(`🔧 MockReporteService: Generating sales report from ${fechaInicio} to ${fechaFin}`);
    await mockDataService.generateMockDelay();
    
    return {
      totalVentas: 185000,
      cantidadVentas: 45,
      promedioVenta: 4111,
      ventasPorDia: mockDataService.ventasMensuales
    };
  },

  obtenerProductosMasVendidos: async () => {
    console.log("🔧 MockReporteService: Getting top products");
    await mockDataService.generateMockDelay();
    
    return mockDataService.productos
      .slice(0, 8)
      .map(producto => ({
        ...producto,
        cantidadVendida: Math.floor(Math.random() * 100) + 10
      }))
      .sort((a, b) => b.cantidadVendida - a.cantidadVendida);
  }
};

// Función para verificar si usar mock services
export const shouldUseMock = () => {
  return localStorage.getItem("usingMock") === "true";
};