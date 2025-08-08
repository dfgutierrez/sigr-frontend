import { useState, useCallback } from 'react';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiCall, options = {}) => {
    const {
      showLoading = true,
      showError = true,
      onSuccess,
      onError
    } = options;

    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      const result = await apiCall();
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Ha ocurrido un error';
      
      if (showError) setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    clearError,
    reset
  };
};

// Hook especializado para manejar listas de datos
export const useApiList = (fetchFunction) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetch = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunction(params);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al cargar datos';
      setError(errorMessage);
      console.error('API List Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  const refresh = useCallback(() => {
    return fetch();
  }, [fetch]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setData([]);
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    fetch,
    refresh,
    clearError,
    reset
  };
};