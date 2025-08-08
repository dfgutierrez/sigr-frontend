import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "api/authService.js";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🚀 AuthContext: Initializing...");
    
    // Verificar si hay un usuario logueado al cargar la aplicación
    const savedUser = authService.getCurrentUser();
    const savedToken = authService.getToken();
    
    console.log("💾 AuthContext: Saved user from localStorage:", savedUser);
    console.log("💾 AuthContext: Saved token from localStorage:", savedToken);
    
    if (savedUser && savedToken) {
      console.log("✅ AuthContext: Setting user and token from localStorage");
      setUser(savedUser);
      setToken(savedToken);
    } else {
      console.log("❌ AuthContext: No saved user or token found");
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      console.log("🔐 Attempting login with:", credentials.username);
      const response = await authService.login(credentials);
      console.log("🔐 Login response:", response);
      
      if (response.success) {
        console.log("✅ Login successful, setting user:", response.data.user);
        console.log("🎫 Token:", response.data.token);
        setUser(response.data.user);
        setToken(response.data.token);
        return response;
      }
      throw new Error(response.message || "Error en el login");
    } catch (error) {
      console.error("❌ Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error("❌ AuthContext: Logout error:", error);
      // Limpiar estado local aunque falle el logout en el servidor
      setUser(null);
      setToken(null);
    }
  };

  const isAuthenticated = () => {
    const authenticated = !!token && !!user;
    console.log("🔍 Authentication check:", { token: !!token, user: !!user, authenticated });
    return authenticated;
  };

  const getUserRole = () => {
    return user?.rolId || user?.rol?.id || null;
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    getUserRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};