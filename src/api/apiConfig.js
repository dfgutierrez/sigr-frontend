import axios from "axios";

// API Configuration constants
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api/v1' : 'http://localhost:8080/api/v1'),
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

// Error types
export const API_ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

// Custom error class
export class ApiError extends Error {
  constructor(message, type, status, data) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.status = status;
    this.data = data;
  }
}

// Create axios instance
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add authentication token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Debug undefined URLs in development
    if (process.env.NODE_ENV === 'development') {
      if (config.url && config.url.includes("undefined")) {
        console.error("🚨 AXIOS: Detected URL with 'undefined':", config.url);
        console.error("🚨 AXIOS: Full config:", config);
        console.error("🚨 AXIOS: Stack trace:", new Error().stack);
      }
      console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error("📡 Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Create custom error
    let apiError;
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      const message = data?.message || data?.error || error.message;
      
      switch (status) {
        case 400:
          apiError = new ApiError(message, API_ERROR_TYPES.VALIDATION_ERROR, status, data);
          break;
        case 401:
          apiError = new ApiError(message || 'No autorizado', API_ERROR_TYPES.AUTHENTICATION_ERROR, status, data);
          // Auto logout on 401
          if (!originalRequest._retry) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("authenticated");
            window.location.href = "/auth/login";
          }
          break;
        case 403:
          apiError = new ApiError(message || 'Acceso prohibido', API_ERROR_TYPES.AUTHORIZATION_ERROR, status, data);
          break;
        case 404:
          apiError = new ApiError(message || 'Recurso no encontrado', API_ERROR_TYPES.NOT_FOUND_ERROR, status, data);
          break;
        case 422:
          apiError = new ApiError(message || 'Datos inválidos', API_ERROR_TYPES.VALIDATION_ERROR, status, data);
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          apiError = new ApiError(message || 'Error del servidor', API_ERROR_TYPES.SERVER_ERROR, status, data);
          break;
        default:
          apiError = new ApiError(message || 'Error desconocido', API_ERROR_TYPES.UNKNOWN_ERROR, status, data);
      }
    } else if (error.request) {
      // Network error
      if (error.code === 'ECONNABORTED') {
        apiError = new ApiError('Tiempo de espera agotado', API_ERROR_TYPES.TIMEOUT_ERROR, 0, null);
      } else {
        apiError = new ApiError('Error de conexión', API_ERROR_TYPES.NETWORK_ERROR, 0, null);
      }
    } else {
      // Something else
      apiError = new ApiError(error.message || 'Error desconocido', API_ERROR_TYPES.UNKNOWN_ERROR, 0, null);
    }

    console.error(`❌ API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, apiError);
    
    return Promise.reject(apiError);
  }
);

// Utility functions for common API operations
export const apiUtils = {
  // Generic GET request
  get: async (url, config = {}) => {
    const response = await api.get(url, config);
    return response.data;
  },

  // Generic POST request
  post: async (url, data, config = {}) => {
    const response = await api.post(url, data, config);
    return response.data;
  },

  // Generic PUT request
  put: async (url, data, config = {}) => {
    const response = await api.put(url, data, config);
    return response.data;
  },

  // Generic DELETE request
  delete: async (url, config = {}) => {
    const response = await api.delete(url, config);
    return response.data;
  },

  // Upload file
  uploadFile: async (url, formData, onProgress = null) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };
    
    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      };
    }
    
    const response = await api.post(url, formData, config);
    return response.data;
  }
};

export default api;