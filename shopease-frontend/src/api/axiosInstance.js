import axios from 'axios';

// Create a custom Axios instance configured for ShopEase backend API
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically attach JWT Bearer token to every request if present
axiosInstance.interceptors.request.use(
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

// Response Interceptor: Catch global authentication errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend returns 401 Unauthorized, token might be expired or invalid
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized request. Clearing local session.');
      // Optional: Clear token if expired
      // localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
