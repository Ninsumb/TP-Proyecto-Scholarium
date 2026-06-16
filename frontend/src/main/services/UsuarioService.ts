import apiClient from './apiClient';
import type { UsuarioPortalResponse } from '../types/DashboardPortals/UsuarioPortalResponse';

// ─── Types de respuesta ────────────────────────────────────────────────────────

export interface UsuarioMeResponse {
  id: number;
  nombre: string;
  email: string;
  fotoPerfil: string | null;
  createdAt: string; // ISO 8601 — viene como string desde Spring
  cantidadPortales: number;
  cantidadMaterialSubido: number;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
}

// ─── Types de request ──────────────────────────────────────────────────────────

export interface ActualizarPerfilRequest {
  nombre: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangeEmailRequest {
  newEmail: string;
  password: string;
}

// ─── Service ───────────────────────────────────────────────────────────────────

class UsuarioService {

  // GET /api/usuarios/me/portales
  async getMisPortales(): Promise<UsuarioPortalResponse[]> {
    const response = await apiClient.get<UsuarioPortalResponse[]>('/usuarios/me/portales');
    return response.data;
  }

  // GET /api/usuarios/me
  async getMiPerfil(): Promise<UsuarioMeResponse> {
    const response = await apiClient.get<UsuarioMeResponse>('/usuarios/me');
    return response.data;
  }

  // PUT /api/usuarios/me — actualiza nombre
  async actualizarPerfil(request: ActualizarPerfilRequest): Promise<UsuarioMeResponse> {
    const response = await apiClient.put<UsuarioMeResponse>('/usuarios/me', request);
    return response.data;
  }

  // PATCH /api/usuarios/me/foto-perfil — multipart/form-data
  async actualizarFotoPerfil(archivo: File): Promise<string> {
    const formData = new FormData();
    formData.append('foto', archivo);
    const response = await apiClient.patch<{ fotoPerfil: string }>(
      '/usuarios/me/foto-perfil',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.fotoPerfil;
  }

  // PUT /api/usuarios/me/password
  async cambiarPassword(request: ChangePasswordRequest): Promise<void> {
    await apiClient.put('/usuarios/me/password', request);
  }

  // PUT /api/usuarios/me/email — devuelve tokens nuevos porque el email del JWT cambió
  async cambiarEmail(request: ChangeEmailRequest): Promise<LoginResponse> {
    const response = await apiClient.put<LoginResponse>('/usuarios/me/email', request);
    return response.data;
  }

  // DELETE /api/usuarios/me
  async eliminarCuenta(): Promise<void> {
    await apiClient.delete('/usuarios/me');
  }
}

export const usuarioService = new UsuarioService();