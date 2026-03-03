import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// --- Rate Limiting ---
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
  }, 50);

  return config;
};

// --- Token Provider for Clerk ---
let getToken = null;
export const setTokenProvider = (fn) => {
  getToken = fn;
};

// --- Request Interceptor ---
api.interceptors.request.use(async (config) => {
  // Rate limiting
  // await processRequest(config); // Temporarily disabled if causing issues, but keeping it is fine if it works.

  // Remove Content-Type for FormData (let browser set it)
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  // Prevent caching for GET requests to force fresh data
  if (config.method === 'get') {
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    config.headers['Pragma'] = 'no-cache';
    config.headers['Expires'] = '0';
    config.params = { ...config.params, _t: Date.now() }; // Bust cache with timestamp
  }

  // Attach auth token from Clerk — with timeout so network issues don't block public requests
  if (getToken) {
    try {
      const tokenPromise = getToken();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Token fetch timed out')), 5000)
      );
      const token = await Promise.race([tokenPromise, timeoutPromise]);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // Silently continue — public endpoints work without auth, protected ones will 401
      console.warn('[API] Auth token unavailable:', error.message);
    }
  }

  return config;
});

// --- Response Interceptor (Resilient Error Handling) ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error (no response received)
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

    const { status, config, data } = error.response;

    switch (status) {
      case 401: {
        // Clerk handles auth state, so we just return the error.
        // Frontend components should react to specific 401s if needed (e.g., refreshing data).
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
