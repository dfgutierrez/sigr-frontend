import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/styles/tailwind.css";

// contexts
import { AuthProvider } from "contexts/AuthContext.js";

// layouts

import Admin from "layouts/Admin.js";
import Auth from "layouts/Auth.js";
import Reportes from "layouts/Reportes.js";
import Inventario from "layouts/Inventario.js";
import Vehiculos from "layouts/Vehiculos.js";
import Ventas from "layouts/Ventas.js";

// views without layouts

import Landing from "views/Landing.js";
import Profile from "views/Profile.js";
import Index from "views/Index.js";

ReactDOM.render(
  <BrowserRouter>
    <AuthProvider>
      <Switch>
        {/* add routes with layouts */}
        <Route path="/admin" component={Admin} />
        <Route path="/auth" component={Auth} />
        <Route path="/reportes" component={Reportes} />
        <Route path="/inventario" component={Inventario} />
        <Route path="/vehiculos" component={Vehiculos} />
        <Route path="/ventas" component={Ventas} />
        {/* add routes without layouts */}
        <Route path="/landing" exact component={Landing} />
        <Route path="/profile" exact component={Profile} />
        <Redirect from="/" exact to="/auth/login" />
        {/* add redirect for first page */}
        <Redirect from="*" to="/" />
      </Switch>
    </AuthProvider>
  </BrowserRouter>,
  document.getElementById("root")
);
