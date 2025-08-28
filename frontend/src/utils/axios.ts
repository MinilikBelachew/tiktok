import axios from 'axios';

// Create a centralized axios instance with consistent configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 10000,
});

// Request interceptor to add common headers
apiClient.interceptors.request.use(
  (config) => {
    // Add any common headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 errors globally
    if (error.response?.status === 401) {
      console.log('Axios interceptor - 401 Unauthorized, clearing auth state');
      // Clear any stored authentication data
      localStorage.removeItem('auth');
      // You could also dispatch a logout action here if needed
      // But we'll handle this in the components for now
    }
    return Promise.reject(error);
  }
);

export default apiClient;
