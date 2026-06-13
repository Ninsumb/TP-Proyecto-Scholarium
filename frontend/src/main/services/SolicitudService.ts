// services/Portal/SolicitudService.ts
// Service para todas las operaciones relacionadas a Solicitudes de membresía.
// Los endpoints ahora viven bajo /api/portales/{portalId}/solicitudes/*

import apiClient from './apiClient';

export interface SolicitudRequest {
  nombreCompleto?: string;
  descripcion: string;
}

export interface PuedeSolicitarResponse {
  puede: boolean;
  motivo: 'BLOQUEADO' | 'YA_MIEMBRO' | 'PENDIENTE' | null;
}

export interface SolicitudResponse {
  id: number;
  usuario: {
    id: number;
    nombre: string;
    email: string;
  };
  nombreCompleto: string | null;
  descripcion: string;
  estado: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';
  fechaSolicitud: string;
  motivoRechazo: string | null;
}

export interface PlantillaSolicitudResponse {
  requisitos: string | null;
  abierta: boolean;
}

export interface RechazarSolicitudRequest {
  motivoRechazo: string;
}

class SolicitudService {
  /**
   * Crea una nueva solicitud de membresía para el portal.
   * Solo disponible para usuarios no-miembros.
   */
  async crearSolicitud(portalId: number, request: SolicitudRequest): Promise<void> {
    await apiClient.post(`/portales/${portalId}/solicitudes`, request);
  }

  /**
   * Devuelve la solicitud más reciente del usuario autenticado para este portal.
   * Retorna null si no existe ninguna solicitud.
   * Usado para mostrar la página de estado de la solicitud.
   */
  async getMiSolicitud(portalId: number): Promise<SolicitudResponse | null> {
    const response = await apiClient.get<SolicitudResponse>(
      `/portales/${portalId}/solicitudes/mi-solicitud`
    );
    // 204 No Content → sin solicitud
    if (response.status === 204) return null;
    return response.data;
  }

  /**
   * Devuelve los requisitos y el estado de apertura del portal.
   * Accesible sin ser miembro. Se muestra antes del formulario de solicitud.
   */
  async getPlantilla(portalId: number): Promise<PlantillaSolicitudResponse> {
    const response = await apiClient.get<PlantillaSolicitudResponse>(
      `/portales/${portalId}/solicitudes/plantilla`
    );
    return response.data;
  }

  /**
   * Lista las solicitudes PENDIENTES del portal. Solo admins.
   */
  async getSolicitudesPendientes(portalId: number): Promise<SolicitudResponse[]> {
    const response = await apiClient.get<SolicitudResponse[]>(
      `/portales/${portalId}/solicitudes`
    );
    return response.data;
  }

  /**
   * Historial completo de solicitudes (todas). Solo admins.
   */
  async getHistorial(portalId: number): Promise<SolicitudResponse[]> {
    const response = await apiClient.get<SolicitudResponse[]>(
      `/portales/${portalId}/solicitudes/historial`
    );
    return response.data;
  }

  /** Aprueba una solicitud. Solo admins. */
  async aprobarSolicitud(portalId: number, solicitudId: number): Promise<void> {
    await apiClient.put(`/portales/${portalId}/solicitudes/${solicitudId}/aprobar`);
  }

  /** Rechaza una solicitud con motivo obligatorio. Solo admins. */
  async rechazarSolicitud(
    portalId: number,
    solicitudId: number,
    request: RechazarSolicitudRequest
  ): Promise<void> {
    await apiClient.put(
      `/portales/${portalId}/solicitudes/${solicitudId}/rechazar`,
      request
    );
  }


 
async puedeSolicitar(portalId: number): Promise<PuedeSolicitarResponse> {
  const response = await apiClient.get<PuedeSolicitarResponse>(
    `/portales/${portalId}/solicitudes/puedo-solicitar`
  );
  return response.data;
}

}

export const solicitudService = new SolicitudService();