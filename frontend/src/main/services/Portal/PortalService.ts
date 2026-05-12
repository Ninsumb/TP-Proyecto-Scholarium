// src/services/PortalService.ts
import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type { PortalDetailResponse } from '../../types/Portal/Portal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9001/api';

// Tipos para los bloques (ajústalos según tu BlockComponents)
export interface Block {
  id: string;
  type: string;
  data: any;
}

export interface BloqueBackendResponse {
  id: string;
  type: string;
  data: Record<string, any>;
  orden: number;
}

class PortalService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}/portales`,
      headers: { 'Content-Type': 'application/json' },
    });

   
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

   
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token inválido o expirado
          localStorage.removeItem('token');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userName');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }


  async getPortalDetail(portalId: number): Promise<PortalDetailResponse> {
    const response = await this.api.get<PortalDetailResponse>(`/${portalId}`);
    return response.data;
  }


/*   async getPortalBloques(portalId: number): Promise<Block[]> {
    try {
      const response = await this.api.get<BloqueBackendResponse[]>(`/${portalId}/bloques`);
      
     
      return response.data.map(bloque => ({
        id: bloque.id,
        type: bloque.type,
        data: bloque.data
      }));
    } catch (error: any) {
      
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  }

 
  async savePortalBloques(portalId: number, bloques: Block[]): Promise<void> {
    const bloquesRequest = bloques.map(bloque => ({
      id: bloque.id,
      type: bloque.type,
      data: bloque.data
    }));

    await this.api.put(`/${portalId}/bloques`, bloquesRequest);
  } */
}

export const portalService = new PortalService();