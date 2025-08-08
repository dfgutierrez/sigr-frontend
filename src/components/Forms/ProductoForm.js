import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { categoriaService } from 'api/categoriaService';
import { sedeService } from 'api/sedeService';
import { useAuth } from 'contexts/AuthContext';
import SimpleModal from 'components/Modals/SimpleModal';

export default function ProductoForm({ producto, onSubmit, onCancel, isEditing = false }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    codigo_barra: '',
    nombre: '',
    descripcion: '',
    precio_compra: '',
    precio_venta: '',
    categoria_id: '',
    sede_id: '',
    cantidad_inicial: ''
  });
  const [categorias, setCategorias] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategorias();
    fetchSedes();
    if (producto && isEditing) {
      setFormData({
        codigo_barra: producto.codigoBarra || producto.codigo_barra || '',
        nombre: producto.nombre || '',
        descripcion: producto.descripcion || '',
        precio_compra: producto.precioCompra || producto.precio_compra || '',
        precio_venta: producto.precioVenta || producto.precio_venta || '',
        categoria_id: producto.categoriaId || producto.categoria_id || '',
        sede_id: producto.sedeId || producto.sede_id || '',
        cantidad_inicial: producto.cantidadInicial || producto.cantidad_inicial || ''
      });
    }
  }, [producto, isEditing]);

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
      
      // Establecer la sede por defecto si no estamos editando
      if (!isEditing && !formData.sede_id) {
        setDefaultSede(data);
      }
    } catch (error) {
      console.error('Error fetching sedes:', error);
      setSedes([]);
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
    
    if (!formData.cantidad_inicial || formData.cantidad_inicial < 0) {
      newErrors.cantidad_inicial = 'Ingrese una cantidad inicial válida (0 o mayor)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      // Convertir datos al formato esperado por la API
      const apiData = {
        codigoBarra: formData.codigo_barra,
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precioCompra: parseFloat(formData.precio_compra),
        precioVenta: parseFloat(formData.precio_venta),
        categoriaId: parseInt(formData.categoria_id),
        sedeId: parseInt(formData.sede_id),
        cantidadInicial: parseInt(formData.cantidad_inicial) || 0
      };
      
      console.log('📤 Sending to API:', apiData);
      await onSubmit(apiData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: "Error al guardar el producto" });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const getMargin = () => {
    const compra = parseFloat(formData.precio_compra) || 0;
    const venta = parseFloat(formData.precio_venta) || 0;
    if (compra > 0 && venta > compra) {
      const margin = ((venta - compra) / compra * 100).toFixed(1);
      return `${margin}%`;
    }
    return '0%';
  };

  return (
    <SimpleModal isOpen={true} onClose={onCancel}>
      <div 
        className="max-w-2xl w-full" 
        style={{
          width: '48rem',
          backgroundColor: 'white',
          borderRadius: '8px',
          overflow: 'visible'
        }}
      >
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {isEditing ? "Editar Producto" : "Crear Nuevo Producto"}
            </h3>
          </div>

          <div className="px-6 py-4 space-y-4">
            {/* Primera fila: Código y Nombre */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Código de Barra */}
              <div>
                <label className="block text-xs font-bold uppercase text-blueGray-600 mb-2">
                  Código de Barra *
                </label>
                <input
                  type="text"
                  name="codigo_barra"
                  value={formData.codigo_barra}
                  onChange={handleChange}
                  className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                    errors.codigo_barra ? 'ring-2 ring-red-500' : ''
                  }`}
                  placeholder="Ej: 1234567890123"
                  disabled={loading}
                />
                {errors.codigo_barra && (
                  <p className="text-red-500 text-xs mt-1">{errors.codigo_barra}</p>
                )}
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-xs font-bold uppercase text-blueGray-600 mb-2">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                    errors.nombre ? 'ring-2 ring-red-500' : ''
                  }`}
                  placeholder="Ej: Producto de ejemplo"
                  disabled={loading}
                />
                {errors.nombre && (
                  <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
                )}
              </div>
            </div>

            {/* Segunda fila: Precios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Precio Compra */}
              <div>
                <label className="block text-xs font-bold uppercase text-blueGray-600 mb-2">
                  Precio de Compra *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="precio_compra"
                  value={formData.precio_compra}
                  onChange={handleChange}
                  className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                    errors.precio_compra ? 'ring-2 ring-red-500' : ''
                  }`}
                  placeholder="0"
                  disabled={loading}
                />
                {errors.precio_compra && (
                  <p className="text-red-500 text-xs mt-1">{errors.precio_compra}</p>
                )}
              </div>

              {/* Precio Venta */}
              <div>
                <label className="block text-xs font-bold uppercase text-blueGray-600 mb-2">
                  Precio de Venta *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="precio_venta"
                  value={formData.precio_venta}
                  onChange={handleChange}
                  className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                    errors.precio_venta ? 'ring-2 ring-red-500' : ''
                  }`}
                  placeholder="0"
                  disabled={loading}
                />
                {errors.precio_venta && (
                  <p className="text-red-500 text-xs mt-1">{errors.precio_venta}</p>
                )}
              </div>
            </div>

            {/* Tercera fila: Categoría y Sede */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Categoría */}
              <div>
                <label className="block text-xs font-bold uppercase text-blueGray-600 mb-2">
                  Categoría *
                </label>
                <select
                  name="categoria_id"
                  value={formData.categoria_id}
                  onChange={handleChange}
                  className={`border-0 px-3 py-3 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                    errors.categoria_id ? 'ring-2 ring-red-500' : ''
                  }`}
                  disabled={loading}
                >
                  <option value="">Seleccione una categoría</option>
                  {Array.isArray(categorias) && categorias.map(categoria => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
                {errors.categoria_id && (
                  <p className="text-red-500 text-xs mt-1">{errors.categoria_id}</p>
                )}
              </div>

              {/* Sede */}
              <div>
                <label className="block text-xs font-bold uppercase text-blueGray-600 mb-2">
                  Sede *
                </label>
                <select
                  name="sede_id"
                  value={formData.sede_id}
                  onChange={handleChange}
                  className={`border-0 px-3 py-3 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                    errors.sede_id ? 'ring-2 ring-red-500' : ''
                  }`}
                  disabled={loading}
                >
                  <option value="">Seleccione una sede</option>
                  {Array.isArray(sedes) && sedes.map(sede => (
                    <option key={sede.id} value={sede.id}>
                      {sede.nombre}
                    </option>
                  ))}
                </select>
                {errors.sede_id && (
                  <p className="text-red-500 text-xs mt-1">{errors.sede_id}</p>
                )}
              </div>
            </div>

            {/* Cuarta fila: Cantidad Inicial */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-blueGray-600 mb-2">
                  Cantidad Inicial en Inventario *
                </label>
                <input
                  type="number"
                  min="0"
                  name="cantidad_inicial"
                  value={formData.cantidad_inicial}
                  onChange={handleChange}
                  className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                    errors.cantidad_inicial ? 'ring-2 ring-red-500' : ''
                  }`}
                  placeholder="0"
                  disabled={loading}
                />
                {errors.cantidad_inicial && (
                  <p className="text-red-500 text-xs mt-1">{errors.cantidad_inicial}</p>
                )}
              </div>
              <div>
                {/* Campo vacío para mantener el layout */}
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-xs font-bold uppercase text-blueGray-600 mb-2">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={3}
                className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                placeholder="Descripción del producto (opcional)"
                disabled={loading}
              />
            </div>

            {/* Vista previa del producto */}
            <div className="bg-blueGray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blueGray-700 mb-2">Vista Previa</h4>
              <div className="flex items-start gap-3">
                <div className="bg-lightBlue-100 text-lightBlue-600 w-12 h-12 rounded-lg flex items-center justify-center">
                  <i className="fas fa-box text-xl"></i>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-blueGray-700">
                    {formData.nombre || "Nombre del producto"}
                  </div>
                  <div className="text-sm text-blueGray-500">
                    {formData.codigo_barra || "Código de barra"}
                  </div>
                  <div className="text-xs text-blueGray-400 mt-1">
                    {formData.descripcion || "Sin descripción"}
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="text-sm">
                      <span className="text-blueGray-500">Compra: </span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(formData.precio_compra)}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-blueGray-500">Venta: </span>
                      <span className="font-medium text-lightBlue-600">
                        {formatCurrency(formData.precio_venta)}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-blueGray-500">Margen: </span>
                      <span className="font-medium text-indigo-600">
                        {getMargin()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error general */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}
          </div>

          <div 
            className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3"
            style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              alignItems: 'center',
              padding: '16px 24px',
              borderTop: '1px solid #e5e7eb',
              gap: '12px'
            }}
          >
            <button
              type="button"
              onClick={onCancel}
              className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loading}
              style={{ 
                display: 'inline-flex',
                backgroundColor: 'white',
                color: '#374151',
                border: '1px solid #d1d5db',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                alignItems: 'center'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                display: 'inline-flex',
                backgroundColor: '#4f46e5',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                minWidth: '120px',
                justifyContent: 'center',
                alignItems: 'center',
                opacity: loading ? 0.5 : 1
              }}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Guardando...
                </>
              ) : (
                <>
                  <i className={`fas ${isEditing ? 'fa-save' : 'fa-plus'} mr-2`}></i>
                  {isEditing ? "Actualizar" : "Crear"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </SimpleModal>
  );
}

ProductoForm.propTypes = {
  producto: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isEditing: PropTypes.bool
};