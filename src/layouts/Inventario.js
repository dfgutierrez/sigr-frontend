import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

// components
import AdminNavbar from "components/Navbars/AdminNavbar.js";
import Sidebar from "components/Sidebar/Sidebar.js";
import HeaderStats from "components/Headers/HeaderStats.js";
import FooterAdmin from "components/Footers/FooterAdmin.js";

// views
import Productos from "views/inventario/Productos.js";
import Categorias from "views/inventario/Categorias.js";
import Marcas from "views/inventario/Marcas.js";
import InventarioSedes from "views/inventario/InventarioSedes.js";

export default function Inventario() {
  return (
    <>
      <Sidebar />
      <div className="relative md:ml-64 bg-blueGray-100">
        <AdminNavbar />
        {/* Header */}
        <HeaderStats />
        <div className="px-4 md:px-10 mx-auto w-full -m-24">
          <Switch>
            <Route path="/inventario/productos" exact component={Productos} />
            <Route path="/inventario/categorias" exact component={Categorias} />
            <Route path="/inventario/marcas" exact component={Marcas} />
            <Route path="/inventario/sedes" exact component={InventarioSedes} />
            <Redirect from="/inventario" to="/inventario/productos" />
          </Switch>
          <FooterAdmin />
        </div>
      </div>
    </>
  );
}