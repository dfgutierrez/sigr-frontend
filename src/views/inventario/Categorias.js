import React, { useState, useEffect } from "react";
import { categoriaService } from "api/categoriaService";
import CategoriaTable from "components/Cards/CategoriaTable";
import CategoriaForm from "components/Forms/CategoriaForm";
import SimpleModal from "components/Modals/SimpleModal";
import ConfirmationModal from "components/Modals/ConfirmationModal";
import { useToast } from "hooks/useToastSimple";

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoriaToDelete, setCategoriaToDelete] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
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
      showToast('Error al cargar categorías', 'error');
      // No romper la UI, mantener array vacío
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategoria = () => {
    setSelectedCategoria(null);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEditCategoria = (categoria) => {
    setSelectedCategoria(categoria);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDeleteCategoria = (categoria) => {
    setCategoriaToDelete(categoria);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await categoriaService.delete(categoriaToDelete.id);
      await fetchCategorias();
      showToast('Categoría eliminada correctamente', 'success');
      setShowDeleteModal(false);
      setCategoriaToDelete(null);
    } catch (error) {
      console.error('Error deleting categoria:', error);
      const errorMessage = error.response?.data?.message || 'Error al eliminar categoría';
      showToast(errorMessage, 'error');
    }
  };

  const handleSubmitForm = async (formData) => {
    try {
      if (isEditing) {
        await categoriaService.update(selectedCategoria.id, formData);
        showToast('Categoría actualizada correctamente', 'success');
      } else {
        await categoriaService.create(formData);
        showToast('Categoría creada correctamente', 'success');
      }
      
      await fetchCategorias();
      setShowForm(false);
      setSelectedCategoria(null);
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = error.response?.data?.message || 'Error al guardar categoría';
      showToast(errorMessage, 'error');
      throw error;
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setSelectedCategoria(null);
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
                    Gestión de Categorías
                  </h3>
                  <p className="text-sm text-blueGray-500 mt-1">
                    Organice y clasifique sus productos por categorías
                  </p>
                </div>
                <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
                  <button
                    className="bg-lightBlue-500 text-white active:bg-lightBlue-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={handleCreateCategoria}
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Nueva Categoría
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de categorías */}
          <CategoriaTable
            categorias={categorias}
            onEdit={handleEditCategoria}
            onDelete={handleDeleteCategoria}
            loading={loading}
          />
        </div>
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <CategoriaForm
          categoria={selectedCategoria}
          onSubmit={handleSubmitForm}
          onCancel={handleCancelForm}
          isEditing={isEditing}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Eliminar Categoría"
        message={`¿Está seguro que desea eliminar la categoría "${categoriaToDelete?.nombre}"? Esta acción eliminará también todos los productos asociados.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </>
  );
}