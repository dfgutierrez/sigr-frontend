import React, { useState } from "react";
import PropTypes from "prop-types";

export default function CategoriaTable({ 
  color = "light", 
  categorias = [], 
  onEdit, 
  onDelete, 
  loading = false 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");

  // Asegurar que categorias sea un array
  const categoriasArray = Array.isArray(categorias) ? categorias : [];
  
  // Filtrar categorías por término de búsqueda
  const filteredCategorias = categoriasArray.filter(categoria => 
    categoria.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ordenar categorías
  const sortedCategorias = [...filteredCategorias].sort((a, b) => {
    const aValue = a.nombre || "";
    const bValue = b.nombre || "";
    
    if (sortDirection === "asc") {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  const handleSort = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  const getSortIcon = () => {
    return sortDirection === "asc" 
      ? "fas fa-sort-up text-lightBlue-500" 
      : "fas fa-sort-down text-lightBlue-500";
  };

  return (
    <>
      <div
        className={
          "relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded " +
          (color === "light" ? "bg-white" : "bg-lightBlue-900 text-white")
        }
      >
        <div className="rounded-t mb-0 px-4 py-3 border-0">
          <div className="flex flex-wrap items-center">
            <div className="relative w-full px-4 max-w-full flex-grow flex-1">
              <h3
                className={
                  "font-semibold text-lg " +
                  (color === "light" ? "text-blueGray-700" : "text-white")
                }
              >
                Categorías ({sortedCategorias.length})
              </h3>
            </div>
            <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
              <input
                type="text"
                placeholder="Buscar categorías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-64"
              />
            </div>
          </div>
        </div>

        <div className="block w-full overflow-x-auto">
          <table className="items-center w-full bg-transparent border-collapse">
            <thead>
              <tr>
                <th
                  className={
                    "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left " +
                    (color === "light"
                      ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                      : "bg-lightBlue-800 text-lightBlue-300 border-lightBlue-700")
                  }
                >
                  ID
                </th>
                <th
                  className={
                    "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left cursor-pointer hover:bg-blueGray-50 " +
                    (color === "light"
                      ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                      : "bg-lightBlue-800 text-lightBlue-300 border-lightBlue-700")
                  }
                  onClick={handleSort}
                >
                  <div className="flex items-center justify-between">
                    Nombre
                    <i className={getSortIcon()}></i>
                  </div>
                </th>
                <th
                  className={
                    "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left " +
                    (color === "light"
                      ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                      : "bg-lightBlue-800 text-lightBlue-300 border-lightBlue-700")
                  }
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="text-center py-8">
                    <div className="flex justify-center items-center">
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Cargando categorías...
                    </div>
                  </td>
                </tr>
              ) : sortedCategorias.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-8 text-blueGray-500">
                    {searchTerm ? 'No se encontraron categorías que coincidan con la búsqueda' : 'No hay categorías registradas'}
                  </td>
                </tr>
              ) : (
                sortedCategorias.map((categoria) => (
                  <tr key={categoria.id} className="hover:bg-blueGray-50">
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-indigo-800 bg-indigo-200 rounded-full">
                        #{categoria.id}
                      </span>
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <div className="flex items-center">
                        <span className="bg-lightBlue-100 text-lightBlue-600 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                          <i className="fas fa-tag text-xs"></i>
                        </span>
                        <span className="font-bold text-blueGray-600 text-sm">
                          {categoria.nombre}
                        </span>
                      </div>
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onEdit(categoria)}
                          className="bg-lightBlue-500 text-white active:bg-lightBlue-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none hover:shadow-md"
                          title="Editar categoría"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => onDelete(categoria)}
                          className="bg-red-500 text-white active:bg-red-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none hover:shadow-md"
                          title="Eliminar categoría"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

CategoriaTable.propTypes = {
  color: PropTypes.oneOf(["light", "dark"]),
  categorias: PropTypes.array,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  loading: PropTypes.bool
};