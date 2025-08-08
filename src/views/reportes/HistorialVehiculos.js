import React from "react";

// components

import VehiculoTable from "components/Cards/VehiculoTable.js";

export default function HistorialVehiculos() {
  return (
    <>
      <div className="flex flex-wrap mt-4">
        <div className="w-full mb-12 px-4">
          <VehiculoTable />
        </div>
      </div>
    </>
  );
}
