import React, { useState, useEffect } from "react";
import MenuTable from "components/Cards/MenuTable.js";
import MenuForm from "components/Forms/MenuForm.js";
import RolePermissionsModal from "components/Modals/RolePermissionsModal.js";
import ConfirmationModal from "components/Modals/ConfirmationModal.js";
import ToastContainer from "components/Notifications/ToastContainer.js";
import { menuAdminService } from "api/menuAdminService.js";
import { useAuth } from "contexts/AuthContext.js";
import { useToast } from "hooks/useToast.js";

export default function MenuAdmin() {
  const [menus, setMenus] = useState([]);
  const [roles, setRoles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [editingMenu, setEditingMenu] = useState(null);
  const [menuToDelete, setMenuToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const { user } = useAuth();
  const { toasts, success, error, warning, removeToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      
      const [menusResponse, rolesResponse, categoriesResponse] = await Promise.all([
        menuAdminService.getAllMenus(),
        menuAdminService.getAllRoles(),
        menuAdminService.getAllCategorias().catch(() => []) // Opcional si falla
      ]);
      
      setMenus(menusResponse || []);
      setRoles(rolesResponse || []);
      setCategories(categoriesResponse || []);
      
      // Calcular estadísticas
      try {
        const statsResponse = await menuAdminService.getMenuStats();
        setStats(statsResponse);
      } catch (statsError) {
        console.warn("Could not load stats:", statsError);
      }
      
    } catch (loadError) {
      console.error("Error loading menu admin data:", loadError);
      setErrorMsg("Error al cargar los datos. Por favor, intenta nuevamente.");
      error("Error al cargar los datos del sistema");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMenu = () => {
    setEditingMenu(null);
    setShowForm(true);
  };

  const handleEditMenu = (menu) => {
    setEditingMenu(menu);
    setShowForm(true);
  };

  const handleDeleteMenu = (menuId) => {
    const menu = menus.find(m => m.id === menuId);
    setMenuToDelete(menu);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteMenu = async () => {
    if (!menuToDelete) return;
    
    try {
      setDeleteLoading(true);
      await menuAdminService.deleteMenu(menuToDelete.id);
      success(`Menú "${menuToDelete.nombre}" eliminado correctamente`);
      setShowDeleteConfirmation(false);
      setMenuToDelete(null);
      await loadData();
    } catch (deleteError) {
      console.error("Error deleting menu:", deleteError);
      setErrorMsg(deleteError.message || "Error al eliminar el menú");
      error("Error al eliminar el menú");
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDeleteMenu = () => {
    setShowDeleteConfirmation(false);
    setMenuToDelete(null);
    setDeleteLoading(false);
  };

  const handleManagePermissions = (menu) => {
    setSelectedMenu(menu);
    setShowPermissions(true);
  };

  const handleFormSubmit = async (menuData) => {
    try {
      if (editingMenu) {
        await menuAdminService.updateMenu(editingMenu.id, menuData);
        success(`Menú "${menuData.nombre}" actualizado correctamente`);
      } else {
        await menuAdminService.createMenu(menuData);
        success(`Menú "${menuData.nombre}" creado correctamente`);
      }
      setShowForm(false);
      await loadData();
    } catch (submitError) {
      console.error("Error saving menu:", submitError);
      error(submitError.message || "Error al guardar el menú");
      throw submitError;
    }
  };

  const handlePermissionsUpdate = async (menuId, roleIds) => {
    try {
      // The role permissions modal already handles the update,
      // we just need to refresh the data and close the modal
      const menuName = selectedMenu?.nombre || "menú";
      success(`Permisos del ${menuName} actualizados correctamente`);
      setShowPermissions(false);
      await loadData();
    } catch (permissionError) {
      console.error("Error updating permissions:", permissionError);
      error("Error al actualizar los permisos");
      throw permissionError;
    }
  };

  const handleSearch = async (term) => {
    if (!term.trim()) {
      loadData();
      return;
    }
    
    try {
      setLoading(true);
      const searchResults = await menuAdminService.searchMenus(term);
      setMenus(searchResults || []);
    } catch (searchError) {
      console.error("Error searching menus:", searchError);
      setErrorMsg("Error al buscar menús");
      error("Error al buscar menús");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = async (categoria) => {
    if (!categoria) {
      loadData();
      return;
    }
    
    try {
      setLoading(true);
      const filteredResults = await menuAdminService.getMenusByCategoria(categoria);
      setMenus(filteredResults || []);
    } catch (filterError) {
      console.error("Error filtering by category:", filterError);
      setErrorMsg("Error al filtrar por categoría");
      error("Error al filtrar por categoría");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setSelectedCategory("");
    loadData();
  };

  if (loading) {
    return (
      <div className="flex flex-wrap">
        <div className="w-full px-4">
          <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
            <div className="px-6 py-8 text-center">
              <i className="fas fa-spinner fa-spin text-3xl text-blueGray-400 mb-4"></i>
              <p className="text-blueGray-500">Cargando administración de menús...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex flex-wrap">
        <div className="w-full px-4">
          <div className="relative flex flex-col min-w-0 break-words bg-red-50 w-full mb-6 shadow-lg rounded border-l-4 border-red-500">
            <div className="px-6 py-6">
              <div className="flex items-center">
                <i className="fas fa-exclamation-triangle text-red-500 text-xl mr-3"></i>
                <div>
                  <h3 className="font-semibold text-red-700">Error</h3>
                  <p className="text-red-600">{errorMsg}</p>
                </div>
                <button
                  onClick={handleRefresh}
                  className="ml-auto bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                >
                  <i className="fas fa-redo mr-1"></i>
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Estadísticas (si están disponibles) */}
      {stats && (
        <div className="flex flex-wrap mb-6">
          <div className="w-full xl:w-3/12 lg:w-6/12 px-4">
            <div className="relative flex flex-col min-w-0 break-words bg-white rounded mb-6 xl:mb-0 shadow-lg">
              <div className="flex-auto p-4">
                <div className="flex flex-wrap">
                  <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
                    <h5 className="text-blueGray-400 uppercase font-bold text-xs">Total Menús</h5>
                    <span className="font-semibold text-xl text-blueGray-700">
                      {stats.totalMenus}
                    </span>
                  </div>
                  <div className="relative w-auto pl-4 flex-initial">
                    <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-blue-500">
                      <i className="fas fa-list"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full xl:w-3/12 lg:w-6/12 px-4">
            <div className="relative flex flex-col min-w-0 break-words bg-white rounded mb-6 xl:mb-0 shadow-lg">
              <div className="flex-auto p-4">
                <div className="flex flex-wrap">
                  <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
                    <h5 className="text-blueGray-400 uppercase font-bold text-xs">Categorías</h5>
                    <span className="font-semibold text-xl text-blueGray-700">
                      {stats.totalCategories}
                    </span>
                  </div>
                  <div className="relative w-auto pl-4 flex-initial">
                    <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-emerald-500">
                      <i className="fas fa-tags"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full xl:w-3/12 lg:w-6/12 px-4">
            <div className="relative flex flex-col min-w-0 break-words bg-white rounded mb-6 xl:mb-0 shadow-lg">
              <div className="flex-auto p-4">
                <div className="flex flex-wrap">
                  <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
                    <h5 className="text-blueGray-400 uppercase font-bold text-xs">Roles Totales</h5>
                    <span className="font-semibold text-xl text-blueGray-700">
                      {stats.totalRoles}
                    </span>
                  </div>
                  <div className="relative w-auto pl-4 flex-initial">
                    <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-orange-500">
                      <i className="fas fa-users"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full xl:w-3/12 lg:w-6/12 px-4">
            <div className="relative flex flex-col min-w-0 break-words bg-white rounded mb-6 xl:mb-0 shadow-lg">
              <div className="flex-auto p-4">
                <div className="flex flex-wrap">
                  <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
                    <h5 className="text-blueGray-400 uppercase font-bold text-xs">Usuario Actual</h5>
                    <span className="font-semibold text-xl text-blueGray-700">
                      {user?.nombreCompleto || user?.username || 'Admin'}
                    </span>
                  </div>
                  <div className="relative w-auto pl-4 flex-initial">
                    <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-purple-500">
                      <i className="fas fa-user"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap">
        <div className="w-full px-4">
          <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
            <div className="rounded-t mb-0 px-4 py-3 border-0">
              <div className="flex flex-wrap items-center mb-4">
                <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                  <h3 className="font-semibold text-base text-blueGray-700">
                    Administración de Menús
                  </h3>
                  <p className="text-sm text-blueGray-400">
                    Gestiona los menús del sistema y sus permisos por rol
                  </p>
                </div>
                <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
                  <button
                    className="bg-blueGray-500 text-white active:bg-blueGray-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-2 mb-1 ease-linear transition-all duration-150"
                    onClick={handleRefresh}
                    title="Actualizar datos"
                  >
                    <i className="fas fa-sync-alt mr-1"></i>
                    Actualizar
                  </button>
                  <button
                    className="bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    onClick={handleCreateMenu}
                  >
                    <i className="fas fa-plus mr-1"></i>
                    Nuevo Menú
                  </button>
                </div>
              </div>

              {/* Barra de búsqueda y filtros */}
              <div className="flex flex-wrap items-center gap-4 px-4 py-3 bg-blueGray-50 rounded">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar menús por nombre..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
                      className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 pl-10"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-search text-blueGray-400"></i>
                    </div>
                  </div>
                </div>
                <div className="min-w-48">
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      handleCategoryFilter(e.target.value);
                    }}
                    className="border-0 px-3 py-2 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => handleSearch(searchTerm)}
                  className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  <i className="fas fa-search mr-1"></i>
                  Buscar
                </button>
              </div>
            </div>

            <MenuTable
              menus={menus}
              roles={roles}
              onEdit={handleEditMenu}
              onDelete={handleDeleteMenu}
              onManagePermissions={handleManagePermissions}
            />
          </div>
        </div>
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <MenuForm
          menu={editingMenu}
          roles={roles}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Modal de permisos */}
      {showPermissions && selectedMenu && (
        <RolePermissionsModal
          menu={selectedMenu}
          roles={roles}
          onSubmit={handlePermissionsUpdate}
          onCancel={() => setShowPermissions(false)}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirmation && menuToDelete && (
        <ConfirmationModal
          isOpen={showDeleteConfirmation}
          title="Eliminar Menú"
          message={`¿Estás seguro de que quieres eliminar el menú "${menuToDelete.nombre}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          type="danger"
          onConfirm={confirmDeleteMenu}
          onCancel={cancelDeleteMenu}
          loading={deleteLoading}
        />
      )}

      {/* Contenedor de notificaciones */}
      <ToastContainer 
        toasts={toasts} 
        onRemoveToast={removeToast} 
      />
    </>
  );
}