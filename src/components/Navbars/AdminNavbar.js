import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "contexts/AuthContext.js";
import { sedeService } from "api/sedeService.js";
import UserDropdown from "components/Dropdowns/UserDropdown.js";

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();
  const [currentSede, setCurrentSede] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mapeo de rutas a nombres de páginas
  const getPageTitle = (pathname) => {
    const routeMap = {
      '/admin/dashboard': 'Dashboard',
      '/admin/usuarios': 'Gestión de Usuarios',
      '/admin/sedes': 'Gestión de Sedes', 
      '/admin/roles': 'Gestión de Roles',
      '/admin/menus': 'Administrar Menús',
      '/inventario/productos': 'Gestión de Productos',
      '/inventario/categorias': 'Gestión de Categorías',
      '/inventario/marcas': 'Gestión de Marcas',
      '/inventario/inventario-sedes': 'Inventario por Sede',
      '/vehiculos': 'Gestión de Vehículos',
      '/ventas/historial': 'Historial de Ventas',
      '/ventas/nueva': 'Nueva Venta',
      '/reportes': 'Dashboard de Reportes',
      '/reportes/ventas-movimientos': 'Reportes de Ventas',
      '/reportes/historial-vehiculos': 'Historial de Vehículos',
      '/reportes/inventario-general': 'Reporte de Inventario'
    };
    
    return routeMap[pathname] || 'Dashboard';
  };

  useEffect(() => {
    fetchUserSede();
  }, [user]);

  const fetchUserSede = async () => {
    try {
      if (user?.sedes && Array.isArray(user.sedes) && user.sedes.length > 0) {
        // El usuario tiene sedes asignadas, usar la primera del array
        setCurrentSede(user.sedes[0]);
      } else if (user?.sedeId) {
        // Fallback: Si el usuario tiene sedeId pero no array de sedes
        const sedes = await sedeService.getAllSedes();
        const userSede = sedes.find(sede => sede.id === user.sedeId);
        setCurrentSede(userSede);
      } else {
        // Si no tiene sedes específicas, mostrar acceso general
        setCurrentSede({ nombre: "Acceso General", id: "all" });
      }
    } catch (error) {
      console.error("Error fetching user sede:", error);
      setCurrentSede({ nombre: "Sede no disponible", id: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Navbar */}
      <nav className="absolute top-0 left-0 w-full z-10 bg-transparent md:flex-row md:flex-nowrap md:justify-start flex items-center p-4">
        <div className="w-full mx-autp items-center flex justify-between md:flex-nowrap flex-wrap md:px-10 px-4">
          {/* Brand */}
          <a
            className="text-white text-sm uppercase hidden lg:inline-block font-semibold"
            href="#pablo"
            onClick={(e) => e.preventDefault()}
          >
            {getPageTitle(location.pathname)}
          </a>
          {/* Sede Info */}
          <div className="md:flex hidden flex-row flex-wrap items-center lg:ml-auto mr-3">
            <div className="relative flex items-center bg-blueGray-800 bg-opacity-90 rounded-lg px-4 py-2 border border-blueGray-600 shadow-lg">
              <span className="text-lightBlue-400 mr-3">
                <i className="fas fa-building text-lg"></i>
              </span>
              <div className="text-white">
                <div className="text-xs font-bold uppercase tracking-wider text-blueGray-300">
                  Sede Actual
                </div>
                <div className="text-sm font-bold text-white">
                  {loading ? (
                    <span className="animate-pulse text-blueGray-300">Cargando...</span>
                  ) : (
                    <span className="text-lightBlue-200">{currentSede?.nombre || "No disponible"}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* User */}
          <ul className="flex-col md:flex-row list-none items-center hidden md:flex">
            <UserDropdown />
          </ul>
        </div>
      </nav>
      {/* End Navbar */}
    </>
  );
}
