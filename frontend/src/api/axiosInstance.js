import axios from 'axios';

// Create custom axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// INTERCEPTOR (Interview Gold):
// Attach Authorization header before requests are sent
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

// Response interceptor - handle token expiration or unauthorized access globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend returns 401 Unauthorized, token might be invalid or removed
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Option: redirect to login or let Redux slice catch this and clear user state
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
