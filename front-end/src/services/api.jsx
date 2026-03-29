import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// --- Manual Retry Configuration ---
const MAX_RETRIES = 4;            // Extra attempt to survive cold-start wake-up time
const RETRY_DELAY_FACTOR = 3000;  // 3 s, 6 s, 9 s, 12 s — gives Koyeb ~30 s to wake

const shouldRetry = (error) => {
  const { config, response } = error;
  
  // Only retry GET requests
  if (config?.method !== 'get') return false;

  // Retry on ANY network-level failure (Network Error, CORS preflight failure
  // during cold start, timeout) — these all arrive with no response object.
  if (!response) return true;

  // Retry on specific server/gateway errors often seen during cold starts or high load
  const retryableStatuses = [502, 503, 504];
  return retryableStatuses.includes(response.status);
};

// --- Request Interceptor ---
api.interceptors.request.use((config) => {
  // Debug log for production (remove after verification)
  console.log(`[API REQUEST] ${config.method?.toUpperCase()} ${config.url} | Timeout: ${config.timeout}ms`);

  // Initialize retry count
  config.__retryCount = config.__retryCount || 0;

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
  async (error) => {
    const { config } = error;

    // Retry logic
    if (config && shouldRetry(error) && config.__retryCount < MAX_RETRIES) {
      config.__retryCount += 1;
      const delay = config.__retryCount * RETRY_DELAY_FACTOR;
      
      console.warn(`Retry attempt ${config.__retryCount} after ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return api(config);
    }

    if (!error.response) {
      // All retries exhausted — provide a user-friendly message
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        error.userMessage = 'A requisição expirou. O servidor pode estar iniciando — tente novamente em instantes.';
        error.userMessageKey = 'common.errorTimeout';
      } else {
        // Special check for production misconfiguration
        const isProd = import.meta.env.PROD;
        const currentBaseURL = api.defaults.baseURL;
        const isLocalhost = currentBaseURL?.includes('localhost') || currentBaseURL?.includes('127.0.0.1');
        
        if (isProd && isLocalhost) {
          error.userMessage = `Erro de Configuração: O build de produção está apontando para a API local (${currentBaseURL}). Verifique a variável VITE_API_URL no Vercel/Koyeb.`;
          console.error('CRITICAL: Production build pointing to localhost API!', { currentBaseURL });
        } else {
          // Likely a cold-start Network Error — server was sleeping
          error.userMessage = 'O servidor está iniciando. Aguarde alguns segundos e recarregue a página.';
          console.error('Network Error (possible cold-start):', { 
            message: error.message, 
            code: error.code, 
            baseURL: currentBaseURL,
            env: import.meta.env.MODE,
            retries: config?.__retryCount
          });
        }
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
