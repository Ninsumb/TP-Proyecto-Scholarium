import axios from 'axios';
import { authService } from './AuthService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9001/api';

const apiClient = axios.create({
    baseURL: API_URL,
});

// Adjunta el token a cada request automáticamente
apiClient.interceptors.request.use((config) => {
    const token = authService.getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Intercepta 401 e intenta refresh antes de rendirse
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshed = await authService.tryRefresh();
            if (refreshed) {
                originalRequest.headers.Authorization = `Bearer ${authService.getToken()}`;
                return apiClient(originalRequest);
            } else {
                authService.clearSession();
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;