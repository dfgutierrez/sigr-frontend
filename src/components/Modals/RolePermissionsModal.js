import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import SimpleModal from "components/Modals/SimpleModal.js";
import { menuAdminService } from "api/menuAdminService.js";

export default function RolePermissionsModal({ menu, roles, onSubmit, onCancel }) {
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMenuRoles();
  }, [menu.id]);

  const loadMenuRoles = async () => {
    try {
      setLoadingInitial(true);
      // Get the menu details with role information
      const menuDetails = await menuAdminService.getMenuById(menu.id);
      setSelectedRoles(menuDetails.roleIds || []);
    } catch (error) {
      console.error("Error loading menu roles:", error);
      // Fallback to use existing roleIds from the menu prop
      setSelectedRoles(menu.roleIds || []);
      setError("");
    } finally {
      setLoadingInitial(false);
    }
  };

  const handleRoleToggle = (roleId) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedRoles.length === roles.length) {
      setSelectedRoles([]);
    } else {
      setSelectedRoles(roles.map(role => role.id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Update the menu with new role assignments
      const updatedMenuData = {
        nombre: menu.nombre,
        ruta: menu.ruta,
        icono: menu.icono,
        categoria: menu.categoria,
        orden: menu.orden,
        roleIds: selectedRoles
      };
      
      await menuAdminService.updateMenu(menu.id, updatedMenuData);
      await onSubmit(menu.id, selectedRoles); // Notify parent component
    } catch (error) {
      console.error("Error updating permissions:", error);
      setError(error.message || "Error al actualizar los permisos");
    } finally {
      setLoading(false);
    }
  };

  if (loadingInitial) {
    return (
      <SimpleModal isOpen={true} onClose={() => {}}>
        <div className="max-w-md w-full">
          <div className="px-6 py-8 text-center">
            <i className="fas fa-spinner fa-spin text-2xl text-blueGray-400 mb-4"></i>
            <p className="text-blueGray-600">Cargando permisos...</p>
          </div>
        </div>
      </SimpleModal>
    );
  }

  return (
    <SimpleModal isOpen={true} onClose={onCancel}>
      <div className="max-w-lg w-full" style={{width: '32rem'}}>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Gestionar Permisos
            </h3>
            <p className="text-sm text-blueGray-600 mt-1">
              Configura qué roles pueden acceder al menú: <strong>{menu.nombre}</strong>
            </p>
          </div>

          <div className="px-6 py-4">
            {/* Información del menú */}
            <div className="bg-blueGray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-2">
                <i className={`fas fa-${menu.icono === 'dashboard' ? 'tv' : menu.icono} mr-2 text-blueGray-500`}></i>
                <span className="font-semibold text-blueGray-700">{menu.nombre}</span>
              </div>
              <div className="text-sm text-blueGray-600">
                <p><strong>Ruta:</strong> {menu.ruta}</p>
                <p><strong>Categoría:</strong> {menu.categoria}</p>
              </div>
            </div>

            {/* Control de selección */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-blueGray-700">
                Roles con Acceso ({selectedRoles.length}/{roles.length})
              </h4>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                disabled={loading}
              >
                {selectedRoles.length === roles.length ? "Deseleccionar todos" : "Seleccionar todos"}
              </button>
            </div>

            {/* Lista de roles */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {roles.map(role => (
                <label
                  key={role.id}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedRoles.includes(role.id)
                      ? 'bg-indigo-50 border-indigo-200'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.id)}
                    onChange={() => handleRoleToggle(role.id)}
                    className="form-checkbox h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                    disabled={loading}
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blueGray-700">
                        {role.nombre}
                      </span>
                      {role.descripcion && (
                        <span className="text-xs text-blueGray-500">
                          {role.descripcion}
                        </span>
                      )}
                    </div>
                    {role.usuariosCount && (
                      <p className="text-xs text-blueGray-500 mt-1">
                        {role.usuariosCount} usuario{role.usuariosCount !== 1 ? 's' : ''} asignado{role.usuariosCount !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>

            {/* Advertencia si no hay roles seleccionados */}
            {selectedRoles.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-4">
                <div className="flex">
                  <i className="fas fa-exclamation-triangle text-yellow-400 mr-2 mt-0.5"></i>
                  <div className="text-sm text-yellow-700">
                    <strong>Advertencia:</strong> Este menú no será visible para ningún usuario si no seleccionas al menos un rol.
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Guardando...
                </>
              ) : (
                "Guardar Permisos"
              )}
            </button>
          </div>
        </form>
      </div>
    </SimpleModal>
  );
}

RolePermissionsModal.propTypes = {
  menu: PropTypes.object.isRequired,
  roles: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};