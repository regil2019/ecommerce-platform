import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;   
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't force redirect to /login when the initial /auth/me check returns 401
    const isAuthMe = error.config?.url && error.config.url.includes('/auth/me');
    if (
      error.response?.status === 401 &&
      !isAuthMe &&
      window.location.pathname !== '/login'
    ) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;