import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// --- Request Interceptor ---
api.interceptors.request.use((config) => {
  // Remove Content-Type for FormData (let browser set it)
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  // Prevent caching for GET requests to force fresh data
  if (config.method === 'get') {
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    config.headers['Pragma'] = 'no-cache';
    config.headers['Expires'] = '0';
    config.params = { ...config.params, _t: Date.now() };
  }

  // Attach JWT token from localStorage
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// --- Response Interceptor ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        error.userMessage = 'Request timed out. Please try again.';
        error.userMessageKey = 'common.errorTimeout';
      } else {
        error.userMessage = 'Network error. Check your connection.';
        error.userMessageKey = 'common.errorNetwork';
      }
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    switch (status) {
      case 401: {
        // Clear invalid/expired token automatically
        localStorage.removeItem('token');
        error.userMessage = data?.message || 'Session expired.';
        error.userMessageKey = 'common.errorUnauthorized';
        break;
      }
      case 403:
        error.userMessage = data?.message || 'Access denied.';
        error.userMessageKey = 'common.errorForbidden';
        break;
      case 404:
        error.userMessage = data?.error || data?.message || 'Resource not found.';
        error.userMessageKey = 'common.errorNotFound';
        break;
      case 422:
      case 400:
        error.userMessage = data?.message || data?.error || 'Invalid request.';
        error.userMessageKey = 'common.errorValidation';
        break;
      case 429:
        error.userMessage = 'Too many requests. Please wait and try again.';
        error.userMessageKey = 'common.errorRateLimit';
        break;
      default:
        if (status >= 500) {
          error.userMessage = 'Server error. Please try again later.';
          error.userMessageKey = 'common.errorServer';
        } else {
          error.userMessage = data?.message || data?.error || 'An unexpected error occurred.';
          error.userMessageKey = 'common.error';
        }
    }

    return Promise.reject(error);
  }
);

export default api;
