// Application constants

// User roles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  VENDEDOR: 'VENDEDOR',
  SUPERVISOR: 'SUPERVISOR'
};

// Toast types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Vehicle types
export const VEHICLE_TYPES = {
  MOTO: 'moto',
  CARRO: 'carro'
};

// Form validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Este campo es requerido',
  EMAIL_INVALID: 'Ingrese un email válido',
  PASSWORD_MIN_LENGTH: 'La contraseña debe tener al menos 6 caracteres',
  POSITIVE_NUMBER: 'El valor debe ser mayor que 0',
  INVALID_PHONE: 'Número de teléfono inválido'
};

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  
  // Users
  USERS: '/usuarios',
  USERS_WITH_FILE: (id) => `/usuarios/${id}/with-file`,
  TOGGLE_USER_STATUS: (id) => `/usuarios/${id}/toggle-estado`,
  
  // Products
  PRODUCTS: '/productos',
  PRODUCTS_BY_SEDE: (sedeId) => `/productos/sede/${sedeId}/con-stock`,
  
  // Vehicles
  VEHICLES: '/vehiculos',
  
  // Sales
  SALES: '/ventas',
  
  // Inventory
  INVENTORY: '/inventarios',
  INVENTORY_BY_PRODUCT_SEDE: (productoId, sedeId) => `/inventarios/producto/${productoId}/sede/${sedeId}`,
  
  // Categories
  CATEGORIES: '/categorias',
  
  // Brands
  BRANDS: '/marcas',
  
  // Sedes
  SEDES: '/sedes',
  
  // Roles
  ROLES: '/roles',
  
  // Menus
  MY_MENUS: '/menus/my-menus',
  MENUS: '/menus'
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  AUTHENTICATED: 'authenticated',
  THEME: 'theme'
};

// Table pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50]
};

// File upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// Form field types
export const FIELD_TYPES = {
  TEXT: 'text',
  EMAIL: 'email',
  PASSWORD: 'password',
  NUMBER: 'number',
  SELECT: 'select',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  TEXTAREA: 'textarea',
  FILE: 'file',
  DATE: 'date'
};

// Loading states
export const LOADING_STATES = {
  IDLE: 'idle',
  PENDING: 'pending',
  SUCCESS: 'success',
  ERROR: 'error'
};

// Modal sizes
export const MODAL_SIZES = {
  SMALL: 'sm',
  MEDIUM: 'md',
  LARGE: 'lg',
  EXTRA_LARGE: 'xl'
};

// Animation durations (in milliseconds)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
};