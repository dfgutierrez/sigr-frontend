import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

// components
import AdminNavbar from "components/Navbars/AdminNavbar.js";
import Sidebar from "components/Sidebar/Sidebar.js";
import HeaderStats from "components/Headers/HeaderStats.js";
import FooterAdmin from "components/Footers/FooterAdmin.js";

// views
import Ventas from "views/ventas/Ventas.js";
import VentaForm from "components/Forms/VentaForm.js";

// Wrapper component for the new sale form
function NuevaVentaWrapper() {
  const handleSave = () => {
    window.location.href = "/ventas/historial";
  };

  const handleCancel = () => {
    window.location.href = "/ventas/historial";
  };

  return (
    <div className="flex flex-wrap">
      <div className="w-full px-4">
        <VentaForm onSave={handleSave} onCancel={handleCancel} />
      </div>
    </div>
  );
}

export default function VentasLayout() {
  return (
    <>
      <Sidebar />
      <div className="relative md:ml-64 bg-blueGray-100">
        <AdminNavbar />
        {/* Header */}
        <HeaderStats />
        <div className="px-4 md:px-10 mx-auto w-full -m-24">
          <Switch>
            <Route path="/ventas/nueva" exact component={NuevaVentaWrapper} />
            <Route path="/ventas/historial" exact component={Ventas} />
            <Redirect from="/ventas" to="/ventas/historial" />
          </Switch>
          <FooterAdmin />
        </div>
      </div>
    </>
  );
}