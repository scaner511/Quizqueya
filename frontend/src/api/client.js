import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: agrega el token JWT a cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('quizqueya_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: manejo de errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthEndpoint = /\/auth\/(login|register)/.test(error.config.url);
      if (!isAuthEndpoint) {
        localStorage.removeItem('quizqueya_token');
        localStorage.removeItem('quizqueya_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
