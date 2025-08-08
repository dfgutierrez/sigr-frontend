import React, { useState, useEffect } from "react";
import { ventaService } from "api/ventaService.js";
import { productoService } from "api/productoService.js";
import { sedeService } from "api/sedeService.js";
import { inventarioService } from "api/inventarioService.js";
import { vehiculoService } from "api/vehiculoService.js";
import VehiculoForm from "components/Forms/VehiculoForm.js";
import { useToast } from "hooks/useToast.js";
import { useAuth } from "contexts/AuthContext.js";

export default function VentaForm({ onSave, onCancel }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    sedeId: "",
    vehiculoId: "",
    detalles: []
  });
  
  const [productos, setProductos] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [searchProduct, setSearchProduct] = useState("");
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showVehiculoForm, setShowVehiculoForm] = useState(false);
  const [placaSearch, setPlacaSearch] = useState("");
  const [vehiculoEncontrado, setVehiculoEncontrado] = useState(null);
  const [searchingVehiculo, setSearchingVehiculo] = useState(false);
  const [vehiculoSuggestions, setVehiculoSuggestions] = useState([]);
  const [showVehiculoSuggestions, setShowVehiculoSuggestions] = useState(false);
  const [vehiculoSearchTimeout, setVehiculoSearchTimeout] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchSedes();
    fetchProductos();
  }, []);

  // Effect adicional para preseleccionar sede si el usuario se carga después
  useEffect(() => {
    if (user && sedes.length > 0 && !formData.sedeId) {
      let defaultSedeId = "";
      
      if (user.sedes && Array.isArray(user.sedes) && user.sedes.length > 0) {
        defaultSedeId = user.sedes[0].id.toString();
        console.log('🏢 VentaForm: (Late load) Setting default sede from user.sedes:', user.sedes[0].nombre);
      } else if (user.sedeId) {
        defaultSedeId = user.sedeId.toString();
        console.log('🏢 VentaForm: (Late load) Setting default sede from user.sedeId:', user.sedeId);
      }
      
      if (defaultSedeId && sedes.find(sede => sede.id.toString() === defaultSedeId)) {
        setFormData(prev => ({
          ...prev,
          sedeId: defaultSedeId
        }));
        console.log('✅ VentaForm: (Late load) Default sede set to:', defaultSedeId);
      }
    }
  }, [user, sedes]);

  useEffect(() => {
    if (formData.sedeId) {
      // Reset vehicle data when sede changes
      setPlacaSearch("");
      setVehiculoEncontrado(null);
      setVehiculoSuggestions([]);
      setShowVehiculoSuggestions(false);
      setFormData(prev => ({ ...prev, vehiculoId: "" }));
      
      // Limpiar timeout si existe
      if (vehiculoSearchTimeout) {
        clearTimeout(vehiculoSearchTimeout);
        setVehiculoSearchTimeout(null);
      }
      
      // Fetch products for the selected sede
      fetchProductos();
    }
  }, [formData.sedeId]);

  // Cleanup timeout al desmontar el componente
  useEffect(() => {
    return () => {
      if (vehiculoSearchTimeout) {
        clearTimeout(vehiculoSearchTimeout);
      }
    };
  }, [vehiculoSearchTimeout]);

  const fetchSedes = async () => {
    try {
      const data = await sedeService.getAllSedes();
      setSedes(data);
      
      // Preseleccionar la sede del usuario logueado
      if (user && data && Array.isArray(data)) {
        let defaultSedeId = "";
        
        console.log('👤 VentaForm: User data:', user);
        console.log('🏢 VentaForm: Available sedes:', data);
        
        // Intentar obtener la sede del usuario (misma lógica que otros componentes)
        if (user.sedes && Array.isArray(user.sedes) && user.sedes.length > 0) {
          defaultSedeId = user.sedes[0].id.toString();
          console.log('🏢 VentaForm: Setting default sede from user.sedes:', user.sedes[0].nombre);
        } else if (user.sedeId) {
          defaultSedeId = user.sedeId.toString();
          console.log('🏢 VentaForm: Setting default sede from user.sedeId:', user.sedeId);
        }
        
        // Verificar que la sede existe en la lista de sedes disponibles
        if (defaultSedeId && data.find(sede => sede.id.toString() === defaultSedeId)) {
          setFormData(prev => ({
            ...prev,
            sedeId: defaultSedeId
          }));
          console.log('✅ VentaForm: Default sede set to:', defaultSedeId);
        }
      }
    } catch (error) {
      console.error("Error fetching sedes:", error);
    }
  };

  const fetchProductos = async () => {
    // No cargar productos si no hay sede seleccionada
    if (!formData.sedeId) {
      console.log('⚠️ VentaForm: No sede selected, skipping products fetch');
      setProductos([]);
      setFilteredProducts([]);
      return;
    }

    try {
      console.log(`🔄 VentaForm: Fetching products with stock for sede ${formData.sedeId} from /api/v1/productos/sede/${formData.sedeId}/con-stock...`);
      const data = await productoService.getBySedeWithStock(formData.sedeId, true);
      
      console.log('✅ VentaForm: Products with stock loaded successfully:', {
        sedeId: formData.sedeId,
        count: Array.isArray(data) ? data.length : 0,
        sample: Array.isArray(data) && data.length > 0 ? data[0] : null
      });
      
      // Asegurar que data sea un array
      const productosArray = Array.isArray(data) ? data : [];
      setProductos(productosArray);
      setFilteredProducts(productosArray); // Precargar todos los productos
      
      if (productosArray.length === 0) {
        showToast(`No se encontraron productos con stock disponible en la sede seleccionada`, "warning");
      } else {
        console.log(`📦 VentaForm: ${productosArray.length} productos con stock cargados para la sede ${formData.sedeId}`);
      }
    } catch (error) {
      console.error("❌ VentaForm: Error fetching productos with stock:", error);
      showToast("Error al cargar los productos con stock", "error");
      setProductos([]);
      setFilteredProducts([]);
    }
  };

  // Búsqueda en tiempo real de vehículos usando search-for-sale
  const searchVehiculosEnTiempoReal = async (searchPlaca) => {
    if (!searchPlaca || searchPlaca.length < 2) {
      setVehiculoSuggestions([]);
      setShowVehiculoSuggestions(false);
      return;
    }

    if (!formData.sedeId) {
      return;
    }

    setSearchingVehiculo(true);

    try {
      // Usar el endpoint específico de search-for-sale
      const result = await vehiculoService.searchVehiculoForSale(searchPlaca);
      
      if (result.encontrado && result.vehiculo) {
        // Verificar que el vehículo pertenezca a la sede seleccionada
        if (result.vehiculo.sedeId === parseInt(formData.sedeId)) {
          setVehiculoSuggestions([result.vehiculo]); // Solo un vehículo como sugerencia
          setShowVehiculoSuggestions(true);
        } else {
          setVehiculoSuggestions([]);
          setShowVehiculoSuggestions(false);
        }
      } else {
        setVehiculoSuggestions([]);
        setShowVehiculoSuggestions(false);
      }
    } catch (error) {
      console.error("Error searching vehicle for sale:", error);
      setVehiculoSuggestions([]);
      setShowVehiculoSuggestions(false);
    } finally {
      setSearchingVehiculo(false);
    }
  };

  // Seleccionar un vehículo de las sugerencias
  const handleSelectVehiculo = (vehiculo) => {
    setPlacaSearch(vehiculo.placa);
    setShowVehiculoSuggestions(false);
    setVehiculoSuggestions([]);
    
    // El vehículo ya viene validado del endpoint search-for-sale
    setVehiculoEncontrado(vehiculo);
    setFormData(prev => ({ ...prev, vehiculoId: vehiculo.id.toString() }));
    showToast("Vehículo seleccionado para venta", "success");
  };

  const buscarVehiculoPorPlaca = async () => {
    if (!placaSearch.trim()) {
      showToast("Ingrese una placa para buscar", "warning");
      return;
    }

    if (!formData.sedeId) {
      showToast("Primero seleccione una sede", "warning");
      return;
    }

    setSearchingVehiculo(true);
    setVehiculoEncontrado(null);
    setShowVehiculoSuggestions(false);
    
    try {
      // Usar el endpoint específico para ventas
      const result = await vehiculoService.searchVehiculoForSale(placaSearch.trim());
      
      if (result.encontrado && result.vehiculo) {
        // Verificar que pertenezca a la sede seleccionada
        if (result.vehiculo.sedeId === parseInt(formData.sedeId)) {
          setVehiculoEncontrado(result.vehiculo);
          setFormData(prev => ({ ...prev, vehiculoId: result.vehiculo.id.toString() }));
          showToast("Vehículo encontrado", "success");
        } else {
          showToast("El vehículo no pertenece a la sede seleccionada", "warning");
        }
      } else {
        showToast(result.mensaje || "No se encontró ningún vehículo con esa placa", "warning");
      }
    } catch (error) {
      console.error("Error searching vehicle:", error);
      showToast("Error al buscar el vehículo", "error");
    } finally {
      setSearchingVehiculo(false);
    }
  };

  const handleSedeChange = (e) => {
    setFormData(prev => ({
      ...prev,
      sedeId: e.target.value,
      vehiculoId: "",
      detalles: []
    }));
  };

  const handlePlacaChange = (e) => {
    const value = e.target.value.toUpperCase();
    setPlacaSearch(value);
    
    if (vehiculoEncontrado) {
      setVehiculoEncontrado(null);
      setFormData(prev => ({ ...prev, vehiculoId: "" }));
    }

    // Limpiar timeout anterior
    if (vehiculoSearchTimeout) {
      clearTimeout(vehiculoSearchTimeout);
    }

    // Configurar nuevo timeout para búsqueda en tiempo real
    const newTimeout = setTimeout(() => {
      searchVehiculosEnTiempoReal(value);
    }, 300); // Esperar 300ms después de que deje de escribir

    setVehiculoSearchTimeout(newTimeout);
  };

  const handlePlacaKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setShowVehiculoSuggestions(false);
      buscarVehiculoPorPlaca();
    } else if (e.key === 'Escape') {
      setShowVehiculoSuggestions(false);
    }
  };

  // Función para cerrar sugerencias cuando se hace click fuera
  const handlePlacaFocus = () => {
    if (placaSearch.length >= 2 && vehiculoSuggestions.length > 0) {
      setShowVehiculoSuggestions(true);
    }
  };

  const handleCreateVehiculo = () => {
    setShowVehiculoForm(true);
  };

  const handleVehiculoFormSave = () => {
    setShowVehiculoForm(false);
    // Clear the search after creating a new vehicle
    setPlacaSearch("");
    setVehiculoEncontrado(null);
    setFormData(prev => ({ ...prev, vehiculoId: "" }));
    showToast("Vehículo creado exitosamente. Puede buscarlo ahora por su placa.", "success");
  };

  const handleVehiculoFormCancel = () => {
    setShowVehiculoForm(false);
  };

  // Filtrar productos en tiempo real
  const handleProductSearch = (value) => {
    setSearchProduct(value);
    
    if (value.length === 0) {
      setFilteredProducts(productos); // Mostrar todos si no hay búsqueda
      setShowProductDropdown(false);
    } else {
      const filtered = productos.filter(p => 
        p.nombre.toLowerCase().includes(value.toLowerCase()) ||
        p.codigoBarra.toLowerCase().includes(value.toLowerCase()) ||
        (p.categoria?.nombre && p.categoria.nombre.toLowerCase().includes(value.toLowerCase()))
      );
      setFilteredProducts(filtered.slice(0, 15)); // Limitar a 15 resultados
      setShowProductDropdown(true);
    }
  };

  // Seleccionar producto del dropdown
  const handleSelectProduct = (producto) => {
    setSelectedProduct(producto);
    setSearchProduct(`${producto.nombre} - ${producto.codigoBarra}`);
    setShowProductDropdown(false);
    
    console.log('🎯 Producto seleccionado:', {
      nombre: producto.nombre,
      precioVenta: producto.precioVenta,
      precio: producto.precio,
      codigoBarra: producto.codigoBarra
    });
  };

  // Agregar producto seleccionado a la venta
  const handleAddSelectedProduct = async () => {
    console.log('🔄 handleAddSelectedProduct called');
    console.log('📦 Selected product:', selectedProduct);
    console.log('🏢 Form sedeId:', formData.sedeId);
    
    if (!selectedProduct) {
      showToast("Seleccione un producto primero", "warning");
      return;
    }
    
    console.log('➡️ Calling addProductToSale...');
    await addProductToSale(selectedProduct);
    console.log('✅ addProductToSale completed');
    
    // Limpiar selección
    setSelectedProduct(null);
    setSearchProduct("");
    setFilteredProducts(productos);
  };

  // Mostrar/ocultar dropdown
  const handleProductInputFocus = () => {
    if (searchProduct.length === 0) {
      // Si no hay búsqueda, mostrar los primeros 10 productos
      setFilteredProducts(productos.slice(0, 10));
    }
    if (filteredProducts.length > 0) {
      setShowProductDropdown(true);
    }
  };

  const handleProductInputBlur = () => {
    // Delay para permitir el click en el dropdown
    setTimeout(() => {
      setShowProductDropdown(false);
    }, 200);
  };

  const addProductToSale = async (producto) => {
    console.log('🚀 addProductToSale started');
    console.log('📦 Product to add:', producto);
    console.log('🔍 Product details:', {
      id: producto.id,
      nombre: producto.nombre,
      precioVenta: producto.precioVenta,
      precio: producto.precio,
      codigoBarra: producto.codigoBarra
    });
    console.log('🏢 Current sede ID:', formData.sedeId);
    console.log('🛒 Current detalles:', formData.detalles);
    
    if (!formData.sedeId) {
      console.log('❌ No sede selected');
      showToast("Primero seleccione una sede", "warning");
      return;
    }

    // Get the correct product ID - handle both structures
    const productoId = producto.productoId || producto.id;
    if (!productoId) {
      console.error('❌ Product missing ID:', producto);
      showToast("Error: Producto sin ID válido", "error");
      return;
    }
    
    console.log(`🔍 Using producto ID: ${productoId} for inventory check`);

    try {
      // Check inventory for this product in the selected sede
      const response = await inventarioService.getByProductoSede(
        productoId, 
        formData.sedeId
      );
      
      console.log('🔍 Inventario response:', response);
      
      // Manejar diferentes estructuras de respuesta
      const inventario = response.data?.data || response.data || response;
      
      console.log('📦 Inventario encontrado:', inventario);
      console.log('📊 Validación de stock:', {
        existe: !!inventario,
        cantidad: inventario?.cantidad,
        esValido: inventario && inventario.cantidad > 0
      });

      if (!inventario || inventario.cantidad <= 0) {
        console.log('❌ Stock insuficiente:', {
          inventario: inventario,
          cantidad: inventario?.cantidad,
          productoNombre: producto.nombre
        });
        showToast("No hay stock disponible para este producto en la sede seleccionada", "warning");
        return;
      }

      // Check if product is already in the sale
      const existingIndex = formData.detalles.findIndex(d => d.productoId === productoId);
      
      if (existingIndex >= 0) {
        // Update quantity if not exceeding stock
        const currentQty = formData.detalles[existingIndex].cantidad;
        if (currentQty >= inventario.cantidad) {
          showToast("No hay más stock disponible", "warning");
          return;
        }
        
        const newDetalles = [...formData.detalles];
        newDetalles[existingIndex].cantidad += 1;
        newDetalles[existingIndex].subtotal = newDetalles[existingIndex].cantidad * newDetalles[existingIndex].precioUnitario;
        
        setFormData(prev => ({ ...prev, detalles: newDetalles }));
        showToast(`Cantidad actualizada: ${newDetalles[existingIndex].cantidad}`, "success");
      } else {
        // Add new product
        const precioUnitario = producto.precioVenta || producto.precio || 0;
        console.log('💰 Precio del producto:', {
          nombre: producto.nombre,
          precioVenta: producto.precioVenta,
          precio: producto.precio,
          precioUnitarioFinal: precioUnitario
        });
        
        const newDetalle = {
          productoId: productoId,
          producto: producto,
          cantidad: 1,
          precioUnitario: precioUnitario,
          subtotal: precioUnitario,
          stockDisponible: inventario.cantidad
        };
        
        setFormData(prev => {
          const updatedDetalles = [...prev.detalles, newDetalle];
          console.log('🛒 Producto agregado, detalles actualizados:', updatedDetalles);
          return {
            ...prev,
            detalles: updatedDetalles
          };
        });
        
        showToast(`✅ Producto agregado: ${producto.nombre} - ${formatCurrency(precioUnitario)}`, "success");
      }
    } catch (error) {
      console.error("❌ Error checking inventory:", error);
      console.log('🔍 Error details:', {
        status: error.response?.status,
        message: error.message,
        response: error.response?.data,
        productoNombre: producto.nombre
      });
      
      // Si no hay servicio de inventario disponible, permitir agregar el producto sin verificar stock
      if (error.response?.status === 404 || error.message.includes('not found')) {
        console.log('⚠️ Servicio de inventario no disponible, agregando producto sin validación de stock para:', producto.nombre);
        
        // Check if product is already in the sale
        const existingIndex = formData.detalles.findIndex(d => d.productoId === productoId);
        
        if (existingIndex >= 0) {
          const newDetalles = [...formData.detalles];
          newDetalles[existingIndex].cantidad += 1;
          newDetalles[existingIndex].subtotal = newDetalles[existingIndex].cantidad * newDetalles[existingIndex].precioUnitario;
          
          setFormData(prev => ({ ...prev, detalles: newDetalles }));
          showToast(`Cantidad actualizada: ${newDetalles[existingIndex].cantidad} (sin validación de stock)`, "warning");
        } else {
          // Add new product without stock validation
          const precioUnitario = producto.precioVenta || producto.precio || 0;
          
          const newDetalle = {
            productoId: productoId,
            producto: producto,
            cantidad: 1,
            precioUnitario: precioUnitario,
            subtotal: precioUnitario,
            stockDisponible: 999 // Stock ficticio cuando no se puede validar
          };
          
          setFormData(prev => {
            const updatedDetalles = [...prev.detalles, newDetalle];
            console.log('🛒 Producto agregado (sin validación), detalles actualizados:', updatedDetalles);
            return {
              ...prev,
              detalles: updatedDetalles
            };
          });
          
          showToast(`⚠️ Producto agregado sin validación de stock: ${producto.nombre} - ${formatCurrency(precioUnitario)}`, "warning");
        }
      } else {
        showToast("Error al verificar el inventario", "error");
      }
    }
  };

  const updateProductQuantity = (index, newQuantity) => {
    const detalle = formData.detalles[index];
    
    if (newQuantity <= 0) {
      removeProduct(index);
      return;
    }
    
    if (newQuantity > detalle.stockDisponible) {
      showToast("Cantidad no puede exceder el stock disponible", "warning");
      return;
    }

    const newDetalles = [...formData.detalles];
    newDetalles[index].cantidad = newQuantity;
    newDetalles[index].subtotal = newQuantity * newDetalles[index].precioUnitario;
    
    setFormData(prev => ({ ...prev, detalles: newDetalles }));
  };

  const updateProductPrice = (index, newPrice) => {
    if (newPrice <= 0) return;
    
    const newDetalles = [...formData.detalles];
    newDetalles[index].precioUnitario = newPrice;
    newDetalles[index].subtotal = newDetalles[index].cantidad * newPrice;
    
    setFormData(prev => ({ ...prev, detalles: newDetalles }));
  };

  const removeProduct = (index) => {
    const newDetalles = formData.detalles.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, detalles: newDetalles }));
  };

  const calculateTotal = () => {
    return formData.detalles.reduce((total, detalle) => total + detalle.subtotal, 0);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.sedeId) {
      newErrors.sedeId = "La sede es requerida";
    }

    if (!formData.vehiculoId) {
      newErrors.vehiculoId = "El vehículo es requerido";
    }
    
    if (formData.detalles.length === 0) {
      newErrors.detalles = "Debe agregar al menos un producto";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const ventaData = {
        sedeId: parseInt(formData.sedeId),
        vehiculoId: parseInt(formData.vehiculoId),
        detalles: formData.detalles.map(detalle => ({
          productoId: detalle.productoId,
          cantidad: detalle.cantidad,
          precioUnitario: detalle.precioUnitario
        }))
      };

      // Paso 1: Crear la venta
      console.log('📋 Paso 1: Registrando venta...', ventaData);
      const ventaCreada = await ventaService.crearVenta(ventaData);
      console.log('✅ Venta registrada:', ventaCreada);
      
      // Paso 2: Descontar productos del inventario usando el nuevo endpoint
      console.log('📦 Paso 2: Descontando productos del inventario...');
      const inventoryErrors = [];
      
      for (const detalle of formData.detalles) {
        try {
          console.log(`📤 Descontando ${detalle.cantidad} unidades del producto ${detalle.producto.nombre}...`);
          
          // Buscar el inventario del producto en la sede
          const inventarioResponse = await inventarioService.getByProductoSede(
            detalle.productoId,
            formData.sedeId
          );
          
          const inventario = inventarioResponse.data?.data || inventarioResponse.data || inventarioResponse;
          
          if (inventario && inventario.id) {
            // Usar el nuevo endpoint deduct-stock que maneja validaciones automáticamente
            const ventaId = ventaCreada.id || ventaCreada.data?.id || 'nueva';
            const observaciones = `Venta ID: ${ventaId} - Producto: ${detalle.producto.nombre}`;
            
            await inventarioService.deductStock(
              inventario.id,
              detalle.cantidad,
              parseInt(formData.sedeId),
              'Venta',
              observaciones
            );
            
            console.log(`✅ Stock descontado exitosamente para ${detalle.producto.nombre}`);
          } else {
            console.warn(`⚠️ No se encontró inventario para el producto ${detalle.producto.nombre} en la sede`);
            inventoryErrors.push(`No se encontró inventario para ${detalle.producto.nombre}`);
          }
        } catch (inventoryError) {
          console.error(`❌ Error descontando stock para ${detalle.producto.nombre}:`, inventoryError);
          
          // Extraer mensaje de error de la respuesta de la API
          const errorMessage = inventoryError.response?.data?.message || inventoryError.message;
          inventoryErrors.push(`${detalle.producto.nombre}: ${errorMessage}`);
        }
      }
      
      // Mostrar resultado final
      if (inventoryErrors.length === 0) {
        showToast("Venta procesada exitosamente y inventario actualizado", "success");
      } else {
        showToast(
          `Venta creada, pero hubo problemas actualizando inventario: ${inventoryErrors.slice(0, 2).join(', ')}${inventoryErrors.length > 2 ? '...' : ''}`,
          "warning"
        );
      }
      
      onSave();
    } catch (error) {
      console.error("Error creating sale:", error);
      showToast(
        error.response?.data?.message || "Error al crear la venta",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  };

  if (showVehiculoForm) {
    return (
      <div className="flex flex-wrap">
        <div className="w-full px-4">
          <VehiculoForm
            onSave={handleVehiculoFormSave}
            onCancel={handleVehiculoFormCancel}
            preSelectedSedeId={formData.sedeId}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
      <div className="rounded-t bg-white mb-0 px-6 py-6">
        <div className="text-center flex justify-between">
          <h6 className="text-blueGray-700 text-xl font-bold">Nueva Venta</h6>
        </div>
      </div>
      <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
        <form onSubmit={handleSubmit}>
          <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
            Información de la Venta
          </h6>
          
          {/* Sede Selection */}
          <div className="flex flex-wrap">
            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2 flex items-center">
                  Sede *
                  {formData.sedeId && user && (
                    ((user.sedes && user.sedes.find(s => s.id.toString() === formData.sedeId)) ||
                     (user.sedeId && user.sedeId.toString() === formData.sedeId)) && (
                      <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                        <i className="fas fa-user mr-1"></i>Tu sede
                      </span>
                    )
                  )}
                </label>
                <select
                  value={formData.sedeId}
                  onChange={handleSedeChange}
                  className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                    errors.sedeId ? 'border-red-500' : ''
                  } ${
                    formData.sedeId && user && (
                      ((user.sedes && user.sedes.find(s => s.id.toString() === formData.sedeId)) ||
                       (user.sedeId && user.sedeId.toString() === formData.sedeId))
                    ) ? 'border-l-4 border-l-green-400' : ''
                  }`}
                >
                  <option value="">Seleccionar sede</option>
                  {sedes.map((sede) => (
                    <option key={sede.id} value={sede.id}>
                      {sede.nombre}
                      {user && (
                        ((user.sedes && user.sedes.find(s => s.id === sede.id)) ||
                         (user.sedeId === sede.id)) ? ' (Tu sede)' : ''
                      )}
                    </option>
                  ))}
                </select>
                {errors.sedeId && (
                  <p className="text-red-500 text-xs mt-1">{errors.sedeId}</p>
                )}
              </div>
            </div>

            {/* Vehicle Search */}
            {formData.sedeId && (
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                    Buscar Vehículo por Placa *
                  </label>
                  <div className="flex gap-2 relative">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={placaSearch}
                        onChange={handlePlacaChange}
                        onKeyDown={handlePlacaKeyPress}
                        onFocus={handlePlacaFocus}
                        placeholder="Escribe para buscar (ej: ABC123)"
                        className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                          errors.vehiculoId ? 'border-red-500' : ''
                        }`}
                        autoComplete="off"
                      />
                      
                      {/* Dropdown de sugerencias */}
                      {showVehiculoSuggestions && vehiculoSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-blueGray-200 rounded-b shadow-lg z-50 max-h-60 overflow-y-auto">
                          {vehiculoSuggestions.map((vehiculo, index) => (
                            <div
                              key={vehiculo.id || index}
                              onClick={() => handleSelectVehiculo(vehiculo)}
                              className="px-4 py-3 hover:bg-blueGray-50 cursor-pointer border-b border-blueGray-100 last:border-b-0"
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-semibold text-blueGray-800 flex items-center">
                                    {vehiculo.placa}
                                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                      Disponible para venta
                                    </span>
                                  </div>
                                  <div className="text-sm text-blueGray-600">
                                    {vehiculo.tipo && <span className="capitalize">{vehiculo.tipo}</span>}
                                    {vehiculo.marca && <span> • {vehiculo.marca.nombre}</span>}
                                    {vehiculo.modelo && <span> • {vehiculo.modelo}</span>}
                                  </div>
                                  {vehiculo.nombreConductor && (
                                    <div className="text-xs text-blueGray-500">
                                      Conductor: {vehiculo.nombreConductor}
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col items-end text-right">
                                  {vehiculo.sede && (
                                    <div className="text-xs text-blueGray-500">
                                      {vehiculo.sede.nombre}
                                    </div>
                                  )}
                                  {vehiculo.km > 0 && (
                                    <div className="text-xs text-blueGray-500">
                                      {vehiculo.km.toLocaleString()} km
                                    </div>
                                  )}
                                  <div className="text-xs text-green-600 font-semibold mt-1">
                                    <i className="fas fa-check-circle mr-1 text-green-600"></i>
                                    Click para seleccionar
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Mensaje cuando no hay sugerencias pero se está escribiendo */}
                      {placaSearch.length >= 2 && !searchingVehiculo && vehiculoSuggestions.length === 0 && !vehiculoEncontrado && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-blueGray-200 rounded-b shadow-lg z-50">
                          <div className="px-4 py-3 text-blueGray-500 text-sm">
                            No se encontró vehículo con placa "{placaSearch}" disponible para venta
                          </div>
                        </div>
                      )}
                      
                      {/* Indicador de carga */}
                      {searchingVehiculo && placaSearch.length >= 2 && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-lightBlue-500"></div>
                        </div>
                      )}
                    </div>
                    
                    <button
                      type="button"
                      onClick={buscarVehiculoPorPlaca}
                      disabled={searchingVehiculo || !placaSearch.trim()}
                      className="bg-lightBlue-500 text-white active:bg-lightBlue-600 hover:bg-lightBlue-600 text-xs font-bold uppercase px-3 py-3 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-blueGray-300"
                      title="Buscar vehículo"
                      style={{backgroundColor: searchingVehiculo || !placaSearch.trim() ? '#cbd5e0' : '#3182ce'}}
                    >
                      {searchingVehiculo ? (
                        <i className="fas fa-spinner fa-spin text-white"></i>
                      ) : (
                        <i className="fas fa-search text-white"></i>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateVehiculo}
                      className="bg-green-500 text-white active:bg-green-600 hover:bg-green-600 text-xs font-bold uppercase px-3 py-3 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
                      title="Crear nuevo vehículo"
                      style={{backgroundColor: '#38a169'}}
                    >
                      <i className="fas fa-plus text-white"></i>
                    </button>
                  </div>
                  {errors.vehiculoId && (
                    <p className="text-red-500 text-xs mt-1">{errors.vehiculoId}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Vehicle Information */}
          {vehiculoEncontrado && (
            <div className="flex flex-wrap mt-4">
              <div className="w-full px-4">
                <div className="relative w-full mb-3">
                  <div className="bg-lightBlue-50 border border-lightBlue-200 rounded p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h6 className="text-blueGray-700 text-sm font-bold uppercase">
                        <i className="fas fa-check-circle mr-2 text-lightBlue-500"></i>
                        Vehículo Encontrado
                      </h6>
                      <button
                        type="button"
                        onClick={() => {
                          setVehiculoEncontrado(null);
                          setFormData(prev => ({ ...prev, vehiculoId: "" }));
                          setPlacaSearch("");
                        }}
                        className="text-blueGray-500 hover:text-blueGray-700"
                        title="Limpiar selección"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-blueGray-600 font-bold">Placa:</div>
                        <div className="text-blueGray-700">{vehiculoEncontrado.placa}</div>
                      </div>
                      <div>
                        <div className="text-blueGray-600 font-bold">Tipo:</div>
                        <div className="text-blueGray-700 capitalize">{vehiculoEncontrado.tipo}</div>
                      </div>
                      <div>
                        <div className="text-blueGray-600 font-bold">Marca/Modelo:</div>
                        <div className="text-blueGray-700">
                          {vehiculoEncontrado.marca?.nombre || 'N/A'} {vehiculoEncontrado.modelo || ''}
                        </div>
                      </div>
                      <div>
                        <div className="text-blueGray-600 font-bold">Conductor:</div>
                        <div className="text-blueGray-700">{vehiculoEncontrado.nombreConductor || 'Sin conductor'}</div>
                      </div>
                      <div>
                        <div className="text-blueGray-600 font-bold">Documento:</div>
                        <div className="text-blueGray-700">{vehiculoEncontrado.documento || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-blueGray-600 font-bold">Sede:</div>
                        <div className="text-blueGray-700">{vehiculoEncontrado.sede?.nombre || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Product Search */}
          {formData.sedeId && vehiculoEncontrado && (
            <div className="flex flex-wrap mt-6">
              <div className="w-full px-4">
                <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-white border-2 border-lightBlue-300">
                  <div className="rounded-t bg-blueGray-50 mb-0 px-6 py-4 border-b border-lightBlue-200">
                    <h6 className="text-blueGray-700 text-lg font-bold flex items-center">
                      <i className="fas fa-shopping-cart mr-2 text-lightBlue-500"></i>
                      Agregar Productos a la Venta
                    </h6>
                  </div>
                  <div className="flex-auto px-4 lg:px-10 py-6 pt-0">
                  
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                        Buscar Producto
                      </label>
                      <input
                        type="text"
                        value={searchProduct}
                        onChange={(e) => handleProductSearch(e.target.value)}
                        onFocus={handleProductInputFocus}
                        onBlur={handleProductInputBlur}
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        placeholder={`Buscar entre ${productos.length} productos disponibles...`}
                        autoComplete="off"
                        disabled={productos.length === 0}
                      />
                      
                      {/* Indicador de carga para productos */}
                      {productos.length === 0 && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-lightBlue-500"></div>
                        </div>
                      )}
                      
                      {/* Product Dropdown */}
                      {showProductDropdown && filteredProducts.length > 0 && (
                        <div className="absolute z-50 w-full bg-white border-2 border-blue-300 rounded-lg shadow-xl mt-2 max-h-80 overflow-y-auto">
                          <div className="px-4 py-3 bg-blue-100 border-b-2 border-blue-200 text-sm text-blue-800 font-bold">
                            📦 {searchProduct.length === 0 
                              ? `Mostrando ${filteredProducts.length} productos (de ${productos.length} total)`
                              : `${filteredProducts.length} producto(s) encontrado(s)`
                            }
                          </div>
                          {filteredProducts.map((producto) => (
                            <div
                              key={producto.id}
                              onClick={() => handleSelectProduct(producto)}
                              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-blue-100 last:border-b-0 transition-colors duration-200 hover:shadow-sm"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="font-bold text-gray-800 text-sm">
                                    {producto.nombre}
                                  </div>
                                  <div className="text-xs text-gray-600 mt-1">
                                    <span className="bg-gray-200 px-2 py-1 rounded-full mr-2 font-mono">
                                      {producto.codigoBarra}
                                    </span>
                                    {producto.categoria?.nombre && (
                                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
                                        {producto.categoria.nombre}
                                      </span>
                                    )}
                                  </div>
                                  {producto.descripcion && (
                                    <div className="text-xs text-gray-500 mt-1 truncate">
                                      {producto.descripcion}
                                    </div>
                                  )}
                                </div>
                                <div className="text-right ml-3">
                                  <div className="font-bold text-green-700 text-sm bg-green-100 px-2 py-1 rounded">
                                    {formatCurrency(producto.precioVenta)}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Costo: {formatCurrency(producto.precioCompra)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* No results message */}
                      {showProductDropdown && filteredProducts.length === 0 && searchProduct.length > 0 && (
                        <div className="absolute z-50 w-full bg-white border-2 border-red-300 rounded-lg shadow-xl mt-2">
                          <div className="px-4 py-3 text-red-600 text-sm text-center font-semibold">
                            ❌ No se encontraron productos con "{searchProduct}"
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-shrink-0">
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                        &nbsp;
                      </label>
                      <button
                        type="button"
                        onClick={handleAddSelectedProduct}
                        disabled={!selectedProduct}
                        className={`px-4 py-3 rounded text-sm font-bold uppercase shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150 ${
                          selectedProduct
                            ? 'bg-lightBlue-500 text-white active:bg-lightBlue-600 hover:bg-lightBlue-600'
                            : 'bg-blueGray-300 text-blueGray-500 cursor-not-allowed'
                        }`}
                        title={selectedProduct ? 'Agregar producto seleccionado' : 'Seleccione un producto primero'}
                        style={{
                          backgroundColor: selectedProduct ? '#3182ce' : '#cbd5e0',
                          color: selectedProduct ? '#ffffff' : '#9ca3af',
                          minHeight: '48px'
                        }}
                      >
                        <i className={`fas fa-plus mr-2 ${selectedProduct ? 'text-white' : 'text-blueGray-400'}`}></i>
                        Agregar
                      </button>
                    </div>
                  </div>
                  
                  {selectedProduct && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold text-green-800">
                            Producto seleccionado: {selectedProduct.nombre}
                          </div>
                          <div className="text-xs text-green-600">
                            {selectedProduct.codigoBarra} - {formatCurrency(selectedProduct.precioVenta)}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedProduct(null);
                            setSearchProduct("");
                          }}
                          className="text-green-600 hover:text-green-800 transition-colors"
                          title="Limpiar selección"
                        >
                          <i className="fas fa-times text-green-600 hover:text-green-800"></i>
                        </button>
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products in Sale */}
          {formData.detalles.length > 0 && (
            <div className="mt-6">
              <h6 className="text-blueGray-400 text-sm mb-4 font-bold uppercase">
                Productos en la Venta
              </h6>
              
              <div className="block w-full overflow-x-auto">
                <table className="items-center w-full bg-transparent border-collapse">
                  <thead>
                    <tr>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Producto
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Cantidad
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Precio Unitario
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Subtotal
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.detalles.map((detalle, index) => (
                      <tr key={index}>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                          <div>
                            <div className="font-bold">{detalle.producto.nombre}</div>
                            <div className="text-blueGray-500">Stock: {detalle.stockDisponible}</div>
                          </div>
                        </td>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                          <input
                            type="number"
                            min="1"
                            max={detalle.stockDisponible}
                            value={detalle.cantidad}
                            onChange={(e) => updateProductQuantity(index, parseInt(e.target.value))}
                            className="border border-blueGray-300 px-2 py-1 rounded text-xs w-20"
                          />
                        </td>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={detalle.precioUnitario}
                            onChange={(e) => updateProductPrice(index, parseFloat(e.target.value))}
                            className="border border-blueGray-300 px-2 py-1 rounded text-xs w-24"
                            title={`Precio precargado desde producto: ${formatCurrency(detalle.precioUnitario)}`}
                            placeholder="Precio"
                          />
                        </td>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                          <span className="font-bold">{formatCurrency(detalle.subtotal)}</span>
                        </td>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                          <button
                            type="button"
                            onClick={() => removeProduct(index)}
                            className="text-red-500 hover:text-red-700"
                            title="Eliminar"
                          >
                            <i className="fas fa-trash text-red-500 hover:text-red-700"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total */}
              <div className="mt-4 px-4">
                <div className="flex justify-end">
                  <div className="bg-blueGray-100 p-4 rounded-lg">
                    <h3 className="text-xl font-bold text-blueGray-700">
                      Total: {formatCurrency(calculateTotal())}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty cart message */}
          {formData.detalles.length === 0 && formData.sedeId && vehiculoEncontrado && (
            <div className="mt-6 p-6 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="bg-yellow-200 p-3 rounded-full mr-4">
                  <i className="fas fa-shopping-cart text-yellow-700"></i>
                </div>
                <div>
                  <p className="text-yellow-800 text-lg font-bold">
                    ⚠️ Carrito Vacío
                  </p>
                  <p className="text-yellow-700 text-sm mt-1">
                    No hay productos agregados a la venta. Busque y agregue al menos un producto para continuar.
                  </p>
                </div>
              </div>
            </div>
          )}

          {errors.detalles && (
            <div className="mt-4 p-4 bg-red-100 border-2 border-red-300 rounded-lg">
              <p className="text-red-700 text-sm font-bold flex items-center">
                <i className="fas fa-exclamation-triangle mr-2 text-red-600"></i>
                {errors.detalles}
              </p>
            </div>
          )}

          <hr className="mt-8 border-b-2 border-gray-300" />

          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="bg-blueGray-500 text-white active:bg-blueGray-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || formData.detalles.length === 0}
              className={`bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ml-1 ease-linear transition-all duration-150 ${
                loading || formData.detalles.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Procesando...' : 'Procesar Venta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}