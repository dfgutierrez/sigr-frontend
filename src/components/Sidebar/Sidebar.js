/*eslint-disable*/
import React from "react";
import { Link } from "react-router-dom";

import NotificationDropdown from "components/Dropdowns/NotificationDropdown.js";
import UserDropdown from "components/Dropdowns/UserDropdown.js";
import { menuService } from "api/menuService.js";
import { useAuth } from "contexts/AuthContext.js";

export default function Sidebar() {
  const { user } = useAuth();
  const [collapseShow, setCollapseShow] = React.useState("hidden");
  const [menus, setMenus] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  // Función para verificar si el usuario tiene acceso a un menú
  const hasAccessToMenu = (menu) => {
    if (!user || !user.roles) {
      return false;
    }

    // Obtener los nombres de los roles del usuario
    const userRoleNames = user.roles.map(role => role.nombre || role);
    
    // Verificar si algún rol del usuario coincide con los roles requeridos del menú
    return menu.roles.some(requiredRole => userRoleNames.includes(requiredRole));
  };

  React.useEffect(() => {
    const fetchMenus = async () => {
      try {
        console.log("📡 Sidebar: Starting menu fetch...");
        const menuData = await menuService.getMyMenus();
        console.log("📡 Sidebar: Menus fetched successfully:", menuData);
        
        // Verificar si menuData es un array válido
        const validMenuData = Array.isArray(menuData) ? menuData : [];
        
        // Filtrar menús por roles del usuario (medida de seguridad adicional)
        const accessibleMenus = validMenuData.filter(menu => {
          const hasAccess = hasAccessToMenu(menu);
          if (!hasAccess) {
            console.log(`🚫 Sidebar: User doesn't have access to menu "${menu.nombre}" - Required roles: [${menu.roles.join(', ')}], User roles: [${user?.roles?.map(r => r.nombre || r).join(', ') || 'none'}]`);
          }
          return hasAccess;
        });
        
        // Lógica para determinar si mostrar "Administrar Menús"
        const shouldHideAdminMenu = process.env.REACT_APP_HIDE_ADMIN_MENU === 'true' || false;
        
        const filteredMenus = shouldHideAdminMenu 
          ? accessibleMenus.filter(menu => menu.nombre !== "Administrar Menús")
          : accessibleMenus;
        
        setMenus(filteredMenus);
        console.log(`✅ Sidebar: Final filtered menus (${filteredMenus.length}/${validMenuData.length}):`, filteredMenus.map(m => m.nombre));
        console.log("✅ Sidebar: Menus set successfully:", filteredMenus.length, "items");
      } catch (error) {
        console.error("❌ Sidebar: Error fetching menus:", error);
        console.error("❌ Sidebar: Error details:", error.response?.data);
        console.error("❌ Sidebar: Error status:", error.response?.status);
        
        // Si es error 401, no hacer nada, deja que el interceptor maneje
        // Si es otro error, mostrar menús vacíos pero no cerrar sesión
        if (error.response?.status !== 401) {
          console.log("⚠️ Sidebar: Non-401 error, setting empty menus");
          setMenus([]);
        } else {
          console.log("🚫 Sidebar: 401 error detected, interceptor will handle");
          // El interceptor ya manejará el 401 y cerrará sesión
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  return (
    <>
      <nav className="md:left-0 md:block md:fixed md:top-0 md:bottom-0 md:overflow-y-auto md:flex-row md:flex-nowrap md:overflow-hidden shadow-xl bg-gradient-to-b from-white to-blueGray-50 flex flex-wrap items-center justify-between relative md:w-64 z-10 py-4 px-6">
        <div className="md:flex-col md:items-stretch md:min-h-full md:flex-nowrap px-0 flex flex-wrap items-center justify-between w-full mx-auto">
          {/* Toggler */}
          <button
            className="cursor-pointer text-black opacity-50 md:hidden px-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent"
            type="button"
            onClick={() => setCollapseShow("bg-white m-2 py-3 px-6")}
          >
            <i className="fas fa-bars"></i>
          </button>
          {/* Brand */}
          <Link
            className="md:block text-left md:pb-2 mr-0 inline-block whitespace-nowrap p-4 px-0 group"
            to="/"
          >
            <div className="flex items-center">
              
              <div>
                <h1 className="text-blueGray-800 text-lg font-bold tracking-tight">
                  SIGR
                </h1>
                <p className="text-blueGray-500 text-xs">
                  Sistema de Gestión
                </p>
              </div>
            </div>
          </Link>
          {/* User */}
          <ul className="md:hidden items-center flex flex-wrap list-none">
            <li className="inline-block relative">
              <NotificationDropdown />
            </li>
            <li className="inline-block relative">
              <UserDropdown />
            </li>
          </ul>
          {/* Collapse */}
          <div
            className={
              "md:flex md:flex-col md:items-stretch md:opacity-100 md:relative md:mt-4 md:shadow-none shadow absolute top-0 left-0 right-0 z-40 overflow-y-auto overflow-x-hidden h-auto items-center flex-1 rounded " +
              collapseShow
            }
          >
            {/* Collapse header */}
            <div className="md:min-w-full md:hidden block pb-4 mb-4 border-b border-solid border-blueGray-200">
              <div className="flex flex-wrap">
                <div className="w-6/12">
                  <Link
                    className="md:block text-left md:pb-2 text-blueGray-600 mr-0 inline-block whitespace-nowrap text-sm uppercase font-bold p-4 px-0"
                    to="/"
                  >
                    Sistema de Gestión
                  </Link>
                </div>
                <div className="w-6/12 flex justify-end">
                  <button
                    type="button"
                    className="cursor-pointer text-black opacity-50 md:hidden px-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent"
                    onClick={() => setCollapseShow("hidden")}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
            {/* Form */}
            <form className="mt-6 mb-4 md:hidden">
              <div className="mb-3 pt-0">
                <input
                  type="text"
                  placeholder="Search"
                  className="border-0 px-3 py-2 h-12 border border-solid  border-blueGray-500 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-base leading-snug shadow-none outline-none focus:outline-none w-full font-normal"
                />
              </div>
            </form>

            {loading ? (
              <div className="text-center py-4">
                <i className="fas fa-spinner fa-spin text-blueGray-400"></i>
                <p className="text-xs text-blueGray-500 mt-2">Cargando menús...</p>
              </div>
            ) : (
              <>
                {/* Renderizar menús dinámicamente por categoría */}
                {Object.entries(
                  menus.reduce((categories, menu) => {
                    if (!categories[menu.categoria]) {
                      categories[menu.categoria] = [];
                    }
                    categories[menu.categoria].push(menu);
                    return categories;
                  }, {})
                ).map(([categoria, menuItems]) => (
                  <div key={categoria}>
                    <hr className="my-4 md:min-w-full" />
                    <h6 className="md:min-w-full text-blueGray-500 text-xs uppercase font-bold block pt-1 pb-4 no-underline">
                      {categoria}
                    </h6>
                    <ul className="md:flex-col md:min-w-full flex flex-col list-none">
                      {menuItems
                        .sort((a, b) => a.orden - b.orden)
                        .map((menu) => (
                          <li key={menu.id} className="items-center">
                            <Link
                              className={
                                "text-xs uppercase py-3 font-bold block " +
                                (window.location.href.indexOf(menu.ruta) !== -1
                                  ? "text-lightBlue-500 hover:text-lightBlue-600"
                                  : "text-blueGray-700 hover:text-blueGray-500")
                              }
                              to={menu.ruta}
                            >
                              <i
                                className={
                                  `fas ${menu.icono} mr-2 text-sm ` +
                                  (window.location.href.indexOf(menu.ruta) !== -1
                                    ? "opacity-75"
                                    : "text-blueGray-300")
                                }
                              ></i>{" "}
                              {menu.nombre}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
