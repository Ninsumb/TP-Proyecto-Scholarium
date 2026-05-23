import apiClient from './apiClient';
import type { buscarPortalesResponse } from '../types/Portales';

class PortalService {
  async getPortales(universidad: string, carrera: string): Promise<buscarPortalesResponse> {
    const response = await apiClient.get<buscarPortalesResponse>('/portales/buscar', {
      params: { universidad, carrera },
    });
    return response.data;
  }
}

export const portalService = new PortalService();