import React, { useState } from "react";
import PropTypes from "prop-types";

export default function MenuTable({ menus, roles, onEdit, onDelete, onManagePermissions }) {
  const [sortField, setSortField] = useState("categoria");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterCategory, setFilterCategory] = useState("");

  // Función para obtener iconos
  const getIconClass = (iconName) => {
    const iconMap = {
      'dashboard': 'fas fa-tv',
      'users': 'fas fa-users',
      'sedes': 'fas fa-building',
      'roles': 'fas fa-user-tag',
      'vehiculos': 'fas fa-car',
      'reports': 'fas fa-chart-bar',
      'settings': 'fas fa-tools',
      'products': 'fas fa-boxes',
      'categories': 'fas fa-tags',
      'brands': 'fas fa-trademark',
      'movements': 'fas fa-exchange-alt'
    };
    return iconMap[iconName] || 'fas fa-circle';
  };

  // Función para obtener categorías únicas
  const getCategories = () => {
    const categories = [...new Set(menus.map(menu => menu.categoria))];
    return categories.sort();
  };

  // Función para ordenar menús
  const getSortedMenus = () => {
    let filteredMenus = menus;
    
    if (filterCategory) {
      filteredMenus = menus.filter(menu => menu.categoria === filterCategory);
    }

    return filteredMenus.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return 'fas fa-sort';
    return sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
  };


  const sortedMenus = getSortedMenus();

  return (
    <div className="block w-full overflow-x-auto">
      {/* Filtros y resumen */}
      <div className="px-4 py-3 border-b border-blueGray-200 bg-blueGray-50">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="min-w-48">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border-0 px-3 py-2 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
              >
                <option value="">Todas las categorías</option>
                {getCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-blueGray-600">
              {sortedMenus.length} de {menus.length} menús
            </span>
            {filterCategory && (
              <button
                onClick={() => setFilterCategory("")}
                className="text-xs text-red-500 hover:text-red-700 font-medium"
                title="Limpiar filtro"
              >
                <i className="fas fa-times mr-1"></i>
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabla */}
      <table className="items-center w-full bg-transparent border-collapse">
        <thead>
          <tr>
            <th 
              className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left cursor-pointer hover:bg-blueGray-100"
              onClick={() => handleSort('nombre')}
            >
              <div className="flex items-center">
                Menú
                <i className={`ml-1 ${getSortIcon('nombre')}`}></i>
              </div>
            </th>
            <th 
              className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left cursor-pointer hover:bg-blueGray-100"
              onClick={() => handleSort('categoria')}
            >
              <div className="flex items-center">
                Categoría
                <i className={`ml-1 ${getSortIcon('categoria')}`}></i>
              </div>
            </th>
            <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
              Ruta
            </th>
            <th 
              className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left cursor-pointer hover:bg-blueGray-100"
              onClick={() => handleSort('orden')}
            >
              <div className="flex items-center">
                Orden
                <i className={`ml-1 ${getSortIcon('orden')}`}></i>
              </div>
            </th>
            <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
              Roles Asignados
            </th>
            <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedMenus.map((menu) => (
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
                <div className="flex flex-col gap-1">
                  {menu.roles && menu.roles.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {menu.roles.map((role, index) => (
                        <span
                          key={index}
                          className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  ) : menu.roleIds && menu.roleIds.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {menu.roleIds.map((roleId, index) => {
                        const role = roles.find(r => r.id === roleId);
                        return (
                          <span
                            key={index}
                            className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                          >
                            {role ? role.nombre : `ID: ${roleId}`}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-red-500 text-xs">
                      <i className="fas fa-exclamation-triangle mr-1"></i>
                      Sin roles asignados
                    </span>
                  )}
                  <div className="text-xs text-blueGray-500 mt-1">
                    ID: {menu.id} | Orden: {menu.orden}
                  </div>
                </div>
              </td>
              <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                <div className="flex items-center gap-1">
                  <button
                    className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium px-3 py-2 rounded-md transition-colors duration-200 flex items-center"
                    onClick={() => onEdit(menu)}
                    title="Editar menú"
                  >
                    <i className="fas fa-edit mr-1"></i>
                    Editar
                  </button>
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-medium px-3 py-2 rounded-md transition-colors duration-200 flex items-center"
                    onClick={() => onManagePermissions(menu)}
                    title="Gestionar permisos"
                  >
                    <i className="fas fa-users-cog mr-1"></i>
                    Permisos
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-3 py-2 rounded-md transition-colors duration-200 flex items-center"
                    onClick={() => onDelete(menu.id)}
                    title="Eliminar menú"
                  >
                    <i className="fas fa-trash mr-1"></i>
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {sortedMenus.length === 0 && (
        <div className="text-center py-12">
          <div className="max-w-sm mx-auto">
            <i className="fas fa-search text-4xl text-blueGray-300 mb-4"></i>
            <h3 className="text-lg font-medium text-blueGray-700 mb-2">
              {filterCategory ? "Sin resultados en esta categoría" : "No hay menús disponibles"}
            </h3>
            <p className="text-sm text-blueGray-500 mb-4">
              {filterCategory 
                ? `No se encontraron menús en la categoría "${filterCategory}"`
                : "No se han creado menús aún. Haz clic en 'Nuevo Menú' para comenzar."
              }
            </p>
            {filterCategory && (
              <button
                onClick={() => setFilterCategory("")}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                <i className="fas fa-times mr-1"></i>
                Mostrar todos los menús
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

MenuTable.propTypes = {
  menus: PropTypes.array.isRequired,
  roles: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onManagePermissions: PropTypes.func.isRequired,
};