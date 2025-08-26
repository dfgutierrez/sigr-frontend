import axios from "axios";

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '/api/v1' : 'http://localhost:8080/api/v1',
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Importante para autenticación por sesión
});

// Debug interceptor para detectar peticiones fetch nativas problemáticas
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    if (typeof url === 'string' && url.includes('undefined')) {
      console.error("🚨 FETCH: Detected URL with 'undefined':", url);
      console.error("🚨 FETCH: Options:", options);
      console.error("🚨 FETCH: Stack trace:", new Error().stack);
    }
    return originalFetch.apply(this, arguments);
  };
}

// Interceptor para agregar el token a todas las peticiones (solo si existe)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    
    // 🚨 DEBUGGING EXTREMO: Capturar TODAS las peticiones
    console.log("🚨🚨 AXIOS REQUEST INTERCEPTOR:");
    console.log("🚨🚨 Method:", config.method?.toUpperCase());
    console.log("🚨🚨 Base URL:", config.baseURL);
    console.log("🚨🚨 URL:", config.url);
    console.log("🚨🚨 Params:", config.params);
    console.log("🚨🚨 Full URL would be:", `${config.baseURL}${config.url}${config.params ? '?' + new URLSearchParams(config.params).toString() : ''}`);
    
    // Debug para detectar peticiones problemáticas
    if (config.url && config.url.includes("undefined")) {
      console.error("🚨 AXIOS: Detected URL with 'undefined':", config.url);
      console.error("🚨 AXIOS: Method:", config.method);
      console.error("🚨 AXIOS: Full config:", config);
      console.error("🚨 AXIOS: Stack trace:", new Error().stack);
    }
    
    // Agregar Authorization header si hay un token JWT válido
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("📡 Axios: Making request to", config.url, "with Bearer token");
    } else {
      console.log("📡 Axios: Making request to", config.url, "without token");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores de autenticación
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("📡 Axios: Request failed", error.response?.status, error.response?.data);
    
    // Temporalmente comentado para evitar logout automático durante desarrollo
    // if (error.response?.status === 401) {
    //   console.log("🚫 Axios: Unauthorized - redirecting to login");
    //   localStorage.removeItem("token");
    //   localStorage.removeItem("user");
    //   localStorage.removeItem("authenticated");
    //   window.location.href = "/auth/login";
    // }
    return Promise.reject(error);
  }
);

export default api;