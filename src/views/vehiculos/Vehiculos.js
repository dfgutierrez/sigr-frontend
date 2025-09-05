import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { vehiculoService } from "api/vehiculoService.js";
import { sedeService } from "api/sedeService.js";
import VehiculoForm from "components/Forms/VehiculoForm.js";
import ConfirmationModal from "components/Modals/ConfirmationModal.js";
import { useToast } from "hooks/useToast.js";

export default function Vehiculos() {
  const history = useHistory();
  const [vehiculos, setVehiculos] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVehiculo, setEditingVehiculo] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vehiculoToDelete, setVehiculoToDelete] = useState(null);
  const [filters, setFilters] = useState({
    placa: "",
    tipo: "",
    sedeId: "",
    estado: ""
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);
  const { showToast } = useToast();

  useEffect(() => {
    fetchVehiculos();
    fetchSedes();
  }, [currentPage, filters]);

  const fetchVehiculos = async () => {
    try {
      setLoading(true);
      
      if (filters.placa) {
        const data = await vehiculoService.searchVehiculosByPlaca(filters.placa);
        setVehiculos(data);
        setTotalPages(1);
      } else if (filters.tipo) {
        const data = await vehiculoService.getVehiculosByTipo(filters.tipo);
        setVehiculos(data);
        setTotalPages(1);
      } else if (filters.sedeId) {
        const data = await vehiculoService.getVehiculosBySede(filters.sedeId);
        setVehiculos(data);
        setTotalPages(1);
      } else if (filters.estado !== "") {
        const data = await vehiculoService.getVehiculosByEstado(filters.estado === "true");
        setVehiculos(data);
        setTotalPages(1);
      } else {
        const response = await vehiculoService.getAllVehiculosPaginated(currentPage, pageSize);
        setVehiculos(response.content);
        setTotalPages(response.totalPages);
      }
    } catch (error) {
      console.error("Error fetching vehiculos:", error);
      showToast("Error al cargar los vehículos", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchSedes = async () => {
    try {
      const data = await sedeService.getAllSedes();
      setSedes(data);
    } catch (error) {
      console.error("Error fetching sedes:", error);
    }
  };

  const handleCreate = () => {
    setEditingVehiculo(null);
    setShowForm(true);
  };

  const handleEdit = (vehiculo) => {
    setEditingVehiculo(vehiculo);
    setShowForm(true);
  };

  const handleDelete = (vehiculo) => {
    setVehiculoToDelete(vehiculo);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await vehiculoService.deleteVehiculo(vehiculoToDelete.id);
      showToast("Vehículo eliminado exitosamente", "success");
      setShowDeleteModal(false);
      setVehiculoToDelete(null);
      fetchVehiculos();
    } catch (error) {
      console.error("Error deleting vehiculo:", error);
      showToast(
        error.response?.data?.message || "Error al eliminar el vehículo",
        "error"
      );
    }
  };

  const handleFormSave = (vehiculoCreado = null) => {
    const isCreatingNewVehicle = vehiculoCreado && !editingVehiculo;
    
    setShowForm(false);
    setEditingVehiculo(null);
    fetchVehiculos();
    
    // Si es un vehículo nuevo (no edición), redirigir a nueva venta para TODOS los roles
    if (isCreatingNewVehicle) {
      console.log('🚗 Vehículo creado, redirigiendo a nueva venta:', vehiculoCreado);
      // Redirigir a nueva venta con parámetros del vehículo
      history.push(`/ventas/nueva?vehiculoId=${vehiculoCreado.id}&placa=${encodeURIComponent(vehiculoCreado.placa)}`);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingVehiculo(null);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(0);
  };

  const clearFilters = () => {
    setFilters({
      placa: "",
      tipo: "",
      sedeId: "",
      estado: ""
    });
    setCurrentPage(0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES") + " " + date.toLocaleTimeString("es-ES", { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTipoColor = (tipo) => {
    return tipo === "moto" 
      ? "text-blue-800 bg-blue-200" 
      : "text-green-800 bg-green-200";
  };

  if (showForm) {
    return (
      <div className="flex flex-wrap">
        <div className="w-full px-4">
          <VehiculoForm
            vehiculo={editingVehiculo}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap">
        <div className="w-full px-4">
          <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
            <div className="rounded-t mb-0 px-4 py-3 border-0">
              <div className="flex flex-wrap items-center">
                <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                  <h3 className="font-semibold text-base text-blueGray-700">
                    Gestión de Vehículos
                  </h3>
                </div>
                <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
                  <button
                    className="bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={handleCreate}
                  >
                    Nuevo Vehículo
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap mt-4 gap-4">
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    name="placa"
                    value={filters.placa}
                    onChange={handleFilterChange}
                    placeholder="Buscar por placa..."
                    className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <select
                    name="tipo"
                    value={filters.tipo}
                    onChange={handleFilterChange}
                    className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                  >
                    <option value="">Todos los tipos</option>
                    <option value="moto">Moto</option>
                    <option value="carro">Carro</option>
                  </select>
                </div>
                <div className="flex-1 min-w-0">
                  <select
                    name="sedeId"
                    value={filters.sedeId}
                    onChange={handleFilterChange}
                    className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                  >
                    <option value="">Todas las sedes</option>
                    {sedes.map((sede) => (
                      <option key={sede.id} value={sede.id}>
                        {sede.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={clearFilters}
                    className="bg-gray-500 text-white active:bg-gray-600 text-xs font-bold uppercase px-3 py-2 rounded outline-none focus:outline-none ease-linear transition-all duration-150"
                  >
                    Limpiar
                  </button>
                </div>
              </div>
            </div>

            <div className="block w-full overflow-x-auto">
              {loading ? (
                <div className="text-center py-4">
                  <span className="text-blueGray-400">Cargando vehículos...</span>
                </div>
              ) : (
                <table className="items-center w-full bg-transparent border-collapse">
                  <thead>
                    <tr>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Placa
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Tipo
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Marca/Modelo
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Conductor
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Sede
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Fecha Ingreso
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehiculos.map((vehiculo) => (
                      <tr key={vehiculo.id}>
                        <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left text-blueGray-700">
                          <span className="font-bold">{vehiculo.placa}</span>
                        </th>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                          <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full ${getTipoColor(vehiculo.tipo)}`}>
                            {vehiculo.tipo}
                          </span>
                        </td>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                          <div>
                            <div className="font-bold">{vehiculo.marca?.nombre || "N/A"}</div>
                            <div className="text-blueGray-500">{vehiculo.modelo || "N/A"}</div>
                          </div>
                        </td>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                          <div>
                            <div className="font-bold">{vehiculo.nombreConductor || "N/A"}</div>
                            <div className="text-blueGray-500">{vehiculo.documento || "N/A"}</div>
                          </div>
                        </td>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                          {vehiculo.sede?.nombre || "N/A"}
                        </td>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                          {formatDate(vehiculo.fechaIngreso)}
                        </td>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                          <button
                            onClick={() => handleEdit(vehiculo)}
                            className="text-blue-500 hover:text-blue-700 mr-2"
                            title="Editar"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(vehiculo)}
                            className="text-red-500 hover:text-red-700"
                            title="Eliminar"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              
              {vehiculos.length === 0 && !loading && (
                <div className="text-center py-4">
                  <span className="text-blueGray-400">No hay vehículos registrados</span>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Página <span className="font-medium">{currentPage + 1}</span> de{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                        disabled={currentPage === 0}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <i className="fas fa-chevron-left"></i>
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                        disabled={currentPage >= totalPages - 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Eliminar Vehículo"
        message={`¿Está seguro que desea eliminar el vehículo con placa ${vehiculoToDelete?.placa}?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmButtonClass="bg-red-500 hover:bg-red-700"
      />
    </>
  );
}