import { useState, useCallback } from 'react';
import { usuarioService } from 'api/usuarioService.js';

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usuarioService.getAllUsuarios();
      setUsuarios(data);
    } catch (err) {
      setError(err.message || 'Error al cargar usuarios');
      console.error('Error fetching usuarios:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSedes = async () => {
    try {
      const data = await usuarioService.getAllSedes();
      setSedes(data);
    } catch (err) {
      console.error('Error fetching sedes:', err);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await usuarioService.getAllRoles();
      setRoles(data);
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [usuariosData, sedesData, rolesData] = await Promise.all([
        usuarioService.getAllUsuarios(),
        usuarioService.getAllSedes(),
        usuarioService.getAllRoles()
      ]);
      setUsuarios(usuariosData);
      setSedes(sedesData);
      setRoles(rolesData);
    } catch (err) {
      setError(err.message || 'Error al cargar datos');
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUsuario = async (userData, foto = null) => {
    try {
      setLoading(true);
      setError(null);
      await usuarioService.createUsuario(userData, foto);
      await fetchUsuarios(); // Reload users
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al crear usuario';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateUsuario = async (id, userData, foto = null) => {
    try {
      setLoading(true);
      setError(null);
      await usuarioService.updateUsuario(id, userData, foto);
      await fetchUsuarios(); // Reload users
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al actualizar usuario';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleUsuarioEstado = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await usuarioService.toggleUsuarioEstado(id);
      await fetchUsuarios(); // Reload users
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al cambiar estado del usuario';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    usuarios,
    sedes,
    roles,
    loading,
    error,
    
    // Actions
    fetchUsuarios,
    fetchSedes,
    fetchRoles,
    loadInitialData,
    createUsuario,
    updateUsuario,
    toggleUsuarioEstado,
    
    // Helpers
    clearError: useCallback(() => setError(null), [])
  };
};