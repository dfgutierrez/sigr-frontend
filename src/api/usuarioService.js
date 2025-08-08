import api from "./axiosConfig";

export const usuarioService = {
  // Obtener todos los usuarios (incluyendo activos e inactivos)
  getAllUsuarios: async () => {
    try {
      const response = await api.get("/usuarios");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching usuarios:", error);
      throw error;
    }
  },

  // Obtener solo usuarios activos
  getActiveUsuarios: async () => {
    try {
      const response = await api.get("/usuarios?estado=true");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching active usuarios:", error);
      throw error;
    }
  },

  // Obtener usuario por ID
  getUsuarioById: async (id) => {
    try {
      const response = await api.get(`/usuarios/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching usuario with id ${id}:`, error);
      throw error;
    }
  },

  // Crear nuevo usuario con multipart/form-data
  createUsuario: async (usuario, foto = null) => {
    try {
      const formData = new FormData();
      
      // Agregar campos requeridos
      formData.append('username', usuario.username);
      formData.append('password', usuario.password);
      formData.append('nombreCompleto', usuario.nombreCompleto);
      formData.append('estado', usuario.estado.toString());
      
      // Agregar campos opcionales
      if (usuario.sedeId) {
        formData.append('sedeId', usuario.sedeId.toString());
      }
      
      // Convertir roleIds array a string separado por comas
      if (usuario.roleIds && usuario.roleIds.length > 0) {
        formData.append('roleIds', usuario.roleIds.join(','));
      }
      
      // Agregar foto si existe
      if (foto) {
        formData.append('foto', foto);
      }
      
      console.log('📤 Enviando FormData para crear usuario:', {
        username: usuario.username,
        nombreCompleto: usuario.nombreCompleto,
        estado: usuario.estado,
        sedeId: usuario.sedeId,
        roleIds: usuario.roleIds?.join(','),
        foto: foto ? foto.name : 'null'
      });
      
      const response = await api.post("/usuarios", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error("Error creating usuario:", error);
      throw error;
    }
  },

  // Actualizar usuario existente
  updateUsuario: async (id, usuario, foto = null) => {
    try {
      // Decidir qué endpoint usar basado en si hay foto
      const hasPhoto = foto !== null && foto !== undefined;
      const endpoint = hasPhoto ? `/usuarios/${id}/with-file` : `/usuarios/${id}`;
      
      console.log(`📤 Actualizando usuario (${hasPhoto ? 'con foto' : 'sin foto'}):`, {
        id,
        endpoint,
        username: usuario.username,
        nombreCompleto: usuario.nombreCompleto,
        estado: usuario.estado,
        sedeId: usuario.sedeId,
        roleIds: usuario.roleIds?.join(','),
        hasPassword: !!(usuario.password && usuario.password.trim()),
        foto: foto ? foto.name : 'null'
      });

      if (hasPhoto) {
        // Si hay foto, usar multipart/form-data
        const formData = new FormData();
        
        // Agregar campos básicos
        formData.append('username', usuario.username);
        formData.append('nombreCompleto', usuario.nombreCompleto);
        formData.append('estado', usuario.estado.toString());
        
        // Solo agregar password si no está vacío
        if (usuario.password && usuario.password.trim()) {
          formData.append('password', usuario.password);
        }
        
        // Agregar campos opcionales
        if (usuario.sedeId) {
          formData.append('sedeId', usuario.sedeId.toString());
        }
        
        // Convertir roleIds array a string separado por comas
        if (usuario.roleIds && usuario.roleIds.length > 0) {
          formData.append('roleIds', usuario.roleIds.join(','));
        }
        
        // Agregar foto
        formData.append('foto', foto);
        
        const response = await api.put(endpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        return response.data;
      } else {
        // Si no hay foto, usar JSON
        const userData = {
          username: usuario.username,
          nombreCompleto: usuario.nombreCompleto,
          estado: usuario.estado,
          sedeId: usuario.sedeId || null,
          roleIds: usuario.roleIds || []
        };
        
        // Solo agregar password si no está vacío
        if (usuario.password && usuario.password.trim()) {
          userData.password = usuario.password;
        }
        
        const response = await api.put(endpoint, userData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        return response.data;
      }
    } catch (error) {
      console.error(`Error updating usuario with id ${id}:`, error);
      throw error;
    }
  },

  // Cambiar estado del usuario (activar/desactivar)
  toggleUsuarioEstado: async (id) => {
    try {
      const response = await api.put(`/usuarios/${id}/toggle-estado`);
      return response.data;
    } catch (error) {
      console.error(`Error toggling estado for usuario with id ${id}:`, error);
      throw error;
    }
  },

  // Métodos legacy para compatibilidad
  deactivateUsuario: async (id) => {
    console.warn("deactivateUsuario is deprecated, use toggleUsuarioEstado instead");
    return await usuarioService.toggleUsuarioEstado(id);
  },

  activateUsuario: async (id) => {
    console.warn("activateUsuario is deprecated, use toggleUsuarioEstado instead");
    return await usuarioService.toggleUsuarioEstado(id);
  },

  // Obtener roles de un usuario (extraído del usuario completo)
  getUserRoles: async (id) => {
    try {
      const response = await api.get(`/usuarios/${id}`);
      return response.data.data?.roles || [];
    } catch (error) {
      console.error(`Error fetching roles for usuario ${id}:`, error);
      return [];
    }
  },

  // Los roles se asignan al crear/actualizar el usuario
  assignRoles: async (id, roleIds) => {
    console.info('Roles are assigned during user creation/update via roleIds field');
    // Este método existe por compatibilidad, pero los roles se asignan en updateUsuario
    return { success: true };
  },

  // Obtener todas las sedes (para el dropdown)
  getAllSedes: async () => {
    try {
      const response = await api.get("/sedes");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching sedes:", error);
      throw error;
    }
  },

  // Obtener todos los roles (para el dropdown)
  getAllRoles: async () => {
    try {
      const response = await api.get("/roles");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw error;
    }
  },

  // Subir foto de usuario
  uploadUserPhoto: async (userId, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('photo', imageFile);
      
      const response = await api.post(`/usuarios/${userId}/upload-photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error uploading user photo:', error);
      throw error;
    }
  },

  // Método legacy para compatibilidad (ahora apunta a desactivar)
  deleteUsuario: async (id) => {
    console.warn("deleteUsuario is deprecated, use deactivateUsuario instead");
    return await usuarioService.deactivateUsuario(id);
  }
};