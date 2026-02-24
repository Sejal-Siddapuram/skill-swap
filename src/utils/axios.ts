import axios from 'axios';

// Create axios instance with custom config
const instance = axios.create({
  baseURL: 'http://localhost:5001/api',
  timeout: 10000, // Increased timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add logging for development
instance.interceptors.request.use(request => {
  console.log('Starting Request:', {
    url: request.url,
    method: request.method,
    data: request.data,
    headers: request.headers
  });
  return request;
});

// Add request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error || error.response.data?.message || 'An error occurred';
      throw new Error(message);
    } else if (error.request) {
      // Request was made but no response
      throw new Error('Network error - please check your connection');
    } else {
      // Error in request configuration
      throw new Error('Request failed - please try again');
    }
  }
);

export default instance;