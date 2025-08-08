import React, { useState } from "react";
import PropTypes from "prop-types";

export default function InventarioTable({ 
  color = "light", 
  inventario = [], 
  onUpdateCantidad,
  loading = false,
  sedes = []
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("producto_nombre");
  const [sortDirection, setSortDirection] = useState("asc");
  const [sedeFilter, setSedeFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("all"); // all, bajo, agotado

  // Validar y filtrar inventario
  const inventarioArray = Array.isArray(inventario) ? inventario : [];
  
  // Debug logs
  console.log('📋 InventarioTable received inventario:', inventario);
  console.log('📋 InventarioTable inventarioArray length:', inventarioArray.length);
  console.log('📋 InventarioTable sample item:', inventarioArray[0]);
  const filteredInventario = inventarioArray.filter(item => {
    const matchesSearch = 
      item.producto?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.producto?.codigoBarra?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sede?.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSede = !sedeFilter || item.sedeId?.toString() === sedeFilter;
    
    const matchesStock = 
      stockFilter === "all" || 
      (stockFilter === "bajo" && item.cantidad <= 10 && item.cantidad > 0) ||
      (stockFilter === "agotado" && item.cantidad === 0);
    
    return matchesSearch && matchesSede && matchesStock;
  });

  // Ordenar inventario
  const sortedInventario = [...filteredInventario].sort((a, b) => {
    let aValue, bValue;
    
    // Obtener valores según el campo de ordenamiento
    switch (sortField) {
      case "producto_nombre":
        aValue = a.producto?.nombre || "";
        bValue = b.producto?.nombre || "";
        break;
      case "sede_nombre":
        aValue = a.sede?.nombre || "";
        bValue = b.sede?.nombre || "";
        break;
      case "cantidad":
        aValue = a.cantidad || 0;
        bValue = b.cantidad || 0;
        break;
      case "precio_venta":
        aValue = a.producto?.precioVenta || 0;
        bValue = b.producto?.precioVenta || 0;
        break;
      default:
        aValue = a[sortField] || "";
        bValue = b[sortField] || "";
    }
    
    if (sortField === "cantidad" || sortField === "precio_venta") {
      const aNum = parseFloat(aValue) || 0;
      const bNum = parseFloat(bValue) || 0;
      return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
    }
    
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

  const getStockStatus = (cantidad) => {
    if (cantidad === 0) {
      return { text: "Agotado", class: "bg-red-100 text-red-600" };
    } else if (cantidad <= 10) {
      return { text: "Stock Bajo", class: "bg-yellow-100 text-yellow-600" };
    } else {
      return { text: "Disponible", class: "bg-green-100 text-green-600" };
    }
  };

  const handleCantidadChange = async (item, nuevaCantidad) => {
    if (nuevaCantidad < 0) return;
    await onUpdateCantidad(item.productoId, item.sedeId, nuevaCantidad);
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
          <div className="flex flex-wrap items-center mb-3">
            <div className="relative w-full px-4 max-w-full flex-grow flex-1">
              <h3
                className={
                  "font-semibold text-lg " +
                  (color === "light" ? "text-blueGray-700" : "text-white")
                }
              >
                Inventario por Sede ({sortedInventario.length})
              </h3>
            </div>
          </div>
          
          {/* Filtros */}
          <div className="flex flex-wrap gap-4 px-4">
            {/* Búsqueda */}
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
              />
            </div>
            
            {/* Filtro por sede */}
            <div>
              <select
                value={sedeFilter}
                onChange={(e) => setSedeFilter(e.target.value)}
                className="border-0 px-3 py-2 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring"
              >
                <option value="">Todas las sedes</option>
                {Array.isArray(sedes) && sedes.map(sede => (
                  <option key={sede.id} value={sede.id}>
                    {sede.nombre}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Filtro por stock */}
            <div>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="border-0 px-3 py-2 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring"
              >
                <option value="all">Todos los stocks</option>
                <option value="bajo">Stock bajo (≤10)</option>
                <option value="agotado">Agotados</option>
              </select>
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
                  onClick={() => handleSort("producto_nombre")}
                >
                  <div className="flex items-center justify-between">
                    Producto
                    <i className={getSortIcon("producto_nombre")}></i>
                  </div>
                </th>
                <th
                  className={
                    "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left cursor-pointer hover:bg-blueGray-50 " +
                    (color === "light"
                      ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                      : "bg-lightBlue-800 text-lightBlue-300 border-lightBlue-700")
                  }
                  onClick={() => handleSort("sede_nombre")}
                >
                  <div className="flex items-center justify-between">
                    Sede
                    <i className={getSortIcon("sede_nombre")}></i>
                  </div>
                </th>
                <th
                  className={
                    "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left cursor-pointer hover:bg-blueGray-50 " +
                    (color === "light"
                      ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                      : "bg-lightBlue-800 text-lightBlue-300 border-lightBlue-700")
                  }
                  onClick={() => handleSort("cantidad")}
                >
                  <div className="flex items-center justify-between">
                    Cantidad
                    <i className={getSortIcon("cantidad")}></i>
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
                  Estado
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
                    Precio
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
                      Cargando inventario...
                    </div>
                  </td>
                </tr>
              ) : sortedInventario.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-blueGray-500">
                    No se encontraron productos en inventario
                  </td>
                </tr>
              ) : (
                sortedInventario.map((item) => {
                  const stockStatus = getStockStatus(item.cantidad);
                  return (
                    <tr key={`${item.productoId}-${item.sedeId}`} className="hover:bg-blueGray-50">
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        <div>
                          <span className="font-bold text-blueGray-600">
                            {item.producto?.nombre || 'Producto sin nombre'}
                          </span>
                          <div className="text-blueGray-500 text-xs">
                            {item.producto?.codigoBarra || 'Sin código'}
                          </div>
                        </div>
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        <span className="bg-lightBlue-100 text-lightBlue-600 px-2 py-1 rounded-full text-xs font-bold">
                          {item.sede?.nombre || 'Sede desconocida'}
                        </span>
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        <input
                          type="number"
                          min="0"
                          value={item.cantidad}
                          onChange={(e) => handleCantidadChange(item, parseInt(e.target.value) || 0)}
                          className="border border-blueGray-300 px-2 py-1 rounded text-xs w-20 focus:outline-none focus:ring focus:border-lightBlue-300"
                        />
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${stockStatus.class}`}>
                          {stockStatus.text}
                        </span>
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        <span className="font-bold text-lightBlue-600">
                          {formatCurrency(item.producto?.precioVenta || 0)}
                        </span>
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        <button
                          onClick={() => handleCantidadChange(item, 0)}
                          className="bg-yellow-500 text-white active:bg-yellow-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none hover:shadow-md mr-1"
                          title="Marcar como agotado"
                        >
                          <i className="fas fa-ban"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

InventarioTable.propTypes = {
  color: PropTypes.oneOf(["light", "dark"]),
  inventario: PropTypes.array,
  onUpdateCantidad: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  sedes: PropTypes.array
};