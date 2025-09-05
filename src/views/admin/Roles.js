import React, { useState, useEffect } from "react";
import { rolService } from "api/rolService.js";
import SimpleModal from "components/Modals/SimpleModal.js";
import ConfirmationModal from "components/Modals/ConfirmationModal.js";

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [editingRol, setEditingRol] = useState(null);
  const [rolToDelete, setRolToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: ""
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const data = await rolService.getAllRoles();
      setRoles(data);
    } catch (err) {
      setError("Error al cargar roles");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRol) {
        await rolService.updateRol(editingRol.id, formData);
      } else {
        await rolService.createRol(formData);
      }
      setShowModal(false);
      setEditingRol(null);
      setFormData({ nombre: "", descripcion: "" });
      fetchRoles();
    } catch (err) {
      setError("Error al guardar rol");
    }
  };

  const handleEdit = (rol) => {
    setEditingRol(rol);
    setFormData({
      nombre: rol.nombre,
      descripcion: rol.descripcion || ""
    });
    setShowModal(true);
  };

  const handleDelete = (rol) => {
    setRolToDelete(rol);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    if (!rolToDelete) return;
    
    try {
      setDeleteLoading(true);
      await rolService.deleteRol(rolToDelete.id);
      setShowDeleteConfirmation(false);
      setRolToDelete(null);
      fetchRoles();
    } catch (err) {
      setError("Error al eliminar rol");
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setRolToDelete(null);
    setDeleteLoading(false);
  };

  const openCreateModal = () => {
    setEditingRol(null);
    setFormData({ nombre: "", descripcion: "" });
    setShowModal(true);
  };

  if (loading) return <div className="p-4">Cargando roles...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <>
      <div className="flex flex-wrap">
        <div className="w-full px-4">
          <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
            <div className="rounded-t mb-0 px-4 py-3 border-0">
              <div className="flex flex-wrap items-center">
                <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                  <h3 className="font-semibold text-base text-blueGray-700">
                    Gestión de Roles
                  </h3>
                </div>
                <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
                  <button
                    className="bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={openCreateModal}
                  >
                    Nuevo Rol
                  </button>
                </div>
              </div>
            </div>

            <div className="block w-full overflow-x-auto">
              <table className="items-center w-full bg-transparent border-collapse">
                <thead>
                  <tr>
                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                      ID
                    </th>
                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                      Nombre
                    </th>
                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                      <i className="fas fa-users mr-1"></i>Usuarios
                    </th>
                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                      <i className="fas fa-list mr-1"></i>Menús
                    </th>
                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {roles.map((rol) => (
                    <tr key={rol.id}>
                      <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left text-blueGray-700">
                        {rol.id}
                      </th>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        {rol.nombre}
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        <div className="flex items-center">
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-blue-800 bg-blue-200 rounded-full">
                            <i className="fas fa-user-friends mr-1"></i>
                            {rol.cantidadUsuarios || 0}
                          </span>
                          <span className="ml-1 text-blueGray-500">
                            {rol.cantidadUsuarios === 1 ? 'usuario' : 'usuarios'}
                          </span>
                        </div>
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        <div className="flex items-center">
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-green-800 bg-green-200 rounded-full">
                            <i className="fas fa-bars mr-1"></i>
                            {rol.cantidadMenus || 0}
                          </span>
                          <span className="ml-1 text-blueGray-500">
                            {rol.cantidadMenus === 1 ? 'menú' : 'menús'}
                          </span>
                        </div>
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        <button
                          className="text-blue-500 hover:text-blue-700 mr-3"
                          onClick={() => handleEdit(rol)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(rol)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de formulario */}
      <SimpleModal isOpen={showModal} onClose={() => setShowModal(false)}>
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
                {editingRol ? "Editar Rol" : "Nuevo Rol"}
              </h3>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-blueGray-600 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  placeholder="Nombre del rol"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase text-blueGray-600 mb-2">
                  Descripción
                </label>
                <textarea
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  rows="3"
                  placeholder="Descripción del rol"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                />
              </div>
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
                onClick={() => setShowModal(false)}
                className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                style={{ 
                  display: 'inline-flex',
                  backgroundColor: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                style={{ 
                  display: 'inline-flex',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  minWidth: '80px',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <i className="fas fa-save mr-2"></i>
                {editingRol ? "Actualizar" : "Crear"}
              </button>
            </div>
          </form>
        </div>
      </SimpleModal>

      {/* Modal de confirmación de eliminación */}
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        title="Eliminar Rol"
        message={`¿Está seguro de que quiere eliminar el rol "${rolToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        loading={deleteLoading}
      />
    </>
  );
}