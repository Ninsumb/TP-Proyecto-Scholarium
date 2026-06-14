// src/services/AdminService.ts
import apiClient from './apiClient';
import type {
  MiembroResponse,
  VotacionResponse,
  CrearVotacionRequest,
  VotarRequest,
  PageVotacionResponse,
  SolicitudResponse,
  RechazarSolicitudRequest,
  PlantillaSolicitudResponse,
  ActualizarPlantillaRequest,
  MaterialPendienteDTO,
  RechazarMaterialRequest,
  ActualizarPortalRequest,
} from '../types/Admin/Admin';
import type { EstadoVotacion } from '../types/Admin/Admin';

class AdminService {

  // ── Miembros ──────────────────────────────────────────────────────────────

  /**
   * Lista todos los miembros activos del portal.
   * GET /api/portales/{portalId}/miembros
   */
  async getMiembros(portalId: number): Promise<MiembroResponse[]> {
    const response = await apiClient.get<MiembroResponse[]>(
      `/portales/${portalId}/miembros`,
    );
    return response.data;
  }

  // ── Portal (identidad / visual) ───────────────────────────────────────────

  /**
   * Actualiza unidadAcademica, descripcion, iconoPortal, colorPortal, logoUrl.
   * Universidad y carrera se cambian vía votación (CAMBIO_INFO_PORTAL).
   * PATCH /api/portales/{portalId}
   */
  async actualizarPortal(
    portalId: number,
    data: ActualizarPortalRequest,
  ): Promise<void> {
    await apiClient.patch(`/portales/${portalId}`, data);
  }

  // ── Plantilla de solicitud ────────────────────────────────────────────────

  /**
   * Trae la plantilla actual del portal (requisitos + estado abierta).
   * GET /api/portales/{portalId}/solicitudes/plantilla
   */
  async getPlantilla(portalId: number): Promise<PlantillaSolicitudResponse> {
    const response = await apiClient.get<PlantillaSolicitudResponse>(
      `/portales/${portalId}/solicitudes/plantilla`,
    );
    return response.data;
  }

  /**
   * Actualiza la plantilla (toggle abierta y/o requisitos).
   * PATCH /api/portales/{portalId}/solicitudes/plantilla
   */
  async actualizarPlantilla(
    portalId: number,
    data: ActualizarPlantillaRequest,
  ): Promise<PlantillaSolicitudResponse> {
    const response = await apiClient.patch<PlantillaSolicitudResponse>(
      `/portales/${portalId}/solicitudes/plantilla`,
      data,
    );
    return response.data;
  }

  // ── Solicitudes de membresía ──────────────────────────────────────────────

  /**
   * Lista las solicitudes PENDIENTES del portal.
   * GET /api/portales/{portalId}/solicitudes
   */
  async getSolicitudesPendientes(portalId: number): Promise<SolicitudResponse[]> {
    const response = await apiClient.get<SolicitudResponse[]>(
      `/portales/${portalId}/solicitudes`,
    );
    return response.data;
  }

  /**
   * Aprueba una solicitud de membresía.
   * PUT /api/portales/{portalId}/solicitudes/{solicitudId}/aprobar
   */
  async aprobarSolicitud(portalId: number, solicitudId: number): Promise<void> {
    await apiClient.put(
      `/portales/${portalId}/solicitudes/${solicitudId}/aprobar`,
    );
  }

  /**
   * Rechaza una solicitud de membresía con motivo obligatorio.
   * PUT /api/portales/{portalId}/solicitudes/{solicitudId}/rechazar
   */
  async rechazarSolicitud(
    portalId: number,
    solicitudId: number,
    request: RechazarSolicitudRequest,
  ): Promise<void> {
    await apiClient.put(
      `/portales/${portalId}/solicitudes/${solicitudId}/rechazar`,
      request,
    );
  }

  // ── Material pendiente ────────────────────────────────────────────────────

  /**
   * Lista el material PENDIENTE del portal para moderación.
   * GET /api/portales/{portalId}/material/pendiente
   */
  async getMaterialPendiente(portalId: number): Promise<MaterialPendienteDTO[]> {
    const response = await apiClient.get<MaterialPendienteDTO[]>(
      `/portales/${portalId}/material/pendiente`,
    );
    return response.data;
  }

  /**
   * Aprueba un material pendiente.
   * PUT /api/material/{materialId}/aprobar
   */
  async aprobarMaterial(materialId: string): Promise<void> {
    await apiClient.put(`/material/${materialId}/aprobar`);
  }

  /**
   * Rechaza un material pendiente con motivo.
   * PUT /api/material/{materialId}/rechazar
   */
  async rechazarMaterial(
    materialId: string,
    request: RechazarMaterialRequest,
  ): Promise<void> {
    await apiClient.put(`/material/${materialId}/rechazar`, request);
  }

  /**
   * Obtiene la URL de descarga de un material (admin puede descargar material pendiente).
   * GET /api/material/{materialId}/descargar
   */
  async getUrlDescarga(materialId: string): Promise<string> {
    // Este endpoint devuelve { url: string }
    // pero para material PENDIENTE el back lanza BusinessException.
    // Lo usamos desde el panel de moderación sólo si el material ya está PUBLICADO.
    // Para preview admin del material pendiente, la URL viene en el DTO directamente
    // (campo `url` en MaterialPendienteDTO).
    const response = await apiClient.get<{ url: string }>(
      `/material/${materialId}/descargar`,
    );
    return response.data.url;
  }

  // ── Votaciones ────────────────────────────────────────────────────────────

  /**
   * Lista las votaciones del portal en el estado dado.
   * Por defecto el back retorna ABIERTA.
   * GET /api/portales/{portalId}/votaciones?estado=ABIERTA
   */
  async getVotaciones(
    portalId: number,
    estado: EstadoVotacion = 'ABIERTA',
  ): Promise<VotacionResponse[]> {
    const response = await apiClient.get<VotacionResponse[]>(
      `/portales/${portalId}/votaciones`,
      { params: { estado } },
    );
    return response.data;
  }

  /**
   * Trae el historial paginado de votaciones cerradas.
   * GET /api/portales/{portalId}/votaciones/historial?page=0&size=20
   */
  async getHistorialVotaciones(
    portalId: number,
    page = 0,
    size = 20,
  ): Promise<PageVotacionResponse> {
    const response = await apiClient.get<PageVotacionResponse>(
      `/portales/${portalId}/votaciones/historial`,
      { params: { page, size } },
    );
    return response.data;
  }

  /**
   * Propone una nueva votación en el portal.
   * El proponente queda con voto a favor automáticamente.
   * POST /api/portales/{portalId}/votaciones
   */
  async crearVotacion(
    portalId: number,
    request: CrearVotacionRequest,
  ): Promise<VotacionResponse> {
    const response = await apiClient.post<VotacionResponse>(
      `/portales/${portalId}/votaciones`,
      request,
    );
    return response.data;
  }

  /**
   * Registra el voto de un admin sobre una votación abierta.
   * Si se alcanza mayoría simple, el back ejecuta la acción y cierra la votación.
   * POST /api/votaciones/{votacionId}/votar
   */
  async votar(
    votacionId: number,
    request: VotarRequest,
  ): Promise<VotacionResponse> {
    const response = await apiClient.post<VotacionResponse>(
      `/votaciones/${votacionId}/votar`,
      request,
    );
    return response.data;
  }

  // ── Acciones Directas sobre Miembros ──────────────────────────────────────

  /**
   * Promueve un miembro a administrador.
   * PUT /api/portales/{portalId}/miembros/{usuarioId}/promover
   */
  async promoverAdmin(portalId: number, usuarioId: number): Promise<void> {
    await apiClient.put(`/portales/${portalId}/miembros/${usuarioId}/promover`);
  }

  /**
   * Degrada un administrador a miembro normal.
   * PUT /api/portales/{portalId}/miembros/{usuarioId}/degradar
   */
  async degradarAdmin(portalId: number, usuarioId: number): Promise<void> {
    await apiClient.put(`/portales/${portalId}/miembros/${usuarioId}/degradar`);
  }

  /**
   * Expulsa/Remueve a un miembro del portal.
   * DELETE /api/portales/{portalId}/miembros/{usuarioId}
   */
  async removerMiembro(portalId: number, usuarioId: number): Promise<void> {
    await apiClient.delete(`/portales/${portalId}/miembros/${usuarioId}`);
  }

/**
   * Bloquea a un miembro.

   * DELETE /api/portales/{portalId}/bloqueos/{usuarioId}
   */
  async bloquearMiembro(portalId: number, usuarioId: number): Promise<void> {
    await apiClient.delete(`/portales/${portalId}/bloqueos/${usuarioId}`);
  }



}

export const adminService = new AdminService();