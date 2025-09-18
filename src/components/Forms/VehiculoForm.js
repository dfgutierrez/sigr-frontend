import React, { useState, useEffect } from "react";
import { vehiculoService } from "api/vehiculoService.js";
import { marcaService } from "api/marcaService.js";
import { sedeService } from "api/sedeService.js";
import { useAuth } from "contexts/AuthContext.js";
import { useToast } from "hooks/useToast.js";

export default function VehiculoForm({ vehiculo, onSave, onCancel, preSelectedSedeId, preSelectedPlaca }) {
  const { user } = useAuth();
  
  // Verificar si el usuario es vendedor
  const isVendedor = () => {
    return user?.rol === 'VENDEDOR' || user?.role === 'VENDEDOR' || 
           (user?.roles && user.roles.includes('VENDEDOR'));
  };
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
      // Determinar la sede a preseleccionar en modo edición
      let sedeId = '';
      
      // Si es vendedor, usar su sede asignada (no la del vehículo)
      if (isVendedor()) {
        if (user?.sedes && Array.isArray(user.sedes) && user.sedes.length > 0) {
          sedeId = user.sedes[0].id.toString();
          console.log('🏢 VENDEDOR: Forzando sede del usuario en vehículo:', user.sedes[0].nombre);
        } else if (user?.sedeId) {
          sedeId = user.sedeId.toString();
          console.log('🏢 VENDEDOR: Forzando sede del usuario (sedeId) en vehículo:', sedeId);
        }
      } 
      // Para otros roles, usar la sede del vehículo
      else {
        sedeId = vehiculo.sedeId || '';
      }
      
      setFormData({
        placa: vehiculo.placa || "",
        tipo: vehiculo.tipo || "moto",
        marcaId: vehiculo.marcaId || "",
        modelo: vehiculo.modelo || "",
        nombreConductor: vehiculo.nombreConductor || "",
        documento: vehiculo.documento || "",
        km: vehiculo.km || 0,
        sigla: vehiculo.sigla || "",
        sedeId: sedeId
      });
    } else {
      // Nuevo vehículo
      let initialFormData = {
        placa: preSelectedPlaca || "",
        tipo: "moto",
        marcaId: "",
        modelo: "",
        nombreConductor: "",
        documento: "",
        km: 0,
        sigla: "",
        sedeId: preSelectedSedeId || ""
      };
      
      setFormData(initialFormData);
    }
  }, [vehiculo, preSelectedSedeId, preSelectedPlaca]);

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
      
      // Establecer sede por defecto
      // Para vendedores, siempre establecer su sede (tanto en crear como editar)
      // Para otros roles, solo en modo creación si no hay preselección
      if (isVendedor() || (!vehiculo && !preSelectedSedeId && !formData.sedeId)) {
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
    
    if (!formData.marcaId) {
      newErrors.marcaId = "La marca es requerida";
    }
    
    if (!formData.modelo.trim()) {
      newErrors.modelo = "El modelo es requerido";
    }
    
    if (!formData.nombreConductor.trim()) {
      newErrors.nombreConductor = "El nombre del conductor es requerido";
    }
    
    if (!formData.documento.trim()) {
      newErrors.documento = "El documento es requerido";
    }
    
    if (!formData.km || formData.km < 0) {
      newErrors.km = "Los kilómetros son requeridos";
    }
    
    if (!formData.sigla.trim()) {
      newErrors.sigla = "La sigla es requerida";
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

      let vehiculoCreado = null;
      
      if (vehiculo) {
        await vehiculoService.updateVehiculo(vehiculo.id, dataToSend);
        showToast("Vehículo actualizado exitosamente", "success");
        console.log('📝 Vehículo editado, no hay redirección');
      } else {
        const response = await vehiculoService.createVehiculo(dataToSend);
        vehiculoCreado = response.data || response;
        console.log('🚗 Vehículo creado para redirección:', vehiculoCreado);
        showToast("Vehículo creado exitosamente", "success");
      }
      
      console.log('🔄 Llamando onSave con:', vehiculoCreado);
      onSave(vehiculoCreado);
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
                  Marca *
                </label>
                <select
                  name="marcaId"
                  value={formData.marcaId}
                  onChange={handleInputChange}
                  className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                    errors.marcaId ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Seleccionar marca</option>
                  {Array.isArray(marcas) && marcas.map((marca) => (
                    <option key={marca.id} value={marca.id}>
                      {marca.nombre}
                    </option>
                  ))}
                </select>
                {errors.marcaId && (
                  <p className="text-red-500 text-xs mt-1">{errors.marcaId}</p>
                )}
              </div>
            </div>
            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                  Modelo *
                </label>
                <input
                  type="text"
                  name="modelo"
                  value={formData.modelo}
                  onChange={handleInputChange}
                  className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                    errors.modelo ? 'border-red-500' : ''
                  }`}
                  placeholder="Corolla"
                />
                {errors.modelo && (
                  <p className="text-red-500 text-xs mt-1">{errors.modelo}</p>
                )}
              </div>
            </div>
            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                  Nombre del Conductor *
                </label>
                <input
                  type="text"
                  name="nombreConductor"
                  value={formData.nombreConductor}
                  onChange={handleInputChange}
                  className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                    errors.nombreConductor ? 'border-red-500' : ''
                  }`}
                  placeholder="Juan Pérez"
                />
                {errors.nombreConductor && (
                  <p className="text-red-500 text-xs mt-1">{errors.nombreConductor}</p>
                )}
              </div>
            </div>
            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                  Documento *
                </label>
                <input
                  type="text"
                  name="documento"
                  value={formData.documento}
                  onChange={handleInputChange}
                  className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                    errors.documento ? 'border-red-500' : ''
                  }`}
                  placeholder="12345678"
                />
                {errors.documento && (
                  <p className="text-red-500 text-xs mt-1">{errors.documento}</p>
                )}
              </div>
            </div>
            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                  Kilómetros *
                </label>
                <input
                  type="number"
                  name="km"
                  value={formData.km}
                  onChange={handleInputChange}
                  className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                    errors.km ? 'border-red-500' : ''
                  }`}
                  placeholder="50000"
                  min="0"
                />
                {errors.km && (
                  <p className="text-red-500 text-xs mt-1">{errors.km}</p>
                )}
              </div>
            </div>
            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                  Sigla *
                </label>
                <input
                  type="text"
                  name="sigla"
                  value={formData.sigla}
                  onChange={handleInputChange}
                  className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                    errors.sigla ? 'border-red-500' : ''
                  }`}
                  placeholder="ABC"
                  maxLength="10"
                />
                {errors.sigla && (
                  <p className="text-red-500 text-xs mt-1">{errors.sigla}</p>
                )}
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
                  disabled={isVendedor()}
                  className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                    errors.sedeId ? 'border-red-500' : ''
                  } ${
                    isVendedor() ? 'bg-blueGray-100 cursor-not-allowed' : ''
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
                {isVendedor() && (
                  <p className="text-gray-500 text-xs mt-1">
                    <i className="fas fa-info-circle mr-1"></i>
                    Como vendedor, no puede modificar la sede del vehículo.
                  </p>
                )}
              </div>
            </div>
          </div>

          <hr className="mt-6 border-b-1 border-blueGray-300" />

          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="bg-white text-blueGray-700 border border-blueGray-300 active:bg-blueGray-50 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md hover:bg-blueGray-50 outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
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