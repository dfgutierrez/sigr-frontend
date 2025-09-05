import React, { useState, useEffect } from "react";
import { sedeService } from "api/sedeService.js";
import SimpleModal from "components/Modals/SimpleModal.js";
import ConfirmationModal from "components/Modals/ConfirmationModal.js";

export default function Sedes() {
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [editingSede, setEditingSede] = useState(null);
  const [sedeToDelete, setSedeToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
    telefono: "",
    email: ""
  });

  useEffect(() => {
    fetchSedes();
  }, []);

  const fetchSedes = async () => {
    try {
      setLoading(true);
      const data = await sedeService.getAllSedes();
      setSedes(data);
    } catch (err) {
      setError("Error al cargar sedes");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSede) {
        await sedeService.updateSede(editingSede.id, formData);
      } else {
        await sedeService.createSede(formData);
      }
      setShowModal(false);
      setEditingSede(null);
      setFormData({ nombre: "", direccion: "", telefono: "", email: "" });
      fetchSedes();
    } catch (err) {
      setError("Error al guardar sede");
    }
  };

  const handleEdit = (sede) => {
    setEditingSede(sede);
    setFormData({
      nombre: sede.nombre,
      direccion: sede.direccion || "",
      telefono: sede.telefono || "",
      email: sede.email || ""
    });
    setShowModal(true);
  };

  const handleDelete = (sede) => {
    setSedeToDelete(sede);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    if (!sedeToDelete) return;
    
    try {
      setDeleteLoading(true);
      await sedeService.deleteSede(sedeToDelete.id);
      setShowDeleteConfirmation(false);
      setSedeToDelete(null);
      fetchSedes();
    } catch (err) {
      setError("Error al eliminar sede");
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setSedeToDelete(null);
    setDeleteLoading(false);
  };

  const openCreateModal = () => {
    setEditingSede(null);
    setFormData({ nombre: "", direccion: "", telefono: "", email: "" });
    setShowModal(true);
  };

  if (loading) return <div className="p-4">Cargando sedes...</div>;
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
                    Gestión de Sedes
                  </h3>
                </div>
                <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
                  <button
                    className="bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={openCreateModal}
                  >
                    Nueva Sede
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
                      Dirección
                    </th>
                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                      Teléfono
                    </th>
                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {sedes.map((sede) => (
                    <tr key={sede.id}>
                      <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left text-blueGray-700">
                        {sede.id}
                      </th>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        {sede.nombre}
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        {sede.direccion}
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        {sede.telefono}
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        <button
                          className="text-blue-500 hover:text-blue-700 mr-3"
                          onClick={() => handleEdit(sede)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(sede)}
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
                {editingSede ? "Editar Sede" : "Nueva Sede"}
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
                  placeholder="Nombre de la sede"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase text-blueGray-600 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  placeholder="Dirección completa"
                  value={formData.direccion}
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase text-blueGray-600 mb-2">
                  Teléfono
                </label>
                <input
                  type="text"
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  placeholder="Número de teléfono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase text-blueGray-600 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  placeholder="Correo electrónico"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                {editingSede ? "Actualizar" : "Crear"}
              </button>
            </div>
          </form>
        </div>
      </SimpleModal>

      {/* Modal de confirmación de eliminación */}
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        title="Eliminar Sede"
        message={`¿Está seguro de que quiere eliminar la sede "${sedeToDelete?.nombre}"? Esta acción no se puede deshacer.`}
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