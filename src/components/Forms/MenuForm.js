import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import SimpleModal from "components/Modals/SimpleModal.js";

export default function MenuForm({ menu, roles = [], onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    nombre: "",
    ruta: "",
    icono: "fa-list",
    categoria: "",
    orden: 1,
    roleIds: []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [nameValidating, setNameValidating] = useState(false);

  // Opciones de iconos disponibles (según el formato de tu API)
  const iconOptions = [
    { value: "fa-tv", label: "Dashboard", icon: "fas fa-tv" },
    { value: "fa-users", label: "Usuarios", icon: "fas fa-users" },
    { value: "fa-building", label: "Sedes", icon: "fas fa-building" },
    { value: "fa-user-tag", label: "Roles", icon: "fas fa-user-tag" },
    { value: "fa-car", label: "Vehículos", icon: "fas fa-car" },
    { value: "fa-chart-bar", label: "Reportes", icon: "fas fa-chart-bar" },
    { value: "fa-tools", label: "Configuración", icon: "fas fa-tools" },
    { value: "fa-boxes", label: "Productos", icon: "fas fa-boxes" },
    { value: "fa-tags", label: "Categorías", icon: "fas fa-tags" },
    { value: "fa-trademark", label: "Marcas", icon: "fas fa-trademark" },
    { value: "fa-exchange-alt", label: "Movimientos", icon: "fas fa-exchange-alt" },
    { value: "fa-list", label: "Lista", icon: "fas fa-list" },
    { value: "fa-home", label: "Inicio", icon: "fas fa-home" },
    { value: "fa-cog", label: "Configuración", icon: "fas fa-cog" },
    { value: "fa-archive", label: "Archivo", icon: "fas fa-archive" },
    { value: "fa-clipboard", label: "Clipboard", icon: "fas fa-clipboard" }
  ];

  // Categorías predefinidas
  const categoryOptions = [
    "Administración",
    "Gestión",
    "Inventario",
    "Vehículos",
    "Reportes",
    "Sistema"
  ];

  useEffect(() => {
    if (menu) {
      setFormData({
        nombre: menu.nombre || "",
        ruta: menu.ruta || "",
        icono: menu.icono || "fa-list",
        categoria: menu.categoria || "",
        orden: menu.orden || 1,
        roleIds: menu.roleIds || []
      });
    }
  }, [menu]);


  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    }

    if (!formData.ruta.trim()) {
      newErrors.ruta = "La ruta es requerida";
    } else if (!formData.ruta.startsWith("/")) {
      newErrors.ruta = "La ruta debe comenzar con /";
    }

    if (!formData.categoria.trim()) {
      newErrors.categoria = "La categoría es requerida";
    }

    if (!formData.orden || formData.orden < 1) {
      newErrors.orden = "El orden debe ser mayor a 0";
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
      console.error("Error submitting form:", error);
      setErrors({ submit: "Error al guardar el menú" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleRoleToggle = (roleId) => {
    setFormData(prev => {
      const currentRoles = prev.roleIds || [];
      const newRoles = currentRoles.includes(roleId)
        ? currentRoles.filter(id => id !== roleId)
        : [...currentRoles, roleId];
      
      return {
        ...prev,
        roleIds: newRoles
      };
    });
  };

  const handleSelectAllRoles = () => {
    const allRoleIds = roles.map(role => role.id);
    const currentRoles = formData.roleIds || [];
    
    setFormData(prev => ({
      ...prev,
      roleIds: currentRoles.length === allRoleIds.length ? [] : allRoleIds
    }));
  };

  const getSelectedIcon = () => {
    const selectedOption = iconOptions.find(opt => opt.value === formData.icono);
    return selectedOption ? selectedOption.icon : "fas fa-list";
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
              {menu ? "Editar Menú" : "Crear Nuevo Menú"}
            </h3>
          </div>

          <div className="px-6 py-4 space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-xs font-bold uppercase text-blueGray-600 mb-2">
                Nombre del Menú *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                  errors.nombre ? 'ring-2 ring-red-500' : ''
                }`}
                placeholder="Ej: Dashboard, Usuarios, etc."
                disabled={loading}
              />
              {errors.nombre && (
                <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
              )}
            </div>

            {/* Ruta */}
            <div>
              <label className="block text-xs font-bold uppercase text-blueGray-600 mb-2">
                Ruta *
              </label>
              <input
                type="text"
                name="ruta"
                value={formData.ruta}
                onChange={handleChange}
                className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                  errors.ruta ? 'ring-2 ring-red-500' : ''
                }`}
                placeholder="Ej: /admin/dashboard, /usuarios"
                disabled={loading}
              />
              {errors.ruta && (
                <p className="text-red-500 text-xs mt-1">{errors.ruta}</p>
              )}
            </div>

            {/* Icono */}
            <div>
              <label className="block text-xs font-bold uppercase text-blueGray-600 mb-2">
                Icono
              </label>
              <div className="relative">
                <select
                  name="icono"
                  value={formData.icono}
                  onChange={handleChange}
                  className="border-0 px-3 py-3 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 pr-10"
                  disabled={loading}
                >
                  {iconOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <i className={`${getSelectedIcon()} text-blueGray-400`}></i>
                </div>
              </div>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-xs font-bold uppercase text-blueGray-600 mb-2">
                Categoría *
              </label>
              <input
                type="text"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                list="categories"
                className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                  errors.categoria ? 'ring-2 ring-red-500' : ''
                }`}
                placeholder="Ej: Administración, Gestión, etc."
                disabled={loading}
              />
              <datalist id="categories">
                {categoryOptions.map(category => (
                  <option key={category} value={category} />
                ))}
              </datalist>
              {errors.categoria && (
                <p className="text-red-500 text-xs mt-1">{errors.categoria}</p>
              )}
            </div>

            {/* Orden */}
            <div>
              <label className="block text-xs font-bold uppercase text-blueGray-600 mb-2">
                Orden *
              </label>
              <input
                type="number"
                name="orden"
                value={formData.orden}
                onChange={handleChange}
                min="1"
                className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                  errors.orden ? 'ring-2 ring-red-500' : ''
                }`}
                disabled={loading}
              />
              {errors.orden && (
                <p className="text-red-500 text-xs mt-1">{errors.orden}</p>
              )}
            </div>

            {/* Gestión de Roles */}
            <div>
              <label className="block text-xs font-bold uppercase text-blueGray-600 mb-2">
                Roles con Acceso ({(formData.roleIds || []).length} de {roles.length} seleccionados)
              </label>
              
              {roles.length > 0 && (
                <div className="mb-2">
                  <button
                    type="button"
                    onClick={handleSelectAllRoles}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    disabled={loading}
                  >
                    {(formData.roleIds || []).length === roles.length ? "Deseleccionar todos" : "Seleccionar todos"}
                  </button>
                </div>
              )}
              
              <div className="max-h-32 overflow-y-auto border border-blueGray-200 rounded bg-white">
                {roles.length > 0 ? (
                  <div className="p-2 space-y-2">
                    {roles.map(role => (
                      <label
                        key={role.id}
                        className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
                          (formData.roleIds || []).includes(role.id)
                            ? 'bg-indigo-50 border border-indigo-200'
                            : 'hover:bg-blueGray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={(formData.roleIds || []).includes(role.id)}
                          onChange={() => handleRoleToggle(role.id)}
                          className="form-checkbox h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                          disabled={loading}
                        />
                        <div className="ml-2 flex-1">
                          <div className="text-sm font-medium text-blueGray-700">
                            {role.nombre}
                          </div>
                          {role.descripcion && (
                            <div className="text-xs text-blueGray-500">
                              {role.descripcion}
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-blueGray-400 text-sm">
                    No hay roles disponibles
                  </div>
                )}
              </div>
              
              {(formData.roleIds || []).length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2 mt-2">
                  <div className="flex">
                    <i className="fas fa-exclamation-triangle text-yellow-400 mr-2 mt-0.5 text-xs"></i>
                    <div className="text-xs text-yellow-700">
                      <strong>Advertencia:</strong> Sin roles asignados, el menú no será visible para ningún usuario.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Vista previa del icono */}
            <div className="bg-blueGray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blueGray-700 mb-2">Vista Previa</h4>
              <div className="flex items-center gap-3">
                <i className={`${getSelectedIcon()} text-xl text-blueGray-600`}></i>
                <div>
                  <div className="font-medium text-blueGray-700">{formData.nombre || "Nombre del menú"}</div>
                  <div className="text-sm text-blueGray-500">{formData.ruta || "/ruta/del/menu"}</div>
                  <div className="text-xs text-blueGray-400">{formData.categoria || "Categoría"}</div>
                  <div className="text-xs text-indigo-600 mt-1">
                    {(formData.roleIds || []).length > 0 
                      ? `Accesible para ${(formData.roleIds || []).length} rol${(formData.roleIds || []).length !== 1 ? 'es' : ''}`
                      : 'Sin acceso configurado'
                    }
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
                minWidth: '100px',
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
                  <i className={`fas ${menu ? 'fa-save' : 'fa-plus'} mr-2`}></i>
                  {menu ? "Actualizar" : "Crear"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </SimpleModal>
  );
}

MenuForm.propTypes = {
  menu: PropTypes.object,
  roles: PropTypes.array,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};