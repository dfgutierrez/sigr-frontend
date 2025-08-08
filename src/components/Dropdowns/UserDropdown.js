import React from "react";
import { createPopper } from "@popperjs/core";
import { useAuth } from "contexts/AuthContext.js";
import { useHistory } from "react-router-dom";

const UserDropdown = () => {
  // dropdown props
  const [dropdownPopoverShow, setDropdownPopoverShow] = React.useState(false);
  const btnDropdownRef = React.createRef();
  const popoverDropdownRef = React.createRef();
  const { user, logout } = useAuth();
  const history = useHistory();
  
  // Estado para controlar si ya falló la imagen
  const [imageError, setImageError] = React.useState(false);
  // Estado para controlar el logout
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  // Debug: Ver qué datos del usuario tenemos
  React.useEffect(() => {
    console.log('👤 UserDropdown - User object:', user);
    console.log('📸 UserDropdown - fotoUrl:', user?.fotoUrl);
    console.log('🖼️ UserDropdown - fotoBase64:', user?.fotoBase64 ? 'PRESENT' : 'NOT PRESENT');
    console.log('📸 UserDropdown - fotoUrl type:', typeof user?.fotoUrl);
    // Reset error state cuando cambie el usuario
    setImageError(false);
  }, [user]);

  // Función para obtener la mejor opción de imagen
  const getUserImageSrc = () => {
    // Prioridad: fotoBase64 > fotoUrl válida > null
    if (user?.fotoBase64 && user.fotoBase64.trim() !== '') {
      return user.fotoBase64;
    }
    if (user?.fotoUrl && user.fotoUrl !== 'undefined' && user.fotoUrl.trim() !== '') {
      return user.fotoUrl;
    }
    return null;
  };

  const openDropdownPopover = () => {
    createPopper(btnDropdownRef.current, popoverDropdownRef.current, {
      placement: "bottom-start",
    });
    setDropdownPopoverShow(true);
  };
  const closeDropdownPopover = () => {
    setDropdownPopoverShow(false);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log("🔐 UserDropdown: Starting logout process");
      
      await logout();
      
      console.log("✅ UserDropdown: Logout completed, redirecting to login");
      
      // Esperar un momento para asegurar que el logout se completó
      setTimeout(() => {
        history.push("/auth/login");
      }, 100);
      
    } catch (error) {
      console.error("❌ UserDropdown: Error during logout:", error);
      // Redirigir al login aunque haya error
      setTimeout(() => {
        history.push("/auth/login");
      }, 100);
    } finally {
      setIsLoggingOut(false);
    }
  };
  return (
    <>
      <a
        className="text-blueGray-500 block"
        href="#pablo"
        ref={btnDropdownRef}
        onClick={(e) => {
          e.preventDefault();
          dropdownPopoverShow ? closeDropdownPopover() : openDropdownPopover();
        }}
      >
        <div className="items-center flex">
          <span className="w-12 h-12 text-sm text-white bg-blueGray-200 inline-flex items-center justify-center rounded-full">
            {getUserImageSrc() && !imageError ? (
              <img
                alt="Foto de perfil"
                className="w-full rounded-full align-middle border-none shadow-lg object-cover"
                src={getUserImageSrc()}
                onError={(e) => {
                  console.log('❌ Error loading user photo:', getUserImageSrc());
                  // Marcar como error para evitar ciclo infinito
                  setImageError(true);
                }}
              />
            ) : (
              // Si no hay foto válida o hubo error, mostrar iniciales o ícono por defecto
              user?.nombreCompleto ? (
                <span className="text-sm font-semibold text-blueGray-600">
                  {user.nombreCompleto.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </span>
              ) : (
                // Solo usar ícono por defecto como último recurso
                <span className="text-sm font-semibold text-blueGray-600">
                  <i className="fas fa-user"></i>
                </span>
              )
            )}
          </span>
        </div>
      </a>
      <div
        ref={popoverDropdownRef}
        className={
          (dropdownPopoverShow ? "block " : "hidden ") +
          "bg-white text-base z-50 float-left py-2 list-none text-left rounded shadow-lg min-w-48"
        }
      >
        <div className="text-sm py-2 px-4 font-semibold text-blueGray-700 border-b border-blueGray-200">
          {user?.nombreCompleto || user?.nombre || user?.username || "Usuario"}
        </div>
        <div className="h-0 my-2 border border-solid border-blueGray-100" />
        <a
          href="#pablo"
          className={
            "text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-red-600 hover:bg-red-50 " +
            (isLoggingOut ? "opacity-50 cursor-not-allowed" : "")
          }
          onClick={(e) => {
            e.preventDefault();
            if (!isLoggingOut) {
              handleLogout();
            }
          }}
        >
          <i className={`${isLoggingOut ? 'fas fa-spinner fa-spin' : 'fas fa-sign-out-alt'} mr-2`}></i>
          {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
        </a>
      </div>
    </>
  );
};

export default UserDropdown;
