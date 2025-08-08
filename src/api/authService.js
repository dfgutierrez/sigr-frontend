import api from "./axiosConfig";
import { mockAuthService } from "./mockAuthService";

export const authService = {
  login: async (credentials) => {
    try {
      console.log("🔐 AuthService: Sending login request with:", credentials);
      
      // Enviar username y password al endpoint de login
      const response = await api.post("/auth/login", {
        username: credentials.username,
        password: credentials.password
      });
      
      console.log("🔐 AuthService: Full login response:", response);
      console.log("🔐 AuthService: Response data:", response.data);
      
      // Tu API devuelve un accessToken JWT
      if (response.data.success && response.data.data) {
        const responseData = response.data.data;
        const accessToken = responseData.accessToken;
        const user = responseData.user;
        
        console.log("👤 AuthService: User data received:", user);
        console.log("🎫 AuthService: Access token received:", accessToken ? "YES" : "NO");
        
        // Guardar usuario y token en localStorage
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", accessToken);
        localStorage.setItem("authenticated", "true");
        
        console.log("✅ AuthService: User and token saved to localStorage");
        
        return { 
          success: true, 
          data: { 
            user: user,
            token: accessToken
          } 
        };
      } else {
        console.error("❌ AuthService: Login failed - no user data");
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("❌ AuthService: Login error:", error);
      console.error("❌ AuthService: Error response:", error.response?.data);
      
      // Si es un error de red (backend no disponible), usar mock
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.log("🔧 AuthService: Backend not available, using mock authentication");
        try {
          const mockResponse = await mockAuthService.login(credentials);
          const mockData = mockResponse.data.data;
          
          // Guardar datos del mock en localStorage
          localStorage.setItem("user", JSON.stringify(mockData.user));
          localStorage.setItem("token", mockData.token);
          localStorage.setItem("authenticated", "true");
          localStorage.setItem("usingMock", "true"); // Indicar que estamos usando mock
          
          console.log("✅ AuthService: Mock login successful");
          
          return {
            success: true,
            data: {
              user: mockData.user,
              token: mockData.token
            }
          };
        } catch (mockError) {
          console.error("❌ AuthService: Mock login also failed:", mockError);
          throw mockError;
        }
      }
      
      throw error;
    }
  },

  logout: async () => {
    try {
      console.log("🔐 AuthService: Sending logout request");
      
      // Solo hacer la llamada al endpoint si no estamos usando mock
      if (!localStorage.getItem("usingMock")) {
        try {
          const response = await api.post("/auth/logout");
          console.log("✅ AuthService: Logout response:", response.data);
        } catch (error) {
          console.error("❌ AuthService: Logout request failed:", error);
          // Continuar con el logout local aunque falle el servidor
        }
      }
      
      // Limpiar localStorage siempre, independientemente de la respuesta del servidor
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("authenticated");
      localStorage.removeItem("usingMock");
      
      console.log("✅ AuthService: Local logout completed");
      
    } catch (error) {
      console.error("❌ AuthService: Logout error:", error);
      // Limpiar localStorage incluso si hay error
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("authenticated");
      localStorage.removeItem("usingMock");
      throw error;
    }
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  getToken: () => {
    return localStorage.getItem("token");
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("authenticated") && !!localStorage.getItem("user");
  },

  isUsingMock: () => {
    return !!localStorage.getItem("usingMock");
  }
};