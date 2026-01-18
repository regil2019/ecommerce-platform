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
    let errorMsg = error.response?.data?.message ||
                    error.response?.data?.error ||
                    error.message;

    // Se for erro de validação com array de errors
    if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
      errorMsg = error.response.data.errors.map(err => err.msg || err.message).join(', ');
    }

    throw new Error(errorMsg || 'Falha no registro');
  }
};

export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const response = await api.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
    }
    return null;
  }
};
