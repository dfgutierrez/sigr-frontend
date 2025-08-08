import React, { useState, useEffect } from "react";
import { menuAdminService } from "api/menuAdminService.js";
import { useAuth } from "contexts/AuthContext.js";

// Componente temporal para probar y crear el menú de administración
export default function MenuAdminTest() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { user } = useAuth();

  const createAdminMenu = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Datos del menú de administración
      const menuData = {
        nombre: "Administrar Menús",
        ruta: "/admin/menu-admin",
        icono: "fa-tools",
        categoria: "Administración",
        orden: 3
      };

      console.log("Creando menú de administración:", menuData);
      
      const result = await menuAdminService.createMenu(menuData);
      
      console.log("Menú creado exitosamente:", result);
      setMessage("¡Menú de administración creado exitosamente! Recarga la página para verlo en el menú lateral.");
      
    } catch (error) {
      console.error("Error creating admin menu:", error);
      
      if (error.response?.status === 409) {
        setMessage("El menú ya existe. Si no lo ves, puede ser un problema de permisos de rol.");
      } else {
        setError(`Error al crear el menú: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const checkExistingMenus = async () => {
    try {
      const menus = await menuAdminService.getAllMenus();
      const adminMenu = menus.find(menu => menu.nombre === "Administrar Menús");
      
      if (adminMenu) {
        setMessage(`El menú ya existe (ID: ${adminMenu.id}). Si no lo ves en el sidebar, es un problema de permisos de rol.`);
      } else {
        setMessage("El menú no existe. Haz clic en 'Crear Menú' para crearlo.");
      }
    } catch (error) {
      setError("Error al verificar menús existentes");
    }
  };

  useEffect(() => {
    checkExistingMenus();
  }, []);

  return (
    <div className="flex flex-wrap">
      <div className="w-full px-4">
        <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
          <div className="rounded-t mb-0 px-4 py-3 border-0">
            <div className="flex flex-wrap items-center">
              <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                <h3 className="font-semibold text-base text-blueGray-700">
                  Configuración del Menú de Administración
                </h3>
                <p className="text-sm text-blueGray-400">
                  Herramienta temporal para crear el menú de administración de menús
                </p>
              </div>
            </div>
          </div>

          <div className="block w-full overflow-x-auto px-4 py-4">
            {/* Información del usuario */}
            <div className="bg-blueGray-50 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-semibold text-blueGray-700 mb-2">Información del Usuario</h4>
              <p><strong>Usuario:</strong> {user?.username || 'No identificado'}</p>
              <p><strong>Nombre:</strong> {user?.nombreCompleto || 'No disponible'}</p>
              <p><strong>Roles:</strong> {user?.roles?.join(', ') || 'No disponible'}</p>
            </div>

            {/* Mensajes */}
            {message && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                <p className="text-green-600 text-sm">{message}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-4">
              <button
                onClick={createAdminMenu}
                disabled={loading}
                className="bg-indigo-500 text-white active:bg-indigo-600 text-sm font-bold uppercase px-4 py-2 rounded outline-none focus:outline-none ease-linear transition-all duration-150 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Creando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus mr-2"></i>
                    Crear Menú
                  </>
                )}
              </button>

              <button
                onClick={checkExistingMenus}
                className="bg-blue-500 text-white active:bg-blue-600 text-sm font-bold uppercase px-4 py-2 rounded outline-none focus:outline-none ease-linear transition-all duration-150"
              >
                <i className="fas fa-search mr-2"></i>
                Verificar
              </button>

              <button
                onClick={() => window.location.reload()}
                className="bg-green-500 text-white active:bg-green-600 text-sm font-bold uppercase px-4 py-2 rounded outline-none focus:outline-none ease-linear transition-all duration-150"
              >
                <i className="fas fa-sync-alt mr-2"></i>
                Recargar Página
              </button>
            </div>

            {/* Instrucciones */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-4">
              <h4 className="text-sm font-semibold text-yellow-700 mb-2">
                <i className="fas fa-info-circle mr-2"></i>
                Instrucciones
              </h4>
              <ol className="text-yellow-700 text-sm space-y-1">
                <li>1. Haz clic en "Crear Menú" para crear el menú de administración</li>
                <li>2. Si el menú se crea pero no aparece en el sidebar, es un problema de permisos</li>
                <li>3. En ese caso, ejecuta el archivo SQL: <code>fix_admin_menu.sql</code></li>
                <li>4. Después recarga la página con el botón "Recargar Página"</li>
                <li>5. El menú debería aparecer en la categoría "Administración"</li>
              </ol>
            </div>

            {/* Solución SQL */}
            <div className="bg-blueGray-50 border border-blueGray-200 rounded-md p-4 mt-4">
              <h4 className="text-sm font-semibold text-blueGray-700 mb-2">
                <i className="fas fa-database mr-2"></i>
                Comandos SQL de Emergencia
              </h4>
              <div className="bg-black text-green-400 p-3 rounded text-xs font-mono">
                <div>-- Crear el menú manualmente</div>
                <div>INSERT INTO menu (nombre, ruta, icono, categoria, orden)</div>
                <div>VALUES ('Administrar Menús', '/admin/menu-admin', 'fa-tools', 'Administración', 3);</div>
                <br />
                <div>-- Asignarlo a tu rol (reemplaza X con tu rol_id)</div>
                <div>INSERT INTO menu_rol (menu_id, rol_id)</div>
                <div>SELECT id, X FROM menu WHERE nombre = 'Administrar Menús';</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}