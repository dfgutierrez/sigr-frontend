import React, { useState, useEffect, useRef } from "react";
import { vehiculoService } from "api/vehiculoService.js";

export default function VehiculoSearchForSale({ onVehiculoFound, onVehiculoNotFound }) {
  const [placa, setPlaca] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedVehiculo, setSelectedVehiculo] = useState(null);
  const searchTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Búsqueda en tiempo real mientras escribe
  const searchVehiculos = async (searchPlaca) => {
    if (!searchPlaca || searchPlaca.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Usar el endpoint de búsqueda general que ya tienes
      const results = await vehiculoService.searchVehiculosByPlaca(searchPlaca);
      
      if (Array.isArray(results) && results.length > 0) {
        setSuggestions(results.slice(0, 5)); // Limitar a 5 sugerencias
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (err) {
      console.error("Error searching vehiculos:", err);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el input con debounce
  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    setPlaca(value);
    setSelectedVehiculo(null);
    setSearchResult(null);

    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Configurar nuevo timeout para búsqueda
    searchTimeoutRef.current = setTimeout(() => {
      searchVehiculos(value);
    }, 300); // Esperar 300ms después de que deje de escribir
  };

  // Seleccionar un vehículo de las sugerencias
  const handleSelectVehiculo = async (vehiculo) => {
    setPlaca(vehiculo.placa);
    setSelectedVehiculo(vehiculo);
    setShowSuggestions(false);
    setSuggestions([]);
    
    // Hacer búsqueda específica para venta
    try {
      setLoading(true);
      const result = await vehiculoService.searchVehiculoForSale(vehiculo.placa);
      setSearchResult(result);
      
      if (result.encontrado && result.vehiculo) {
        onVehiculoFound && onVehiculoFound(result.vehiculo);
      } else {
        onVehiculoNotFound && onVehiculoNotFound(vehiculo.placa);
      }
    } catch (err) {
      console.error("Error searching vehiculo for sale:", err);
      setError(err.response?.data?.message || "Error al buscar vehículo");
    } finally {
      setLoading(false);
    }
  };

  // Manejar submit del formulario
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!placa.trim()) {
      setError("Por favor ingrese una placa");
      return;
    }

    setShowSuggestions(false);
    setLoading(true);
    setError("");
    setSearchResult(null);

    try {
      const result = await vehiculoService.searchVehiculoForSale(placa.trim());
      setSearchResult(result);
      
      if (result.encontrado && result.vehiculo) {
        setSelectedVehiculo(result.vehiculo);
        onVehiculoFound && onVehiculoFound(result.vehiculo);
      } else {
        onVehiculoNotFound && onVehiculoNotFound(placa.trim());
      }
    } catch (err) {
      console.error("Error searching vehiculo:", err);
      setError(err.response?.data?.message || "Error al buscar vehículo");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPlaca("");
    setSearchResult(null);
    setSelectedVehiculo(null);
    setSuggestions([]);
    setShowSuggestions(false);
    setError("");
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  // Cerrar sugerencias cuando se hace click fuera
  const handleClickOutside = (e) => {
    if (inputRef.current && !inputRef.current.contains(e.target)) {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Manejar teclas de navegación
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
      <div className="rounded-t bg-white mb-0 px-6 py-6">
        <div className="text-center flex justify-between">
          <h6 className="text-blueGray-700 text-xl font-bold">
            Buscar Vehículo para Venta
          </h6>
          {searchResult && (
            <button
              onClick={handleReset}
              className="bg-blueGray-500 text-white active:bg-blueGray-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
            >
              Nueva Búsqueda
            </button>
          )}
        </div>
      </div>

      <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
        {!searchResult && (
          <form onSubmit={handleSearch}>
            <div className="flex flex-wrap items-end">
              <div className="w-full lg:w-8/12 px-4">
                <div className="relative w-full mb-3" ref={inputRef}>
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                    Placa del Vehículo *
                  </label>
                  <input
                    type="text"
                    value={placa}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => placa.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    placeholder="Escribe para buscar (ej: ABC123)"
                    maxLength="20"
                    disabled={loading}
                    autoComplete="off"
                  />
                  
                  {/* Dropdown de sugerencias */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-blueGray-200 rounded-b shadow-lg z-50 max-h-60 overflow-y-auto">
                      {suggestions.map((vehiculo, index) => (
                        <div
                          key={vehiculo.id || index}
                          onClick={() => handleSelectVehiculo(vehiculo)}
                          className="px-4 py-3 hover:bg-blueGray-50 cursor-pointer border-b border-blueGray-100 last:border-b-0"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-semibold text-blueGray-800">
                                {vehiculo.placa}
                              </div>
                              <div className="text-sm text-blueGray-600">
                                {vehiculo.tipo && <span className="capitalize">{vehiculo.tipo}</span>}
                                {vehiculo.marca && <span> • {vehiculo.marca.nombre}</span>}
                                {vehiculo.modelo && <span> • {vehiculo.modelo}</span>}
                              </div>
                              {vehiculo.nombreConductor && (
                                <div className="text-xs text-blueGray-500">
                                  Conductor: {vehiculo.nombreConductor}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-end text-right">
                              {vehiculo.sede && (
                                <div className="text-xs text-blueGray-500">
                                  {vehiculo.sede.nombre}
                                </div>
                              )}
                              {vehiculo.km > 0 && (
                                <div className="text-xs text-blueGray-500">
                                  {vehiculo.km.toLocaleString()} km
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Mensaje cuando no hay sugerencias pero se está escribiendo */}
                  {showSuggestions && suggestions.length === 0 && placa.length >= 2 && !loading && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-blueGray-200 rounded-b shadow-lg z-50">
                      <div className="px-4 py-3 text-blueGray-500 text-sm">
                        No se encontraron vehículos con "{placa}"
                      </div>
                    </div>
                  )}
                  
                  {/* Indicador de carga */}
                  {loading && placa.length >= 2 && (
                    <div className="absolute right-3 top-11 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-lightBlue-500"></div>
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full lg:w-4/12 px-4">
                <div className="relative w-full mb-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-3 rounded shadow hover:shadow-md outline-none focus:outline-none w-full ease-linear transition-all duration-150 ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Buscando...' : 'Buscar Vehículo'}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
          </form>
        )}

        {searchResult && (
          <div className="mt-6">
            {searchResult.encontrado ? (
              <div className="bg-green-100 border border-green-400 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-green-500 text-white rounded-full p-2 mr-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <h3 className="text-green-800 text-lg font-bold">Vehículo Encontrado</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="text-blueGray-700 text-sm font-bold mb-3">Información del Vehículo</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-blueGray-600 text-sm font-semibold">Placa:</span>
                        <span className="text-blueGray-800 text-sm">{searchResult.vehiculo.placa}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blueGray-600 text-sm font-semibold">Tipo:</span>
                        <span className="text-blueGray-800 text-sm capitalize">{searchResult.vehiculo.tipo}</span>
                      </div>
                      {searchResult.vehiculo.marca && (
                        <div className="flex justify-between">
                          <span className="text-blueGray-600 text-sm font-semibold">Marca:</span>
                          <span className="text-blueGray-800 text-sm">{searchResult.vehiculo.marca.nombre}</span>
                        </div>
                      )}
                      {searchResult.vehiculo.modelo && (
                        <div className="flex justify-between">
                          <span className="text-blueGray-600 text-sm font-semibold">Modelo:</span>
                          <span className="text-blueGray-800 text-sm">{searchResult.vehiculo.modelo}</span>
                        </div>
                      )}
                      {searchResult.vehiculo.km > 0 && (
                        <div className="flex justify-between">
                          <span className="text-blueGray-600 text-sm font-semibold">Kilómetros:</span>
                          <span className="text-blueGray-800 text-sm">{searchResult.vehiculo.km.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="text-blueGray-700 text-sm font-bold mb-3">Información del Conductor</h4>
                    <div className="space-y-2">
                      {searchResult.vehiculo.nombreConductor && (
                        <div className="flex justify-between">
                          <span className="text-blueGray-600 text-sm font-semibold">Conductor:</span>
                          <span className="text-blueGray-800 text-sm">{searchResult.vehiculo.nombreConductor}</span>
                        </div>
                      )}
                      {searchResult.vehiculo.documento && (
                        <div className="flex justify-between">
                          <span className="text-blueGray-600 text-sm font-semibold">Documento:</span>
                          <span className="text-blueGray-800 text-sm">{searchResult.vehiculo.documento}</span>
                        </div>
                      )}
                      {searchResult.vehiculo.sede && (
                        <div className="flex justify-between">
                          <span className="text-blueGray-600 text-sm font-semibold">Sede:</span>
                          <span className="text-blueGray-800 text-sm">{searchResult.vehiculo.sede.nombre}</span>
                        </div>
                      )}
                      {searchResult.vehiculo.sigla && (
                        <div className="flex justify-between">
                          <span className="text-blueGray-600 text-sm font-semibold">Sigla:</span>
                          <span className="text-blueGray-800 text-sm">{searchResult.vehiculo.sigla}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {searchResult.vehiculo.fechaIngreso && (
                  <div className="bg-white p-4 rounded-lg shadow mt-4">
                    <h4 className="text-blueGray-700 text-sm font-bold mb-3">Fechas</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="flex justify-between">
                        <span className="text-blueGray-600 text-sm font-semibold">Fecha Ingreso:</span>
                        <span className="text-blueGray-800 text-sm">
                          {new Date(searchResult.vehiculo.fechaIngreso).toLocaleDateString('es-CO')}
                        </span>
                      </div>
                      {searchResult.vehiculo.fechaSalida && (
                        <div className="flex justify-between">
                          <span className="text-blueGray-600 text-sm font-semibold">Fecha Salida:</span>
                          <span className="text-blueGray-800 text-sm">
                            {new Date(searchResult.vehiculo.fechaSalida).toLocaleDateString('es-CO')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-orange-100 border border-orange-400 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-orange-500 text-white rounded-full p-2 mr-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                  </div>
                  <h3 className="text-orange-800 text-lg font-bold">Vehículo No Encontrado</h3>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-orange-700 mb-3">
                    No se encontró un vehículo con la placa <strong>{placa}</strong>
                  </p>
                  <p className="text-blueGray-600 text-sm">
                    {searchResult.mensaje || "El vehículo con esta placa no está registrado en el sistema."}
                  </p>
                  {searchResult.puedeRegistrar && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-blue-700 text-sm">
                        💡 <strong>Sugerencia:</strong> Puedes registrar este vehículo antes de crear la venta.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}