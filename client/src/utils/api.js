import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  withCredentials: true, // Send cookies with every request
});

// Response interceptor — handle token refresh via cookies
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && error.response?.data?.expired && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh tokens are in httpOnly cookies — just call refresh
        await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        // New access token is set as httpOnly cookie automatically
        return API(originalRequest);
      } catch (refreshError) {
        // Clear user data and redirect to login
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
