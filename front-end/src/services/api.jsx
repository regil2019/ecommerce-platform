import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  timeout: 30000, // Increased timeout to 30 seconds for Cloudinary uploads
  headers: {
    'Content-Type': 'application/json',
  }
});

// RATE LIMITING - ADICIONA ISSO 👇
const requestQueue = [];
let isProcessing = false;

const processRequest = async (config) => {
  if (isProcessing) {
    return new Promise((resolve, reject) => {
      requestQueue.push({ config, resolve, reject });
    });
  }

  isProcessing = true;
  setTimeout(() => {
    isProcessing = false;
    if (requestQueue.length > 0) {
      const next = requestQueue.shift();
      next.resolve(next.config);
    }
  }, 50); // 50ms entre requests

  return config;
};

// INTERCEPTOR ATUALIZADO 👇
api.interceptors.request.use(async (config) => {
  // Rate limiting PRIMEIRO
  await processRequest(config);

  // Remove Content-Type header if sending FormData to let browser set it automatically
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  // Auth token (teu código atual)
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes('/auth/');
      if (!isAuthEndpoint && window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
