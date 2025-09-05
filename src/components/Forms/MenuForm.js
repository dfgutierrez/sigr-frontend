import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Button from "components/UI/Button";
import Input from "components/UI/Input";
import Select from "components/UI/Select";

export default function MenuForm({ menu, roles = [], onSubmit, onCancel, loading = false }) {
  const [formData, setFormData] = useState({
    nombre: "",
    ruta: "",
    icono: "fa-list",
    categoria: "",
    orden: 1,
    roleIds: []
  });
  const [errors, setErrors] = useState({});

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
    "Ventas"
  ];

  useEffect(() => {
    if (menu) {
      // Editando un menú existente - usar los datos del menú
      setFormData({
        nombre: menu.nombre || "",
        ruta: menu.ruta || "",
        icono: menu.icono || "fa-list",
        categoria: menu.categoria || "",
        orden: menu.orden || 1,
        roleIds: menu.roleIds || []
      });
    } else {
      // Creando un nuevo menú - preseleccionar ADMINISTRADOR por defecto
      const adminRole = roles.find(role => role.nombre === "ADMINISTRADOR");
      if (adminRole) {
        setFormData(prev => ({
          ...prev,
          roleIds: [adminRole.id]
        }));
      }
    }
  }, [menu, roles]);


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

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({ submit: "Error al guardar el menú" });
      throw error;
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBlur = () => {
    // Placeholder para mantener compatibilidad con ProductoForm
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

  // Preparar opciones para los componentes Select
  const categoriaOptions = categoryOptions.map(categoria => ({
    value: categoria,
    label: categoria,
    key: categoria
  }));

  const iconOptionsForSelect = iconOptions.map(icon => ({
    value: icon.value,
    label: icon.label,
    key: icon.value
  }));

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <form onSubmit={handleSubmit}>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {menu ? "Editar Menú" : "Crear Nuevo Menú Diego"}
          </h3>
        </div>

      <div className="px-6 py-4 space-y-4 max-h-96 overflow-y-auto">
        <Input
          label="Nombre del Menú"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.nombre}
          required
          placeholder="Ej: Dashboard, Usuarios, etc."
          disabled={loading}
        />

        <Input
          label="Ruta"
          name="ruta"
          value={formData.ruta}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.ruta}
          required
          placeholder="Ej: /admin/dashboard, /usuarios"
          disabled={loading}
        />

        <Select
          label="Icono"
          name="icono"
          value={formData.icono}
          onChange={handleChange}
          onBlur={handleBlur}
          options={iconOptionsForSelect}
          placeholder="Seleccionar icono"
          disabled={loading}
        />

        <Select
          label="Categoría"
          name="categoria"
          value={formData.categoria}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.categoria}
          options={categoriaOptions}
          placeholder="Seleccionar categoría"
          required
          disabled={loading}
        />

        <Input
          label="Orden"
          name="orden"
          type="number"
          min="1"
          value={formData.orden}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.orden}
          required
          placeholder="1"
          disabled={loading}
        />

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
              
              <div className="mt-2 h-12">
                {(formData.roleIds || []).length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2">
                    <div className="flex">
                      <i className="fas fa-exclamation-triangle text-yellow-400 mr-2 mt-0.5 text-xs"></i>
                      <div className="text-xs text-yellow-700">
                        <strong>Advertencia:</strong> Sin roles asignados, el menú no será visible para ningún usuario.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>


            {/* Error general */}
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
          icon={`fas ${menu ? 'fa-save' : 'fa-plus'}`}
          className="min-w-[120px]"
        >
          {menu ? "Actualizar" : "Crear Menú"}
        </Button>
      </div>
      </form>
    </div>
  );
}

MenuForm.propTypes = {
  menu: PropTypes.object,
  roles: PropTypes.array,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool
};