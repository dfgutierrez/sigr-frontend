// Mock del servicio de autenticación para desarrollo
export const mockAuthService = {
  login: async (credentials) => {
    console.log("🔧 MockAuth: Simulating login with:", credentials);
    
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simular usuarios válidos
    const validUsers = {
      'admin': 'password123',
      'admin': 'admin',
      'usuario': 'usuario123',
      'test': 'test123'
    };
    
    if (validUsers[credentials.username] === credentials.password) {
      const mockUser = {
        id: 1,
        username: credentials.username,
        nombreCompleto: credentials.username === 'admin' ? 'Administrador del Sistema' : 'Usuario de Prueba',
        email: `${credentials.username}@sigr.com`,
        roles: credentials.username === 'admin' ? ['ADMIN', 'USER'] : ['USER'],
        sedes: [
          { id: 1, nombre: 'Sede Principal' },
          { id: 2, nombre: 'Sucursal Norte' }
        ]
      };
      
      const mockToken = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log("✅ MockAuth: Login successful");
      
      return {
        data: {
          success: true,
          message: "Login exitoso",
          data: {
            token: mockToken,
            user: mockUser,
            expiresIn: 3600 // 1 hora
          }
        }
      };
    } else {
      console.log("❌ MockAuth: Invalid credentials");
      throw new Error("Credenciales inválidas");
    }
  },
  
  logout: async () => {
    console.log("🔧 MockAuth: Simulating logout");
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: { success: true, message: "Logout exitoso" } };
  },
  
  getCurrentUser: async () => {
    console.log("🔧 MockAuth: Getting current user");
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const token = localStorage.getItem('token');
    if (!token || !token.startsWith('mock_token_')) {
      throw new Error("Token inválido");
    }
    
    return {
      data: {
        success: true,
        data: JSON.parse(localStorage.getItem('user') || '{}')
      }
    };
  }
};