import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type { PortalDetailResponse } from '../../types/Portal/Portal';
import type { Block } from '../../Components/PortalHome-blocks/BlockComponents';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9001/api';



export interface BlocksResponse {
  blocks: Block[];
  error?: string;
}

export interface UpdateBlocksRequest {
  blocks: Block[];
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

  // Nuevo: Obtener bloques de la home page
  async getHomeBlocks(portalId: number): Promise<BlocksResponse> {
    const response = await this.api.get<BlocksResponse>(`/${portalId}/home`);
    return response.data;
  }

  // Nuevo: Actualizar bloques de la home page
  async updateHomeBlocks(portalId: number, blocks: Block[]): Promise<BlocksResponse> {
    const request: UpdateBlocksRequest = { blocks };
    const response = await this.api.put<BlocksResponse>(`/${portalId}/home`, request);
    return response.data;
  }
}

export const portalService = new PortalService();