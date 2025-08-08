import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

// components

import AdminNavbar from "components/Navbars/AdminNavbar.js";
import Sidebar from "components/Sidebar/Sidebar.js";
import HeaderStats from "components/Headers/HeaderStats.js";
import FooterAdmin from "components/Footers/FooterAdmin.js";

// views

import Dashboard from "views/admin/Dashboard.js";
import Maps from "views/admin/Maps.js";
import Settings from "views/admin/Settings.js";
import Tables from "views/admin/Tables.js";
import Usuarios from "views/admin/Usuarios.js";
import Sedes from "views/admin/Sedes.js";
import Roles from "views/admin/Roles.js";
import MenuAdmin from "views/admin/MenuAdmin.js";
import MenuAdminSimple from "views/admin/MenuAdminSimple.js";
import MenuAdminTest from "views/admin/MenuAdminTest.js";

// inventario views
import Productos from "views/inventario/Productos.js";
import Categorias from "views/inventario/Categorias.js";
import Marcas from "views/inventario/Marcas.js";
import InventarioSedes from "views/inventario/InventarioSedes.js";
import TestInventario from "views/inventario/TestInventario.js";
import ProductosSimple from "views/inventario/ProductosSimple.js";

// vehiculos views
import Vehiculos from "views/vehiculos/Vehiculos.js";

// ventas views
import Ventas from "views/ventas/Ventas.js";

// reportes views
import DashboardReportes from "views/reportes/DashboardReportes.js";
import VentasMovimientos from "views/reportes/VentasMovimientos.js";

export default function Admin() {
  return (
    <>
      <Sidebar />
      <div className="relative md:ml-64 bg-blueGray-100">
        <AdminNavbar />
        {/* Header */}
        <HeaderStats />
        <div className="px-4 md:px-10 mx-auto w-full -m-24">
          <Switch>
            <Route path="/admin/dashboard" exact component={Dashboard} />
            <Route path="/admin/maps" exact component={Maps} />
            <Route path="/admin/settings" exact component={Settings} />
            <Route path="/admin/tables" exact component={Tables} />
            <Route path="/admin/usuarios" exact component={Usuarios} />
            <Route path="/admin/sedes" exact component={Sedes} />
            <Route path="/admin/roles" exact component={Roles} />
            <Route path="/admin/menu-admin" exact component={MenuAdmin} />
            <Route path="/admin/menu-admin-test" exact component={MenuAdminTest} />
            
            {/* Inventario Routes */}
            <Route path="/admin/inventario/test" exact component={TestInventario} />
            <Route path="/admin/inventario/productos-simple" exact component={ProductosSimple} />
            <Route path="/admin/inventario/productos" exact component={Productos} />
            <Route path="/admin/inventario/categorias" exact component={Categorias} />
            <Route path="/admin/inventario/marcas" exact component={Marcas} />
            <Route path="/admin/inventario/sedes" exact component={InventarioSedes} />
            
            {/* Vehiculos Routes */}
            <Route path="/admin/vehiculos" exact component={Vehiculos} />
            
            {/* Ventas Routes */}
            <Route path="/admin/ventas" exact component={Ventas} />
            
            {/* Reportes Routes */}
            <Route path="/admin/reportes/dashboard" exact component={DashboardReportes} />
            <Route path="/admin/reportes/ventas-movimientos" exact component={VentasMovimientos} />
            
            <Redirect from="/admin" to="/admin/dashboard" />
          </Switch>
          <FooterAdmin />
        </div>
      </div>
    </>
  );
}
