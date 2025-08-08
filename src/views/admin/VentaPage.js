import React, { useState } from "react";
import VehiculoSearchForSale from "components/Forms/VehiculoSearchForSale.js";

export default function VentaPage() {
  const [selectedVehiculo, setSelectedVehiculo] = useState(null);
  const [placaNoEncontrada, setPlacaNoEncontrada] = useState("");

  const handleVehiculoFound = (vehiculo) => {
    console.log("✅ Vehículo encontrado para venta:", vehiculo);
    setSelectedVehiculo(vehiculo);
    setPlacaNoEncontrada("");
    // Aquí puedes continuar con el proceso de venta usando los datos del vehículo
    // Por ejemplo, cargar productos asociados, historial de mantenimiento, etc.
  };

  const handleVehiculoNotFound = (placa) => {
    console.log("⚠️ Vehículo no encontrado:", placa);
    setSelectedVehiculo(null);
    setPlacaNoEncontrada(placa);
    // Aquí puedes mostrar opciones para registrar el vehículo o continuar sin él
  };

  return (
    <>
      <div className="flex flex-wrap">
        <div className="w-full lg:w-8/12 px-4">
          <VehiculoSearchForSale
            onVehiculoFound={handleVehiculoFound}
            onVehiculoNotFound={handleVehiculoNotFound}
          />
          
          {selectedVehiculo && (
            <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-white border-0">
              <div className="rounded-t bg-blueGray-50 mb-0 px-6 py-6">
                <h6 className="text-blueGray-700 text-xl font-bold">
                  Crear Venta para {selectedVehiculo.placa}
                </h6>
              </div>
              <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                <p className="text-blueGray-600">
                  Aquí puedes continuar con el formulario de venta usando la información del vehículo encontrado.
                </p>
                {/* Aquí agregarías el resto del formulario de venta */}
              </div>
            </div>
          )}

          {placaNoEncontrada && (
            <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-white border-0">
              <div className="rounded-t bg-blueGray-50 mb-0 px-6 py-6">
                <h6 className="text-blueGray-700 text-xl font-bold">
                  Opciones para {placaNoEncontrada}
                </h6>
              </div>
              <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                <div className="flex flex-wrap gap-4">
                  <button className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150">
                    Registrar Vehículo
                  </button>
                  <button className="bg-blueGray-500 text-white active:bg-blueGray-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150">
                    Continuar sin Vehículo
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}