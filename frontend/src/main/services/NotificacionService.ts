import apiClient from './apiClient';

export interface NotificacionResponse {
  id: string; // UUID
  mensaje: string;
  leida: boolean;
  fechaCreacion: string;
}

class NotificacionService {
  /** GET /api/notificaciones */
  async getNotificaciones(): Promise<NotificacionResponse[]> {
    const response = await apiClient.get<NotificacionResponse[]>('/notificaciones');
    return response.data;
  }

  /** PATCH /api/notificaciones/{id}/leer */
  async marcarComoLeida(id: string): Promise<void> {
    await apiClient.patch(`/notificaciones/${id}/leer`);
  }

  /** POST /api/notificaciones/leer-todas */
  async marcarTodasComoLeidas(): Promise<void> {
    await apiClient.post('/notificaciones/leer-todas');
  }

  /** DELETE /api/notificaciones/{id} */
  async eliminarNotificacion(id: string): Promise<void> {
    await apiClient.delete(`/notificaciones/${id}`);
  }

  /** DELETE /api/notificaciones/leidas */
  async eliminarTodasLeidas(): Promise<void> {
    await apiClient.delete('/notificaciones/leidas');
  }
}

export const notificacionService = new NotificacionService();