import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

// components

import AdminNavbar from "components/Navbars/AdminNavbar.js";
import Sidebar from "components/Sidebar/Sidebar.js";
import HeaderStats from "components/Headers/HeaderStats.js";
import FooterAdmin from "components/Footers/FooterAdmin.js";

// views

import HistorialVehiculos from "views/reportes/HistorialVehiculos.js";
import InventarioGeneral from "views/reportes/InventarioGeneral.js";
import VentasMovimientos from "views/reportes/VentasMovimientos.js";
import DashboardReportes from "views/reportes/DashboardReportes.js";


export default function Reportes() {
  return (
    <>
      <Sidebar />
      <div className="relative md:ml-64 bg-blueGray-100">
        <AdminNavbar />
        {/* Header */}
        <HeaderStats />
        <div className="px-4 md:px-10 mx-auto w-full -m-24">
          <Switch>
              <Route path="/reportes/dashboard" exact component={DashboardReportes} />
              <Route path="/reportes/historial_vehiculos" exact component={HistorialVehiculos} />
              <Route path="/reportes/inventario_general" exact component={InventarioGeneral} />
              <Route path="/reportes/inventario" exact component={InventarioGeneral} />
              <Route path="/reportes/ventas_movimientos" exact component={VentasMovimientos} />
              <Redirect from="/reportes" to="/reportes/dashboard" />
          </Switch>
          <FooterAdmin />
        </div>
      </div>
    </>
  );
}
