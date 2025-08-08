import React, { useState, useEffect } from "react";
import { menuAdminService } from "api/menuAdminService.js";
import { useAuth } from "contexts/AuthContext.js";

export default function MenuAdminSimple() {
  const [menus, setMenus] = useState([]);
  const [roles, setRoles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("📡 MenuAdminSimple: Loading data...");
      
      // Cargar datos con fallbacks
      const [menusResponse, rolesResponse, categoriesResponse] = await Promise.allSettled([
        menuAdminService.getAllMenus(),
        menuAdminService.getAllRoles(),
        menuAdminService.getAllCategorias()
      ]);
      
      // Procesar respuestas con manejo de errores
      const menusData = menusResponse.status === 'fulfilled' ? menusResponse.value : [];
      const rolesData = rolesResponse.status === 'fulfilled' ? rolesResponse.value : [];
      const categoriesData = categoriesResponse.status === 'fulfilled' ? categoriesResponse.value : [];
      
      setMenus(menusData);
      setRoles(rolesData);
      setCategories(categoriesData);
      
      // Calcular estadísticas básicas
      const stats = {
        totalMenus: menusData.length,
        totalRoles: rolesData.length,
        totalCategories: categoriesData.length,
        menusByCategory: {}
      };
      
      // Calcular menús por categoría
      menusData.forEach(menu => {
        const categoria = menu.categoria || 'Sin categoría';
        stats.menusByCategory[categoria] = (stats.menusByCategory[categoria] || 0) + 1;
      });
      
      setStats(stats);
      
      console.log("✅ MenuAdminSimple: Data loaded successfully", {
        menus: menusData.length,
        roles: rolesData.length,
        categories: categoriesData.length
      });
      
    } catch (error) {
      console.error("❌ MenuAdminSimple: Error loading data:", error);
      setError("Error al cargar los datos. Algunos endpoints del backend no están disponibles.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setSelectedCategory("");
    loadData();
  };

  const getFilteredMenus = () => {
    let filtered = menus;
    
    if (searchTerm) {
      filtered = filtered.filter(menu => 
        menu.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(menu => menu.categoria === selectedCategory);
    }
    
    return filtered.sort((a, b) => {
      if (a.categoria !== b.categoria) {
        return a.categoria.localeCompare(b.categoria);
      }
      return (a.orden || 0) - (b.orden || 0);
    });
  };

  const getIconClass = (iconName) => {
    const iconMap = {
      'fa-tv': 'fas fa-tv',
      'fa-users': 'fas fa-users',
      'fa-building': 'fas fa-building',
      'fa-user-tag': 'fas fa-user-tag',
      'fa-car': 'fas fa-car',
      'fa-chart-bar': 'fas fa-chart-bar',
      'fa-tools': 'fas fa-tools',
      'fa-boxes': 'fas fa-boxes',
      'fa-tags': 'fas fa-tags',
      'dashboard': 'fas fa-tv',
      'users': 'fas fa-users',
      'sedes': 'fas fa-building',
      'roles': 'fas fa-user-tag',
      'vehiculos': 'fas fa-car',
      'reports': 'fas fa-chart-bar',
      'settings': 'fas fa-tools'
    };
    
    return iconMap[iconName] || 'fas fa-circle';
  };

  const filteredMenus = getFilteredMenus();

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

  return (
    <>
      {/* Estadísticas */}
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
                    <h5 className="text-blueGray-400 uppercase font-bold text-xs">Roles</h5>
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
                    <h5 className="text-blueGray-400 uppercase font-bold text-xs">Usuario</h5>
                    <span className="font-semibold text-xl text-blueGray-700">
                      {user?.username || 'Admin'}
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
                    Visualización de Menús del Sistema
                  </h3>
                  <p className="text-sm text-blueGray-400">
                    Vista de solo lectura - Los endpoints de edición necesitan ser implementados en el backend
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
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    Solo lectura
                  </span>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                  <div className="flex">
                    <i className="fas fa-exclamation-triangle text-yellow-400 mr-2 mt-0.5"></i>
                    <div className="text-sm text-yellow-700">
                      <strong>Información:</strong> {error}
                    </div>
                  </div>
                </div>
              )}

              {/* Filtros */}
              <div className="flex flex-wrap items-center gap-4 px-4 py-3 bg-blueGray-50 rounded">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar menús por nombre..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
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
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border-0 px-3 py-2 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="text-sm text-blueGray-500">
                  {filteredMenus.length} de {menus.length} menús
                </div>
              </div>
            </div>

            {/* Tabla de menús */}
            <div className="block w-full overflow-x-auto">
              <table className="items-center w-full bg-transparent border-collapse">
                <thead>
                  <tr>
                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                      Menú
                    </th>
                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                      Categoría
                    </th>
                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                      Ruta
                    </th>
                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                      Orden
                    </th>
                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                      ID
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMenus.map((menu) => (
                    <tr key={menu.id} className="hover:bg-blueGray-50">
                      <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                        <div className="flex items-center">
                          <i className={`${getIconClass(menu.icono)} mr-2 text-blueGray-500`}></i>
                          <span className="font-bold text-blueGray-700">
                            {menu.nombre}
                          </span>
                        </div>
                      </th>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        <span className="inline-block bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                          {menu.categoria}
                        </span>
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        <code className="bg-blueGray-100 text-blueGray-700 px-2 py-1 rounded text-xs">
                          {menu.ruta}
                        </code>
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        <span className="bg-blueGray-100 text-blueGray-700 px-2 py-1 rounded">
                          {menu.orden}
                        </span>
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        <span className="text-blueGray-500">
                          #{menu.id}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredMenus.length === 0 && (
                <div className="text-center py-8">
                  <i className="fas fa-search text-3xl text-blueGray-300 mb-4"></i>
                  <p className="text-blueGray-500">No se encontraron menús con los filtros aplicados</p>
                </div>
              )}
            </div>

            {/* Información adicional */}
            <div className="px-4 py-4 border-t border-blueGray-200">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="text-sm font-semibold text-blue-700 mb-2">
                  <i className="fas fa-info-circle mr-2"></i>
                  Estado de los Endpoints
                </h4>
                <div className="text-blue-700 text-sm space-y-1">
                  <div>✅ <code>GET /menus/my-menus</code> - Funcionando</div>
                  <div>❌ <code>GET /menus</code> - Error 500</div>
                  <div>❌ <code>GET /roles</code> - Error 500</div>
                  <div>❌ <code>GET /menus/categorias</code> - Error 500</div>
                  <div className="mt-2 text-xs">
                    Para habilitar la edición, implementa estos endpoints en tu backend Spring Boot.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}