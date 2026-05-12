// src/services/portalHomePage.service.ts
import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type { BlocksResponse, UpdateBlocksRequest } from '../../types/Portal/PortalHomeBlocksTypes';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9001/api';

class PortalHomePageService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}/portales`,
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

  async getBlocks(portalId: number): Promise<BlocksResponse> {
    const response = await this.api.get<BlocksResponse>(`/${portalId}/home`);
    return response.data;
  }

  async updateBlocks(portalId: number, request: UpdateBlocksRequest): Promise<BlocksResponse> {
    const response = await this.api.put<BlocksResponse>(`/${portalId}/home`, request);
    return response.data;
  }
}

export const portalHomePageService = new PortalHomePageService();