import { lazy } from 'react';

// Lazy loaded components with better error handling
const createLazyComponent = (importFunc, componentName = 'Component') => {
  return lazy(() =>
    importFunc().catch((error) => {
      console.error(`Error loading ${componentName}:`, error);
      // Return a fallback component instead of crashing
      return {
        default: () => (
          <div className="text-center py-8">
            <div className="text-red-500">
              <i className="fas fa-exclamation-triangle text-2xl mb-2"></i>
              <p>Error cargando {componentName}</p>
            </div>
          </div>
        )
      };
    })
  );
};

// Layout components
export const AdminLayout = createLazyComponent(
  () => import('../layouts/Admin'), 
  'Admin Layout'
);

export const AuthLayout = createLazyComponent(
  () => import('../layouts/Auth'), 
  'Auth Layout'
);

export const ReportesLayout = createLazyComponent(
  () => import('../layouts/Reportes'), 
  'Reportes Layout'
);

export const InventarioLayout = createLazyComponent(
  () => import('../layouts/Inventario'), 
  'Inventario Layout'
);

export const VehiculosLayout = createLazyComponent(
  () => import('../layouts/Vehiculos'), 
  'Vehiculos Layout'
);

export const VentasLayout = createLazyComponent(
  () => import('../layouts/Ventas'), 
  'Ventas Layout'
);

// View components
export const Login = createLazyComponent(
  () => import('../views/auth/Login'), 
  'Login'
);

export const Register = createLazyComponent(
  () => import('../views/auth/Register'), 
  'Register'
);

export const Dashboard = createLazyComponent(
  () => import('../views/admin/Dashboard'), 
  'Dashboard'
);

export const Usuarios = createLazyComponent(
  () => import('../views/admin/Usuarios'), 
  'Usuarios'
);

export const Productos = createLazyComponent(
  () => import('../views/inventario/Productos'), 
  'Productos'
);

export const Vehiculos = createLazyComponent(
  () => import('../views/vehiculos/Vehiculos'), 
  'Vehiculos'
);

export const Ventas = createLazyComponent(
  () => import('../views/ventas/Ventas'), 
  'Ventas'
);

export const Landing = createLazyComponent(
  () => import('../views/Landing'), 
  'Landing'
);

export const Profile = createLazyComponent(
  () => import('../views/Profile'), 
  'Profile'
);