import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const client = axios.create({
  baseURL: API_BASE_URL,
});

// Attach the admin's JWT to every request, if present
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('itmart_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is invalid/expired, force a re-login
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('itmart_admin_token');
      localStorage.removeItem('itmart_admin_profile');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export default client;
