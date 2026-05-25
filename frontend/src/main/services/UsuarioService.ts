import apiClient from './apiClient';
import type { UsuarioPortalResponse } from '../types/DashboardPortals/UsuarioPortalResponse';

class UsuarioService {
  async getMisPortales(): Promise<UsuarioPortalResponse[]> {
    const response = await apiClient.get<UsuarioPortalResponse[]>('/usuarios/me/portales');
    return response.data;
  }
}

export const usuarioService = new UsuarioService();