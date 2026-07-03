// services/PortalService.ts
// Nota: este es el service para búsqueda de portales (ExplorarPortales).
// No confundir con services/Portal/PortalService.ts (detalle de portal interno).

import apiClient from './apiClient';
import type { BuscarPortalesResponse, CrearPortalRequest, CrearPortalResponse } from '../types/Portales';

export interface DenunciaPortalRequest {
  motivo: string;
  comentarios?: string;
}

class PortalService {
  async getPortales(
    universidad: string,
    carrera: string,
    pagina: number
  ): Promise<BuscarPortalesResponse> {
    const response = await apiClient.get<BuscarPortalesResponse>('/portales/buscar', {
      params: { universidad, carrera, pagina },
    });
    return response.data;
  }

  async crearPortal(request: CrearPortalRequest): Promise<CrearPortalResponse> {
    const response = await apiClient.post<CrearPortalResponse>('/portales', request);
    return response.data;
  }

  async denunciarPortal(portalId: number, request: DenunciaPortalRequest): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(`/portales/${portalId}/denuncias`, request);
    return response.data;
  }


}

export const portalService = new PortalService();