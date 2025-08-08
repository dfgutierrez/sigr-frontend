// Mock de datos para desarrollo sin backend
export const mockDataService = {
  // Mock de productos
  productos: [
    { id: 1, nombre: "Laptop Dell Inspiron", stock: 15, precio: 25000, categoria: "Electrónicos" },
    { id: 2, nombre: "Mouse Inalámbrico", stock: 50, precio: 850, categoria: "Accesorios" },
    { id: 3, nombre: "Teclado Mecánico", stock: 8, precio: 2200, categoria: "Accesorios" },
    { id: 4, nombre: "Monitor 24 pulgadas", stock: 12, precio: 8500, categoria: "Electrónicos" },
    { id: 5, nombre: "Webcam HD", stock: 0, precio: 1500, categoria: "Accesorios" },
    { id: 6, nombre: "Auriculares Bluetooth", stock: 25, precio: 3200, categoria: "Audio" },
    { id: 7, nombre: "Tablet Samsung", stock: 7, precio: 15000, categoria: "Electrónicos" },
    { id: 8, nombre: "Cargador USB-C", stock: 30, precio: 650, categoria: "Accesorios" },
    { id: 9, nombre: "Disco Duro Externo 1TB", stock: 18, precio: 4500, categoria: "Almacenamiento" },
    { id: 10, nombre: "Impresora Multifuncional", stock: 3, precio: 12000, categoria: "Oficina" }
  ],

  // Mock de vehículos
  vehiculos: [
    { id: 1, placa: "ABC-123", marca: "Toyota", modelo: "Hiace", año: 2020, estado: "ACTIVO" },
    { id: 2, placa: "DEF-456", marca: "Chevrolet", modelo: "N300", año: 2019, estado: "ACTIVO" },
    { id: 3, placa: "GHI-789", marca: "Nissan", modelo: "NV200", año: 2021, estado: "MANTENIMIENTO" },
    { id: 4, placa: "JKL-012", marca: "Ford", modelo: "Transit", año: 2018, estado: "ACTIVO" },
    { id: 5, placa: "MNO-345", marca: "Hyundai", modelo: "H100", año: 2020, estado: "INACTIVO" }
  ],

  // Mock de ventas por mes (últimos 6 meses)
  ventasMensuales: [
    { mes: "Feb", año: 2024, ventas: 145000 },
    { mes: "Mar", año: 2024, ventas: 167000 },
    { mes: "Abr", año: 2024, ventas: 198000 },
    { mes: "May", año: 2024, ventas: 185000 },
    { mes: "Jun", año: 2024, ventas: 220000 },
    { mes: "Jul", año: 2024, ventas: 205000 }
  ],

  // Mock de ventas individuales
  ventasDelMes: [
    { id: 1, fecha: "2024-08-01", total: 15000, productos: ["Laptop Dell", "Mouse"] },
    { id: 2, fecha: "2024-08-02", total: 8500, productos: ["Monitor 24 pulgadas"] },
    { id: 3, fecha: "2024-08-03", total: 4200, productos: ["Teclado", "Auriculares"] },
    { id: 4, fecha: "2024-08-04", total: 12000, productos: ["Tablet Samsung"] },
    { id: 5, fecha: "2024-08-05", total: 6500, productos: ["Disco Duro", "Cargador"] }
  ],

  // Generar datos mock con delays realistas
  generateMockDelay: (min = 300, max = 800) => {
    return new Promise(resolve => {
      const delay = Math.random() * (max - min) + min;
      setTimeout(resolve, delay);
    });
  },

  // Simular respuesta paginada
  createPaginatedResponse: (data, page = 0, size = 10) => {
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const content = data.slice(startIndex, endIndex);
    
    return {
      content: content,
      totalElements: data.length,
      totalPages: Math.ceil(data.length / size),
      size: size,
      number: page,
      first: page === 0,
      last: page >= Math.ceil(data.length / size) - 1
    };
  }
};