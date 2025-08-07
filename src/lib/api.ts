import axios, { AxiosError, AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');

    // Validate token format: must be JWT format with 3 parts
    if (token && token !== 'undefined' && token.split('.').length === 3) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Optional debug log
      console.warn('Invalid token in localStorage:', token);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      toast.error('Session expired. Please login again.');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action.');
    } else if (error.response && typeof error.response.status === 'number' && error.response.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please check your connection.');
    } else {
      const errorMessage =
        error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data
          ? (error.response.data as { message?: string }).message
          : undefined;
      toast.error(errorMessage || 'An error occurred.');
    }

    return Promise.reject(error);
  }
);

export default api;
