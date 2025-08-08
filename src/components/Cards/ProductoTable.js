import React, { useState } from "react";
import PropTypes from "prop-types";

export default function ProductoTable({ 
  color = "light", 
  productos = [], 
  onEdit, 
  onDelete, 
  loading = false 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("nombre");
  const [sortDirection, setSortDirection] = useState("asc");

  // Asegurar que productos sea un array
  const productosArray = Array.isArray(productos) ? productos : [];
  
  // Filtrar productos por término de búsqueda
  const filteredProductos = productosArray.filter(producto => 
    producto.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (producto.codigoBarra || producto.codigo_barra)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (producto.categoria?.nombre || producto.categoria_nombre)?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ordenar productos
  const sortedProductos = [...filteredProductos].sort((a, b) => {
    const aValue = a[sortField] || "";
    const bValue = b[sortField] || "";
    
    if (sortDirection === "asc") {
      return aValue.toString().localeCompare(bValue.toString());
    } else {
      return bValue.toString().localeCompare(aValue.toString());
    }
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return "fas fa-sort text-blueGray-300";
    return sortDirection === "asc" 
      ? "fas fa-sort-up text-lightBlue-500" 
      : "fas fa-sort-down text-lightBlue-500";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
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
                Productos ({sortedProductos.length})
              </h3>
            </div>
            <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
              <input
                type="text"
                placeholder="Buscar productos..."
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
                    "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left cursor-pointer hover:bg-blueGray-50 " +
                    (color === "light"
                      ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                      : "bg-lightBlue-800 text-lightBlue-300 border-lightBlue-700")
                  }
                  onClick={() => handleSort("codigo_barra")}
                >
                  <div className="flex items-center justify-between">
                    Código
                    <i className={getSortIcon("codigo_barra")}></i>
                  </div>
                </th>
                <th
                  className={
                    "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left cursor-pointer hover:bg-blueGray-50 " +
                    (color === "light"
                      ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                      : "bg-lightBlue-800 text-lightBlue-300 border-lightBlue-700")
                  }
                  onClick={() => handleSort("nombre")}
                >
                  <div className="flex items-center justify-between">
                    Nombre
                    <i className={getSortIcon("nombre")}></i>
                  </div>
                </th>
                <th
                  className={
                    "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left cursor-pointer hover:bg-blueGray-50 " +
                    (color === "light"
                      ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                      : "bg-lightBlue-800 text-lightBlue-300 border-lightBlue-700")
                  }
                  onClick={() => handleSort("categoria_nombre")}
                >
                  <div className="flex items-center justify-between">
                    Categoría
                    <i className={getSortIcon("categoria_nombre")}></i>
                  </div>
                </th>
                <th
                  className={
                    "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left cursor-pointer hover:bg-blueGray-50 " +
                    (color === "light"
                      ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                      : "bg-lightBlue-800 text-lightBlue-300 border-lightBlue-700")
                  }
                  onClick={() => handleSort("precio_compra")}
                >
                  <div className="flex items-center justify-between">
                    P. Compra
                    <i className={getSortIcon("precio_compra")}></i>
                  </div>
                </th>
                <th
                  className={
                    "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left cursor-pointer hover:bg-blueGray-50 " +
                    (color === "light"
                      ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                      : "bg-lightBlue-800 text-lightBlue-300 border-lightBlue-700")
                  }
                  onClick={() => handleSort("precio_venta")}
                >
                  <div className="flex items-center justify-between">
                    P. Venta
                    <i className={getSortIcon("precio_venta")}></i>
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
                  <td colSpan="6" className="text-center py-8">
                    <div className="flex justify-center items-center">
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Cargando productos...
                    </div>
                  </td>
                </tr>
              ) : sortedProductos.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-blueGray-500">
                    {searchTerm ? 'No se encontraron productos que coincidan con la búsqueda' : 'No hay productos registrados'}
                  </td>
                </tr>
              ) : (
                sortedProductos.map((producto) => (
                  <tr key={producto.id} className="hover:bg-blueGray-50">
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <span className="font-bold text-blueGray-600">
                        {producto.codigoBarra || producto.codigo_barra}
                      </span>
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <div>
                        <span className="font-bold text-blueGray-600">
                          {producto.nombre}
                        </span>
                        {producto.descripcion && (
                          <div className="text-blueGray-500 text-xs mt-1">
                            {producto.descripcion.length > 50 
                              ? `${producto.descripcion.substring(0, 50)}...` 
                              : producto.descripcion}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <span className="bg-lightBlue-100 text-lightBlue-600 px-2 py-1 rounded-full text-xs font-bold">
                        {producto.categoria?.nombre || producto.categoria_nombre || 'Sin categoría'}
                      </span>
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <span className="font-bold text-green-600">
                        {formatCurrency(producto.precioCompra || producto.precio_compra || 0)}
                      </span>
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <span className="font-bold text-lightBlue-600">
                        {formatCurrency(producto.precioVenta || producto.precio_venta || 0)}
                      </span>
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onEdit(producto)}
                          className="bg-lightBlue-500 text-white active:bg-lightBlue-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none hover:shadow-md"
                          title="Editar producto"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => onDelete(producto)}
                          className="bg-red-500 text-white active:bg-red-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none hover:shadow-md"
                          title="Eliminar producto"
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

ProductoTable.propTypes = {
  color: PropTypes.oneOf(["light", "dark"]),
  productos: PropTypes.array,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  loading: PropTypes.bool
};