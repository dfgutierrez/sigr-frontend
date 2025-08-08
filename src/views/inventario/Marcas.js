import React, { useState, useEffect } from "react";
import { marcaService } from "api/marcaService";
import MarcaTable from "components/Cards/MarcaTable";
import MarcaForm from "components/Forms/MarcaForm";
import SimpleModal from "components/Modals/SimpleModal";
import ConfirmationModal from "components/Modals/ConfirmationModal";
import { useToast } from "hooks/useToastSimple";

export default function Marcas() {
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedMarca, setSelectedMarca] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [marcaToDelete, setMarcaToDelete] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchMarcas();
  }, []);

  const fetchMarcas = async () => {
    try {
      setLoading(true);
      const response = await marcaService.getAllMarcas();
      
      console.log('🔍 Full marcas API response:', response);
      console.log('🔍 Response type:', typeof response);
      console.log('🔍 Is array:', Array.isArray(response));
      
      // Verificar diferentes estructuras de respuesta posibles
      let marcasData = [];
      
      if (Array.isArray(response)) {
        // Respuesta directa es array
        marcasData = response;
        console.log('📋 Using direct array response');
      } else if (response && Array.isArray(response.data)) {
        // Respuesta tiene estructura { data: [...] }
        marcasData = response.data;
        console.log('📋 Using response.data array');
      } else if (response && response.success && Array.isArray(response.data)) {
        // Respuesta tiene estructura { success: true, data: [...] }
        marcasData = response.data;
        console.log('📋 Using response.data from success response');
      } else {
        console.warn('⚠️ Unexpected marcas response structure:', response);
        console.warn('⚠️ Response keys:', Object.keys(response || {}));
        marcasData = [];
      }
      
      setMarcas(marcasData);
      console.log('✅ Marcas loaded:', marcasData.length, 'items');
      console.log('✅ First marca:', marcasData[0]);
    } catch (error) {
      console.error('❌ Error fetching marcas:', error);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error data:', error.response?.data);
      console.error('❌ Full error:', error);
      
      // Manejar diferentes tipos de errores
      if (error.response?.status === 401 || error.response?.status === 403) {
        showToast('Sesión expirada. Por favor, inicie sesión nuevamente.', 'error');
      } else if (error.response?.status === 404) {
        showToast('Endpoint de marcas no encontrado. Verifique la configuración del servidor.', 'warning');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        showToast('Error de conexión. Verifique que el servidor esté ejecutándose.', 'error');
      } else {
        showToast(`Error al cargar marcas: ${error.response?.data?.message || error.message}`, 'error');
      }
      
      setMarcas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMarca = () => {
    setSelectedMarca(null);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEditMarca = (marca) => {
    setSelectedMarca(marca);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDeleteMarca = (marca) => {
    setMarcaToDelete(marca);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await marcaService.delete(marcaToDelete.id);
      await fetchMarcas();
      showToast('Marca eliminada correctamente', 'success');
      setShowDeleteModal(false);
      setMarcaToDelete(null);
    } catch (error) {
      console.error('Error deleting marca:', error);
      const errorMessage = error.response?.data?.message || 'Error al eliminar marca';
      showToast(errorMessage, 'error');
    }
  };

  const handleSubmitForm = async (formData) => {
    try {
      if (isEditing) {
        await marcaService.update(selectedMarca.id, formData);
        showToast('Marca actualizada correctamente', 'success');
      } else {
        await marcaService.create(formData);
        showToast('Marca creada correctamente', 'success');
      }
      
      await fetchMarcas();
      setShowForm(false);
      setSelectedMarca(null);
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = error.response?.data?.message || 'Error al guardar marca';
      showToast(errorMessage, 'error');
      throw error;
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setSelectedMarca(null);
    setIsEditing(false);
  };

  return (
    <>
      <div className="flex flex-wrap mt-4">
        <div className="w-full mb-12 px-4">
          {/* Header */}
          <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded bg-white">
            <div className="rounded-t mb-0 px-4 py-3 border-0">
              <div className="flex flex-wrap items-center">
                <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                  <h3 className="font-semibold text-base text-blueGray-700">
                    Gestión de Marcas
                  </h3>
                  <p className="text-sm text-blueGray-500 mt-1">
                    <i className="fas fa-trademark mr-1"></i>
                    Administre las marcas de productos y vehículos del sistema.
                  </p>
                </div>
                <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
                  <button
                    className="bg-lightBlue-500 text-white active:bg-lightBlue-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-3 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={fetchMarcas}
                    disabled={loading}
                  >
                    <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-sync-alt'} mr-2`}></i>
                    {loading ? 'Cargando...' : 'Cargar Marcas'}
                  </button>
                  <button
                    className="bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={handleCreateMarca}
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Nueva Marca
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de marcas */}
          <MarcaTable
            marcas={marcas}
            onEdit={handleEditMarca}
            onDelete={handleDeleteMarca}
            loading={loading}
          />
        </div>
      </div>

      {/* Modal de formulario */}
      <SimpleModal
        isOpen={showForm}
        onClose={handleCancelForm}
        title={isEditing ? "Editar Marca" : "Nueva Marca"}
        size="md"
      >
        <MarcaForm
          marca={selectedMarca}
          onSubmit={handleSubmitForm}
          onCancel={handleCancelForm}
          isEditing={isEditing}
        />
      </SimpleModal>

      {/* Modal de confirmación de eliminación */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Eliminar Marca"
        message={`¿Está seguro que desea eliminar la marca "${marcaToDelete?.nombre}"? Esta acción puede afectar vehículos asociados.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </>
  );
}