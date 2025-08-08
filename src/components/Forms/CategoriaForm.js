import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import SimpleModal from 'components/Modals/SimpleModal';

export default function CategoriaForm({ categoria, onSubmit, onCancel, isEditing = false }) {
  const [formData, setFormData] = useState({
    nombre: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (categoria && isEditing) {
      setFormData({
        nombre: categoria.nombre || ''
      });
    }
  }, [categoria, isEditing]);

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
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre de la categoría es requerido';
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
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: "Error al guardar la categoría" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SimpleModal isOpen={true} onClose={onCancel}>
      <div 
        className="max-w-lg w-full" 
        style={{
          width: '32rem',
          backgroundColor: 'white',
          borderRadius: '8px',
          overflow: 'visible'
        }}
      >
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {isEditing ? "Editar Categoría" : "Crear Nueva Categoría"}
            </h3>
          </div>

          <div className="px-6 py-4 space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-xs font-bold uppercase text-blueGray-600 mb-2">
                Nombre de la Categoría *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                  errors.nombre ? 'ring-2 ring-red-500' : ''
                }`}
                placeholder="Ej: Bebidas, Snacks, Lácteos"
                disabled={loading}
              />
              {errors.nombre && (
                <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
              )}
            </div>

            {/* Vista previa de la categoría */}
            <div className="bg-blueGray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blueGray-700 mb-2">Vista Previa</h4>
              <div className="flex items-center gap-3">
                <div className="bg-lightBlue-100 text-lightBlue-600 w-10 h-10 rounded-lg flex items-center justify-center">
                  <i className="fas fa-tags text-lg"></i>
                </div>
                <div>
                  <div className="font-medium text-blueGray-700">
                    {formData.nombre || "Nombre de la categoría"}
                  </div>
                  <div className="text-xs text-blueGray-400">
                    Categoría de productos
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

CategoriaForm.propTypes = {
  categoria: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isEditing: PropTypes.bool
};