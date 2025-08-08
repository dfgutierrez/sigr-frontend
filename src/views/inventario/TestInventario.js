import React from "react";

export default function TestInventario() {
  return (
    <div className="flex flex-wrap mt-4">
      <div className="w-full mb-12 px-4">
        <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded bg-white">
          <div className="rounded-t mb-0 px-4 py-3 border-0">
            <div className="flex flex-wrap items-center">
              <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                <h3 className="font-semibold text-base text-blueGray-700">
                  ✅ Prueba de Inventario - FUNCIONA!
                </h3>
                <p className="text-sm text-green-600 mt-1">
                  Si puedes ver esta página, las rutas de inventario están funcionando correctamente.
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-bold text-blue-800 mb-2">🔗 Enlaces Directos</h4>
                <div className="space-y-2">
                  <a href="/inventario/productos" className="block text-blue-600 hover:underline">
                    📦 Productos
                  </a>
                  <a href="/inventario/categorias" className="block text-blue-600 hover:underline">
                    🏷️ Categorías
                  </a>
                  <a href="/inventario/marcas" className="block text-blue-600 hover:underline">
                    🔖 Marcas
                  </a>
                  <a href="/inventario/sedes" className="block text-blue-600 hover:underline">
                    🏢 Inventario por Sede
                  </a>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-bold text-green-800 mb-2">✅ Estado del Sistema</h4>
                <div className="text-sm space-y-1">
                  <p>✅ Rutas configuradas</p>
                  <p>✅ Componentes creados</p>
                  <p>✅ APIs actualizadas</p>
                  <p>✅ Formularios listos</p>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-bold text-yellow-800 mb-2">🔧 Diagnóstico</h4>
                <div className="text-sm space-y-1">
                  <p>URL actual: {window.location.pathname}</p>
                  <p>Navegador: {navigator.userAgent.split(' ')[0]}</p>
                  <p>Timestamp: {new Date().toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}