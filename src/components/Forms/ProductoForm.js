import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { categoriaService } from 'api/categoriaService';
import { sedeService } from 'api/sedeService';
import { marcaService } from 'api/marcaService';
import { useAuth } from 'contexts/AuthContext';
import Button from 'components/UI/Button';
import Input from 'components/UI/Input';
import Select from 'components/UI/Select';

const ProductoForm = ({ 
  producto = null, 
  onSubmit, 
  onCancel,
  loading = false,
  isEditing = false 
}) => {
  const { user } = useAuth();
  
  // Verificar si el usuario es vendedor
  const isVendedor = () => {
    return user?.rol === 'VENDEDOR' || user?.role === 'VENDEDOR' || 
           (user?.roles && user.roles.includes('VENDEDOR'));
  };

  const [formData, setFormData] = useState({
    codigo_barra: '',
    nombre: '',
    descripcion: '',
    precio_compra: '',
    precio_venta: '',
    categoria_id: '',
    sede_id: '',
    cantidad_inicial: '',
    marca_id: ''
  });

  const [categorias, setCategorias] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategorias();
    fetchSedes();
    fetchMarcas();
    if (producto && isEditing) {
      // Determinar la sede a preseleccionar
      let sedeId = '';
      
      // Si es vendedor, usar su sede asignada (no la del producto)
      if (isVendedor()) {
        if (user?.sedes && Array.isArray(user.sedes) && user.sedes.length > 0) {
          sedeId = user.sedes[0].id.toString();
          console.log('🏢 VENDEDOR: Forzando sede del usuario:', user.sedes[0].nombre);
        } else if (user?.sedeId) {
          sedeId = user.sedeId.toString();
          console.log('🏢 VENDEDOR: Forzando sede del usuario (sedeId):', sedeId);
        }
      } 
      // Para otros roles, usar la sede del producto
      else {
        // Opción 1: Si el producto tiene array de sedes, usar la primera sede con stock
        if (producto.sedes && Array.isArray(producto.sedes) && producto.sedes.length > 0) {
          const sedeConStock = producto.sedes.find(sede => sede.tieneStock) || producto.sedes[0];
          sedeId = sedeConStock.sedeId?.toString() || '';
          console.log('🏢 Preseleccionando sede desde sedes array:', sedeConStock.sedeNombre);
        }
        // Opción 2: Fallback a propiedades directas del producto
        else if (producto.sedeId || producto.sede_id) {
          sedeId = (producto.sedeId || producto.sede_id).toString();
          console.log('🏢 Preseleccionando sede desde producto directo:', sedeId);
        }
      }
      
      setFormData({
        codigo_barra: producto.codigoBarra || producto.codigo_barra || '',
        nombre: producto.nombre || '',
        descripcion: producto.descripcion || '',
        precio_compra: producto.precioCompra || producto.precio_compra || '',
        precio_venta: producto.precioVenta || producto.precio_venta || '',
        categoria_id: producto.categoriaId || producto.categoria_id || '',
        sede_id: sedeId,
        cantidad_inicial: producto.cantidadInicial || producto.cantidad_inicial || '',
        marca_id: (producto.marcaId !== null && producto.marcaId !== undefined) ? producto.marcaId.toString() : 
                 (producto.marca_id !== null && producto.marca_id !== undefined) ? producto.marca_id.toString() : ''
      });
    }
  }, [producto, isEditing, user]);

  const fetchCategorias = async () => {
    try {
      const response = await categoriaService.getAll();
      
      console.log('🔍 Full categorias API response:', response);
      console.log('🔍 Categorias response data:', response.data);
      
      // Verificar diferentes estructuras de respuesta posibles
      let categoriasData = [];
      
      if (Array.isArray(response.data)) {
        // La respuesta directa es un array
        categoriasData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        // La respuesta tiene estructura { data: [...] }
        categoriasData = response.data.data;
      } else if (response.data && Array.isArray(response.data.categorias)) {
        // La respuesta tiene estructura { categorias: [...] }
        categoriasData = response.data.categorias;
      } else {
        // Fallback: usar array vacío
        console.warn('⚠️ Unexpected categorias response structure:', response.data);
        categoriasData = [];
      }
      
      setCategorias(categoriasData);
      console.log('✅ Categorias loaded:', categoriasData.length, 'items');
    } catch (error) {
      console.error('Error fetching categorias:', error);
      // Fallback categories if API fails
      setCategorias([
        { id: 1, nombre: 'Categoría General' },
        { id: 2, nombre: 'Sin Categoría' }
      ]);
    }
  };

  const fetchSedes = async () => {
    try {
      const data = await sedeService.getAllSedes();
      setSedes(Array.isArray(data) ? data : []);
      console.log('✅ Sedes loaded:', Array.isArray(data) ? data.length : 0, 'items');
      
      // Establecer la sede por defecto
      // Para vendedores, siempre establecer su sede (tanto en crear como editar)
      // Para otros roles, solo en modo creación si no hay sede
      if (isVendedor() || (!isEditing && !formData.sede_id)) {
        setDefaultSede(data);
      }
    } catch (error) {
      console.error('Error fetching sedes:', error);
      setSedes([]);
    }
  };

  const fetchMarcas = async () => {
    try {
      const response = await marcaService.getAllMarcas();
      
      console.log('🏷️ Full marcas API response:', response);
      
      // Verificar diferentes estructuras de respuesta posibles
      let marcasData = [];
      
      if (Array.isArray(response)) {
        // La respuesta directa es un array
        marcasData = response;
      } else if (response && Array.isArray(response.data)) {
        // La respuesta tiene estructura { data: [...] }
        marcasData = response.data;
      } else if (response && Array.isArray(response.marcas)) {
        // La respuesta tiene estructura { marcas: [...] }
        marcasData = response.marcas;
      } else {
        // Fallback: usar array vacío
        console.warn('⚠️ Unexpected marcas response structure:', response);
        marcasData = [];
      }
      
      setMarcas(marcasData);
      console.log('✅ Marcas loaded:', marcasData.length, 'items');
    } catch (error) {
      console.error('Error fetching marcas:', error);
      // Fallback marcas if API fails
      setMarcas([
        { id: 1, nombre: 'Marca General' },
        { id: 2, nombre: 'Sin Marca' }
      ]);
    }
  };

  const setDefaultSede = (sedesData) => {
    let defaultSedeId = '';
    
    // Prioridad 1: Primera sede del usuario autenticado
    if (user?.sedes && Array.isArray(user.sedes) && user.sedes.length > 0) {
      defaultSedeId = user.sedes[0].id.toString();
      console.log('🏢 Setting default sede from user.sedes:', user.sedes[0].nombre);
    }
    // Prioridad 2: sedeId del usuario (fallback)
    else if (user?.sedeId) {
      defaultSedeId = user.sedeId.toString();
      console.log('🏢 Setting default sede from user.sedeId:', user.sedeId);
    }
    // Prioridad 3: Primera sede disponible
    else if (Array.isArray(sedesData) && sedesData.length > 0) {
      defaultSedeId = sedesData[0].id.toString();
      console.log('🏢 Setting default sede as first available:', sedesData[0].nombre);
    }

    if (defaultSedeId) {
      setFormData(prev => ({
        ...prev,
        sede_id: defaultSedeId
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBlur = () => {
    // Placeholder para mantener compatibilidad con UserForm
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.codigo_barra.trim()) {
      newErrors.codigo_barra = 'El código de barra es requerido';
    }
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    
    if (!formData.precio_compra || formData.precio_compra <= 0) {
      newErrors.precio_compra = 'Ingrese un precio de compra válido';
    }
    
    if (!formData.precio_venta || formData.precio_venta <= 0) {
      newErrors.precio_venta = 'Ingrese un precio de venta válido';
    }
    
    if (formData.precio_venta && formData.precio_compra && 
        parseFloat(formData.precio_venta) <= parseFloat(formData.precio_compra)) {
      newErrors.precio_venta = 'El precio de venta debe ser mayor al precio de compra';
    }
    
    if (!formData.categoria_id) {
      newErrors.categoria_id = 'Seleccione una categoría';
    }
    
    if (!formData.sede_id) {
      newErrors.sede_id = 'Seleccione una sede';
    }
    
    // Validar cantidad inicial solo en modo creación (en edición es opcional y disabled)
    if (!isEditing && (!formData.cantidad_inicial || formData.cantidad_inicial < 0)) {
      newErrors.cantidad_inicial = 'Ingrese una cantidad inicial válida (0 o mayor)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Convertir datos al formato esperado por la API
    const apiData = {
      codigoBarra: formData.codigo_barra,
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      precioCompra: parseFloat(formData.precio_compra),
      precioVenta: parseFloat(formData.precio_venta),
      categoriaId: parseInt(formData.categoria_id),
      sedeId: parseInt(formData.sede_id),
      marcaId: formData.marca_id ? parseInt(formData.marca_id) : null
    };
    
    // Solo incluir cantidadInicial en modo creación
    if (!isEditing) {
      apiData.cantidadInicial = parseInt(formData.cantidad_inicial) || 0;
    }
    
    console.log('📤 Sending to API:', apiData);
    onSubmit(apiData);
  };

  // Preparar opciones para los componentes Select
  const categoriaOptions = categorias.map(categoria => ({
    value: categoria.id,
    label: categoria.nombre,
    key: categoria.id
  }));

  const marcaOptions = marcas.map(marca => ({
    value: marca.id,
    label: marca.nombre,
    key: marca.id
  }));

  const sedeOptions = sedes.map(sede => ({
    value: sede.id,
    label: sede.nombre,
    key: sede.id
  }));

  return (
    <form onSubmit={handleSubmit}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          {isEditing ? "Editar Producto" : "Nuevo Producto"}
        </h3>
      </div>
      
      <div className="px-6 py-4 space-y-4 max-h-96 overflow-y-auto">

        {/* Sección: Información Básica */}
        <div className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Código de Barra"
              name="codigo_barra"
              value={formData.codigo_barra}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.codigo_barra}
              required
              placeholder="Ej: 1234567890123"
              disabled={loading}
            />
            
            <Input
              label="Nombre del Producto"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.nombre}
              required
              placeholder="Ej: Producto de ejemplo"
              disabled={loading}
            />
          </div>

          <Input
            label="Descripción"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Descripción del producto (opcional)"
            disabled={loading}
          />
        </div>

        {/* Sección: Precios */}
        <div className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Precio de Compra"
              name="precio_compra"
              type="number"
              step="0.01"
              min="0"
              value={formData.precio_compra}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.precio_compra}
              required
              placeholder="0"
              disabled={loading}
            />
            
            <Input
              label="Precio de Venta"
              name="precio_venta"
              type="number"
              step="0.01"
              min="0"
              value={formData.precio_venta}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.precio_venta}
              required
              placeholder="0"
              disabled={loading}
            />
          </div>
        </div>

        {/* Sección: Categorización */}
        <div className="space-y-4">
          
          <Select
            label="Categoría"
            name="categoria_id"
            value={formData.categoria_id}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.categoria_id}
            options={categoriaOptions}
            placeholder="Seleccionar categoría"
            required
            disabled={loading}
          />
          
          <Select
            label="Marca"
            name="marca_id"
            value={formData.marca_id}
            onChange={handleChange}
            onBlur={handleBlur}
            options={marcaOptions}
            placeholder="Seleccionar marca"
            disabled={loading}
          />
        </div>

        {/* Sección: Ubicación y Stock */}
        <div className="space-y-4">
          
          <div className="space-y-4">
            <div className="relative">
              <Select
                label="Sede"
                name="sede_id"
                value={formData.sede_id}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.sede_id}
                options={sedeOptions}
                placeholder="Seleccionar sede"
                disabled={loading || isVendedor()}
                required
              />
            </div>

            <div className="space-y-2">
              <Input
                label={isEditing ? "Cantidad en Inventario" : "Cantidad Inicial en Inventario"}
                name="cantidad_inicial"
                type="number"
                min="0"
                value={formData.cantidad_inicial}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.cantidad_inicial}
                required={!isEditing}
                placeholder="0"
                disabled={loading || isEditing}
              />
              {/* Vista previa del producto */}
              {(formData.nombre || formData.precio_compra || formData.precio_venta) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-eye text-xl"></i>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-blue-900 mb-2">
                        Vista Previa del Producto
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="text-xs text-blue-700">
                            <span className="font-medium">Nombre:</span> {formData.nombre || 'Sin nombre'}
                          </div>
                          <div className="text-xs text-blue-700">
                            <span className="font-medium">Código:</span> {formData.codigo_barra || 'Sin código'}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-xs text-blue-700">
                            <span className="font-medium">Precio compra:</span> ${parseFloat(formData.precio_compra || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                          </div>
                          <div className="text-xs text-blue-700">
                            <span className="font-medium">Precio venta:</span> ${parseFloat(formData.precio_venta || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                          </div>
                          
                          {formData.precio_compra && formData.precio_venta && formData.precio_compra > 0 && (
                            <div className="text-xs">
                              <span className="font-medium text-blue-700">Ganancia:</span>
                              <span className={`ml-1 px-2 py-1 rounded text-xs font-bold ${
                                ((parseFloat(formData.precio_venta) - parseFloat(formData.precio_compra)) / parseFloat(formData.precio_compra) * 100) > 30 
                                  ? 'bg-green-100 text-green-800' 
                                  : ((parseFloat(formData.precio_venta) - parseFloat(formData.precio_compra)) / parseFloat(formData.precio_compra) * 100) > 10
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {((parseFloat(formData.precio_venta) - parseFloat(formData.precio_compra)) / parseFloat(formData.precio_compra) * 100).toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {formData.cantidad_inicial && (
                        <div className="mt-3 pt-2 border-t border-blue-200">
                          <div className="text-xs text-blue-700">
                            <i className="fas fa-warehouse mr-1"></i>
                            <span className="font-medium">{isEditing ? "Stock actual:" : "Stock inicial:"}</span> {formData.cantidad_inicial} unidades
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>


        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-600 text-sm">{errors.submit}</p>
          </div>
        )}
      </div>
      
      <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={loading}
          icon={`fas ${isEditing ? 'fa-save' : 'fa-plus'}`}
          className="min-w-[120px]"
        >
          {isEditing ? "Actualizar" : "Crear Producto"}
        </Button>
      </div>
    </form>
  );
};

ProductoForm.propTypes = {
  producto: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
  loading: PropTypes.bool
};

export default ProductoForm;