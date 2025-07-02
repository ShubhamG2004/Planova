import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  withCredentials: true,
  timeout: 15000, // 15 second timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token to requests if exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Set content type for non-GET requests
    if (config.method !== 'get') {
      config.headers['Content-Type'] = 'application/json';
    }

    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `%c[API REQUEST] ${config.method?.toUpperCase()} ${config.url}`,
        'color: blue; font-weight: bold;',
        config.data ? { data: config.data } : ''
      );
    }

    return config;
  },
  (error) => {
    console.error('[API REQUEST ERROR]', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `%c[API RESPONSE] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`,
        'color: green; font-weight: bold;',
        response.data
      );
    }
    return response;
  },
  (error) => {
    // Enhanced error handling
    let errorMessage = 'An unexpected error occurred';

    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout. Please try again.';
    } else if (error.response) {
      // Handle HTTP error statuses
      switch (error.response.status) {
        case 400:
          errorMessage = error.response.data?.message || 'Bad request';
          break;
        case 401:
          errorMessage = 'Session expired. Please log in again.';
          localStorage.removeItem('token');
          break;
        case 403:
          errorMessage = 'You do not have permission for this action';
          break;
        case 404:
          errorMessage = 'Resource not found';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = error.response.data?.message || 'Request failed';
      }
    } else if (error.request) {
      errorMessage = 'No response received from server';
    }

    // Log errors with different colors for different types
    const logStyle = error.response
      ? 'color: red; font-weight: bold;'
      : 'color: orange; font-weight: bold;';
    
    console.error(
      `%c[API ERROR] ${errorMessage}`,
      logStyle,
      error.response || error.request || error
    );

    // Return a consistent error object
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
      originalError: error
    });
  }
);

// Add cancellation support
api.createCancelToken = () => {
  const source = axios.CancelToken.source();
  return {
    cancelToken: source.token,
    cancel: source.cancel
  };
};

export default api;