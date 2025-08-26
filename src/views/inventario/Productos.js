import React, { useState, useEffect } from "react";
import { productoService } from "api/productoService";
import ProductoTable from "components/Cards/ProductoTable";
import ProductoForm from "components/Forms/ProductoForm";
import SimpleModal from "components/Modals/SimpleModal";
import ConfirmationModal from "components/Modals/ConfirmationModal";
import { useToast } from "hooks/useToastSimple";
import { useAuth } from "contexts/AuthContext";

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productoToDelete, setProductoToDelete] = useState(null);
  const { showToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      
      // Obtener sedeId del usuario autenticado
      let sedeId = null;
      if (user?.sedes && Array.isArray(user.sedes) && user.sedes.length > 0) {
        sedeId = user.sedes[0].id;
        console.log('🏢 Using user sede:', user.sedes[0].nombre, '(ID:', sedeId, ')');
      } else if (user?.sedeId) {
        sedeId = user.sedeId;
        console.log('🏢 Using user sedeId:', sedeId);
      } else {
        console.log('🏢 No sede found for user, fetching all products');
      }
      
      const response = await productoService.getAll(sedeId);
      
      console.log('🔍 Full API response:', response);
      console.log('🔍 Response data:', response.data);
      
      // Verificar diferentes estructuras de respuesta posibles
      let productosData = [];
      
      if (Array.isArray(response.data)) {
        // La respuesta directa es un array
        productosData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        // La respuesta tiene estructura { data: [...] }
        productosData = response.data.data;
      } else if (response.data && Array.isArray(response.data.productos)) {
        // La respuesta tiene estructura { productos: [...] }
        productosData = response.data.productos;
      } else {
        // Fallback: intentar convertir a array o usar array vacío
        console.warn('⚠️ Unexpected response structure:', response.data);
        productosData = [];
      }
      
      setProductos(productosData);
      console.log('✅ Productos loaded:', productosData.length, 'items');
    } catch (error) {
      console.error('❌ Error fetching productos:', error);
      showToast('Error al cargar productos. Mostrando mensaje informativo.', 'warning');
      // No romper la UI, mantener array vacío
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = () => {
    setSelectedProducto(null);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEditProduct = (producto) => {
    setSelectedProducto(producto);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDeleteProduct = (producto) => {
    setProductoToDelete(producto);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await productoService.delete(productoToDelete.id);
      await fetchProductos();
      showToast('Producto eliminado correctamente', 'success');
      setShowDeleteModal(false);
      setProductoToDelete(null);
    } catch (error) {
      console.error('Error deleting producto:', error);
      const errorMessage = error.response?.data?.message || 'Error al eliminar producto';
      showToast(errorMessage, 'error');
    }
  };

  const handleSubmitForm = async (formData) => {
    try {
      if (isEditing) {
        await productoService.update(selectedProducto.id, formData);
        showToast('Producto actualizado correctamente', 'success');
      } else {
        await productoService.create(formData);
        showToast('Producto creado correctamente', 'success');
      }
      
      await fetchProductos();
      setShowForm(false);
      setSelectedProducto(null);
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = error.response?.data?.message || 'Error al guardar producto';
      showToast(errorMessage, 'error');
      throw error;
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setSelectedProducto(null);
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
                    Gestión de Productos
                  </h3>
                  <p className="text-sm text-blueGray-500 mt-1">
                    Administre el catálogo de productos de su inventario
                  </p>
                </div>
                <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
                  <button
                    className="bg-lightBlue-500 text-white active:bg-lightBlue-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={handleCreateProduct}
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Nuevo Producto
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de productos */}
          <ProductoTable
            productos={productos}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            loading={loading}
          />
        </div>
      </div>

      {/* Modal de formulario */}
      <SimpleModal isOpen={showForm} onClose={handleCancelForm}>
        <div className="max-w-4xl w-full bg-white overflow-visible">
          <ProductoForm
            producto={selectedProducto}
            onSubmit={handleSubmitForm}
            onCancel={handleCancelForm}
            isEditing={isEditing}
          />
        </div>
      </SimpleModal>

      {/* Modal de confirmación de eliminación */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Eliminar Producto"
        message={`¿Está seguro que desea eliminar el producto "${productoToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </>
  );
}