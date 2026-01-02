import api from './api';

export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Falha no login');
    }
    
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || 
                    error.response?.data?.error || 
                    error.message;
    throw new Error(errorMsg || 'Falha no login');
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Falha no registro');
    }
    
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || 
                    error.response?.data?.error || 
                    error.message;
    throw new Error(errorMsg || 'Falha no registro');
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    return null;
  }
};
