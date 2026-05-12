// src/services/usuario.service.ts
import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type { UsuarioPortalResponse } from '../types/DashboardPortals/UsuarioPortalResponse'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9001/api';

class UsuarioService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}/usuarios`,
      headers: { 'Content-Type': 'application/json' },
    });

    // Interceptor para agregar el token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor para manejar errores de autenticación
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userName');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async getMisPortales(): Promise<UsuarioPortalResponse[]> {
    const response = await this.api.get<UsuarioPortalResponse[]>('/me/portales');
    return response.data;
  }
}

export const usuarioService = new UsuarioService();