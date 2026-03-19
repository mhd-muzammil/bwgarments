import axios from 'axios';

// In production, VITE_API_URL points to the Render server (e.g. https://bwgarments-api.onrender.com)
// In development, Vite proxy handles /api -> localhost:5000
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const API = axios.create({
  baseURL,
  withCredentials: true, // Send cookies with every request (cross-origin)
});

// Response interceptor — handle token refresh via cookies
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && error.response?.data?.expired && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshURL = import.meta.env.VITE_API_URL
          ? `${import.meta.env.VITE_API_URL}/api/auth/refresh`
          : '/api/auth/refresh';

        await axios.post(refreshURL, {}, { withCredentials: true });
        return API(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
