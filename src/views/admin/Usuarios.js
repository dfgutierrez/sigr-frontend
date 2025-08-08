import React, { useState, useEffect } from "react";
import { useUsuarios } from "hooks/useUsuarios.js";
import { useToast } from "hooks/useToast.js";
import SimpleModal from "components/Modals/SimpleModal.js";
import ConfirmationModal from "components/Modals/ConfirmationModal.js";
import UserForm from "components/Forms/UserForm.js";
import Button from "components/UI/Button.js";
import LoadingSpinner from "components/UI/LoadingSpinner.js";
import Card from "components/UI/Card.js";

export default function Usuarios() {
  const {
    usuarios,
    sedes,
    roles,
    loading,
    error,
    loadInitialData,
    createUsuario,
    updateUsuario,
    toggleUsuarioEstado,
    clearError
  } = useUsuarios();

  const { showToast } = useToast();
  
  const [showModal, setShowModal] = useState(false);
  const [showStatusConfirmation, setShowStatusConfirmation] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [usuarioToToggle, setUsuarioToToggle] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleFormSubmit = async (userData, selectedImage) => {
    try {
      setFormLoading(true);
      clearError();
      
      if (editingUsuario) {
        await updateUsuario(editingUsuario.id, userData, selectedImage);
        showToast("Usuario actualizado exitosamente", "success");
      } else {
        await createUsuario(userData, selectedImage);
        showToast("Usuario creado exitosamente", "success");
      }
      
      setShowModal(false);
      setEditingUsuario(null);
    } catch (err) {
      showToast(err.message || "Error al guardar usuario", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (usuario) => {
    setEditingUsuario(usuario);
    setShowModal(true);
  };

  const handleToggleStatus = (usuario) => {
    setUsuarioToToggle(usuario);
    setShowStatusConfirmation(true);
  };

  const confirmToggleStatus = async () => {
    if (!usuarioToToggle) return;
    
    try {
      setStatusLoading(true);
      await toggleUsuarioEstado(usuarioToToggle.id);
      showToast(
        `Usuario ${usuarioToToggle.estado ? 'desactivado' : 'activado'} exitosamente`, 
        "success"
      );
      setShowStatusConfirmation(false);
      setUsuarioToToggle(null);
    } catch (err) {
      showToast(err.message || "Error al cambiar estado del usuario", "error");
    } finally {
      setStatusLoading(false);
    }
  };

  const cancelToggleStatus = () => {
    setShowStatusConfirmation(false);
    setUsuarioToToggle(null);
  };

  const openCreateModal = () => {
    setEditingUsuario(null);
    setShowModal(true);
  };

  const getSedeNombre = (usuario) => {
    // Buscar por sedeId primero, luego por sede.nombre si viene el objeto completo
    if (usuario.sede && usuario.sede.nombre) {
      return usuario.sede.nombre;
    }
    const sedeId = usuario.sedeId || usuario.sede_id;
    const sede = sedes.find(s => s.id === sedeId);
    return sede ? sede.nombre : 'Sin sede';
  };

  const getUserRolesText = (usuario) => {
    if (usuario.roles && usuario.roles.length > 0) {
      return usuario.roles.map(role => role.nombre).join(', ');
    }
    return 'Sin roles asignados';
  };

  if (loading) return <LoadingSpinner text="Cargando usuarios..." />;
  if (error) return (
    <div className="p-4 text-red-600 text-center">
      <i className="fas fa-exclamation-triangle mr-2"></i>
      {error}
    </div>
  );

  return (
    <>
      <div className="flex flex-wrap">
        <div className="w-full px-4">
          <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
            <div className="rounded-t mb-0 px-4 py-3 border-0">
              <div className="flex flex-wrap items-center">
                <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                  <h3 className="font-semibold text-base text-blueGray-700">
                    Gestión de Usuarios
                  </h3>
                </div>
                <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
                  <Button
                    onClick={openCreateModal}
                    variant="primary"
                    icon="fas fa-plus"
                  >
                    Nuevo Usuario
                  </Button>
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
                      Nombre Completo
                    </th>
                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                      Usuario
                    </th>
                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                      Sede
                    </th>
                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                      Roles
                    </th>
                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                      Estado
                    </th>
                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id} className={usuario.estado === false ? 'opacity-60 bg-gray-50' : ''}>
                      <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left text-blueGray-700">
                        {usuario.id}
                      </th>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        <div className="flex items-center">
                          {(usuario.fotoUrl || usuario.foto_url) && (
                            <img
                              src={usuario.fotoUrl || usuario.foto_url}
                              alt="Foto"
                              className="w-8 h-8 rounded-full mr-2 object-cover"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          )}
                          <span>{usuario.nombreCompleto || usuario.nombre_completo || usuario.nombre}</span>
                        </div>
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        {usuario.username}
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        {getSedeNombre(usuario)}
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        {getUserRolesText(usuario)}
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          usuario.estado !== false 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {usuario.estado !== false ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        <button
                          className="text-blue-500 hover:text-blue-700 mr-3"
                          onClick={() => handleEdit(usuario)}
                          title="Editar usuario"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className={`${usuario.estado !== false ? 'text-orange-500 hover:text-orange-700' : 'text-green-500 hover:text-green-700'}`}
                          onClick={() => handleToggleStatus(usuario)}
                          title={usuario.estado !== false ? 'Desactivar usuario' : 'Activar usuario'}
                        >
                          <i className={`fas ${usuario.estado !== false ? 'fa-user-slash' : 'fa-user-check'}`}></i>
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
        <div className="max-w-4xl w-full bg-white rounded-lg overflow-visible">
          <UserForm
            editingUser={editingUsuario}
            sedes={sedes}
            roles={roles}
            onSubmit={handleFormSubmit}
            onCancel={() => setShowModal(false)}
            loading={formLoading}
          />
        </div>
      </SimpleModal>

      {/* Modal de confirmación de cambio de estado */}
      <ConfirmationModal
        isOpen={showStatusConfirmation}
        title={`${usuarioToToggle?.estado ? 'Desactivar' : 'Activar'} Usuario`}
        message={`¿Está seguro de que quiere ${usuarioToToggle?.estado ? 'desactivar' : 'activar'} al usuario "${usuarioToToggle?.nombreCompleto || usuarioToToggle?.nombre_completo || usuarioToToggle?.nombre}"?`}
        confirmText={usuarioToToggle?.estado ? 'Desactivar' : 'Activar'}
        cancelText="Cancelar"
        type={usuarioToToggle?.estado ? 'warning' : 'success'}
        onConfirm={confirmToggleStatus}
        onCancel={cancelToggleStatus}
        loading={statusLoading}
      />
    </>
  );
}