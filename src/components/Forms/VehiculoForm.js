import React, { useState, useEffect } from "react";
import { vehiculoService } from "api/vehiculoService.js";
import { marcaService } from "api/marcaService.js";
import { sedeService } from "api/sedeService.js";
import { useAuth } from "contexts/AuthContext.js";
import { useToast } from "hooks/useToast.js";

export default function VehiculoForm({ vehiculo, onSave, onCancel, preSelectedSedeId }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    placa: "",
    tipo: "moto",
    marcaId: "",
    modelo: "",
    nombreConductor: "",
    documento: "",
    km: 0,
    sigla: "",
    sedeId: ""
  });
  
  const [marcas, setMarcas] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { showToast } = useToast();

  useEffect(() => {
    fetchMarcas();
    fetchSedes();
    
    if (vehiculo) {
      setFormData({
        placa: vehiculo.placa || "",
        tipo: vehiculo.tipo || "moto",
        marcaId: vehiculo.marcaId || "",
        modelo: vehiculo.modelo || "",
        nombreConductor: vehiculo.nombreConductor || "",
        documento: vehiculo.documento || "",
        km: vehiculo.km || 0,
        sigla: vehiculo.sigla || "",
        sedeId: vehiculo.sedeId || ""
      });
    } else if (preSelectedSedeId) {
      setFormData(prev => ({
        ...prev,
        sedeId: preSelectedSedeId
      }));
    }
  }, [vehiculo, preSelectedSedeId]);

  const fetchMarcas = async () => {
    try {
      const response = await marcaService.getAllMarcas();
      console.log('🚗 VehiculoForm: Marcas response:', response);
      
      // Manejar diferentes estructuras de respuesta
      let marcasData = [];
      
      if (Array.isArray(response)) {
        marcasData = response;
      } else if (response && Array.isArray(response.data)) {
        marcasData = response.data;
      } else if (response && response.success && Array.isArray(response.data)) {
        marcasData = response.data;
      } else {
        console.warn('⚠️ VehiculoForm: Unexpected marcas response:', response);
        marcasData = [];
      }
      
      setMarcas(marcasData);
      console.log('✅ VehiculoForm: Marcas loaded:', marcasData.length, 'items');
    } catch (error) {
      console.error("Error fetching marcas:", error);
      setMarcas([]); // Asegurar que siempre sea un array
    }
  };

  const fetchSedes = async () => {
    try {
      const data = await sedeService.getAllSedes();
      setSedes(data);
      
      // Establecer sede por defecto si no estamos editando y no hay preselección
      if (!vehiculo && !preSelectedSedeId && !formData.sedeId) {
        setDefaultSede(data);
      }
    } catch (error) {
      console.error("Error fetching sedes:", error);
    }
  };

  const setDefaultSede = (sedesData) => {
    let defaultSedeId = '';
    
    // Prioridad 1: Primera sede del usuario autenticado
    if (user?.sedes && Array.isArray(user.sedes) && user.sedes.length > 0) {
      defaultSedeId = user.sedes[0].id.toString();
      console.log('🏢 VehiculoForm: Setting default sede from user.sedes:', user.sedes[0].nombre);
    }
    // Prioridad 2: sedeId del usuario (fallback)
    else if (user?.sedeId) {
      defaultSedeId = user.sedeId.toString();
      console.log('🏢 VehiculoForm: Setting default sede from user.sedeId:', user.sedeId);
    }
    // Prioridad 3: Primera sede disponible
    else if (Array.isArray(sedesData) && sedesData.length > 0) {
      defaultSedeId = sedesData[0].id.toString();
      console.log('🏢 VehiculoForm: Setting default sede as first available:', sedesData[0].nombre);
    }

    if (defaultSedeId) {
      setFormData(prev => ({
        ...prev,
        sedeId: defaultSedeId
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Convertir placa a mayúsculas automáticamente
    const processedValue = name === 'placa' ? value.toUpperCase() : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handlePlacaChange = (e) => {
    const value = e.target.value.toUpperCase();
    setFormData(prev => ({
      ...prev,
      placa: value
    }));
    
    if (errors.placa) {
      setErrors(prev => ({
        ...prev,
        placa: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.placa.trim()) {
      newErrors.placa = "La placa es requerida";
    }
    
    if (!formData.tipo) {
      newErrors.tipo = "El tipo es requerido";
    }
    
    if (!formData.sedeId) {
      newErrors.sedeId = "La sede es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const dataToSend = {
        ...formData,
        marcaId: formData.marcaId || null,
        sedeId: parseInt(formData.sedeId),
        km: parseInt(formData.km) || 0
      };

      if (vehiculo) {
        await vehiculoService.updateVehiculo(vehiculo.id, dataToSend);
        showToast("Vehículo actualizado exitosamente", "success");
      } else {
        await vehiculoService.createVehiculo(dataToSend);
        showToast("Vehículo creado exitosamente", "success");
      }
      
      onSave();
    } catch (error) {
      console.error("Error saving vehiculo:", error);
      showToast(
        error.response?.data?.message || "Error al guardar el vehículo",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
      <div className="rounded-t bg-white mb-0 px-6 py-6">
        <div className="text-center flex justify-between">
          <h6 className="text-blueGray-700 text-xl font-bold">
            {vehiculo ? "Editar Vehículo" : "Nuevo Vehículo"}
          </h6>
        </div>
      </div>
      <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
        <form onSubmit={handleSubmit}>
          <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
            Información del Vehículo
          </h6>
          <div className="flex flex-wrap">
            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                  Placa *
                </label>
                <input
                  type="text"
                  name="placa"
                  value={formData.placa}
                  onChange={handlePlacaChange}
                  onInput={handlePlacaChange}
                  style={{ textTransform: 'uppercase' }}
                  className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 uppercase ${
                    errors.placa ? 'border-red-500' : ''
                  }`}
                  placeholder="ABC123"
                />
                {errors.placa && (
                  <p className="text-red-500 text-xs mt-1">{errors.placa}</p>
                )}
              </div>
            </div>
            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                  Tipo *
                </label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleInputChange}
                  className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                    errors.tipo ? 'border-red-500' : ''
                  }`}
                >
                  <option value="moto">Moto</option>
                  <option value="carro">Carro</option>
                </select>
                {errors.tipo && (
                  <p className="text-red-500 text-xs mt-1">{errors.tipo}</p>
                )}
              </div>
            </div>
            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                  Marca
                </label>
                <select
                  name="marcaId"
                  value={formData.marcaId}
                  onChange={handleInputChange}
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                >
                  <option value="">Seleccionar marca</option>
                  {Array.isArray(marcas) && marcas.map((marca) => (
                    <option key={marca.id} value={marca.id}>
                      {marca.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                  Modelo
                </label>
                <input
                  type="text"
                  name="modelo"
                  value={formData.modelo}
                  onChange={handleInputChange}
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  placeholder="Corolla"
                />
              </div>
            </div>
            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                  Nombre del Conductor
                </label>
                <input
                  type="text"
                  name="nombreConductor"
                  value={formData.nombreConductor}
                  onChange={handleInputChange}
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  placeholder="Juan Pérez"
                />
              </div>
            </div>
            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                  Documento
                </label>
                <input
                  type="text"
                  name="documento"
                  value={formData.documento}
                  onChange={handleInputChange}
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  placeholder="12345678"
                />
              </div>
            </div>
            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                  Kilómetros
                </label>
                <input
                  type="number"
                  name="km"
                  value={formData.km}
                  onChange={handleInputChange}
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  placeholder="50000"
                  min="0"
                />
              </div>
            </div>
            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                  Sigla
                </label>
                <input
                  type="text"
                  name="sigla"
                  value={formData.sigla}
                  onChange={handleInputChange}
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  placeholder="ABC"
                  maxLength="10"
                />
              </div>
            </div>
            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                  Sede *
                </label>
                <select
                  name="sedeId"
                  value={formData.sedeId}
                  onChange={handleInputChange}
                  className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                    errors.sedeId ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Seleccionar sede</option>
                  {sedes.map((sede) => (
                    <option key={sede.id} value={sede.id}>
                      {sede.nombre}
                    </option>
                  ))}
                </select>
                {errors.sedeId && (
                  <p className="text-red-500 text-xs mt-1">{errors.sedeId}</p>
                )}
              </div>
            </div>
          </div>

          <hr className="mt-6 border-b-1 border-blueGray-300" />

          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="bg-blueGray-500 text-white active:bg-blueGray-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ml-1 ease-linear transition-all duration-150 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}