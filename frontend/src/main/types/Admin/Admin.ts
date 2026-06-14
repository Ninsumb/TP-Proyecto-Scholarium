// src/types/Admin/Admin.ts
// Mapeo 1:1 de los DTOs del back relevantes a las 3 vistas de administración.

// ─── Enums ────────────────────────────────────────────────────────────────────

export type RolMembresia = 'ADMIN' | 'MIEMBRO';

export type TipoVotacion =
  | "DEGRADAR_ADMIN"
  | "EXPULSION_MIEMBRO"
  | "BLOQUEO_MIEMBRO"
  | "CAMBIO_UNIVERSIDAD"
  | "CAMBIO_CARRERA"
  | "CAMBIO_TIPO_ACCESO"
  | "ELIMINAR_MATERIA"
  | "ELIMINAR_TABLERO"
  | "ARCHIVAR_PORTAL";

export type EstadoVotacion = 'ABIERTA' | 'APROBADA' | 'RECHAZADA' | 'EXPIRADA';

export type TipoMaterial = 'APUNTE' | 'PARCIAL' | 'FINAL' | 'GUIA_EJERCICIOS' | 'OTRO';

export type EstadoMaterial = 'PENDIENTE' | 'PUBLICADO' | 'RECHAZADO';

// ─── Miembros ─────────────────────────────────────────────────────────────────

/** GET /api/portales/{portalId}/miembros */
export interface MiembroResponse {
  usuarioId: number;
  membresiaId: number;
  nombre: string;
  email: string;
  rol: RolMembresia;
  fechaRegistro: string; // ISO LocalDateTime serializado
}

// ─── Votaciones ──────────────────────────────────────────────────────────────

/** GET /api/portales/{portalId}/votaciones */
export interface VotacionResponse {
  id: number;
  portalId: number;
  tipo: TipoVotacion;
  proponenteId: number;
  proponenteEmail: string;
  proponenteNombre: string;
  motivo: string;
  estado: EstadoVotacion;
  entidadId: string | null;
  metadatos: string | null;
  creadaEn: string;    // ISO LocalDateTime
  resueltaEn: string | null;
  expiraEn: string;    // ISO LocalDateTime
  votosAFavor: number;
  votosEnContra: number;
  totalAdmins: number;
}

/** POST /api/portales/{portalId}/votaciones */
export interface CrearVotacionRequest {
  tipo: TipoVotacion;
  motivo: string;
  entidadId?: string | null;
  metadatos?: string | null;
}

/** POST /api/votaciones/{votacionId}/votar */
export interface VotarRequest {
  aprueba: boolean;
}

/** GET /api/portales/{portalId}/votaciones/historial — respuesta paginada */
export interface PageVotacionResponse {
  content: VotacionResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ─── Solicitudes ─────────────────────────────────────────────────────────────

export interface UsuarioResumenDTO {
  id: number;
  nombre: string;
  email: string;
}

/** GET /api/portales/{portalId}/solicitudes */
export interface SolicitudResponse {
  id: number;
  usuario: UsuarioResumenDTO;
  nombreCompleto: string | null;
  descripcion: string;
  estado: string; // 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA'
  fechaSolicitud: string;
  motivoRechazo: string | null;
}

/** PUT /api/portales/{portalId}/solicitudes/{solicitudId}/rechazar */
export interface RechazarSolicitudRequest {
  motivoRechazo: string;
}

/** GET /api/portales/{portalId}/solicitudes/plantilla */
export interface PlantillaSolicitudResponse {
  requisitos: string | null;
  abierta: boolean;
}

/** PATCH /api/portales/{portalId}/solicitudes/plantilla */
export interface ActualizarPlantillaRequest {
  requisitos?: string | null;
  abierta?: boolean | null;
}

// ─── Material pendiente ───────────────────────────────────────────────────────

export interface MateriaResumenDTO {
  id: string; // UUID
  nombre: string;
  carpeta: string;
}

/** GET /api/portales/{portalId}/material/pendiente */
export interface MaterialPendienteDTO {
  id: string; // UUID
  nombre: string;
  descripcion: string;
  tipo: TipoMaterial;
  url: string;
  tamanio: number;
  tipoArchivo: string;
  materia: MateriaResumenDTO;
  uploadedByEmail: string;
  createdAt: string; // Date serializado
}

/** PUT /api/material/{materialId}/rechazar */
export interface RechazarMaterialRequest {
  motivoRechazo: string;
}

// ─── Portal (identidad/visual) ────────────────────────────────────────────────

/** PATCH /api/portales/{portalId} */
export interface ActualizarPortalRequest {
  unidadAcademica?: string | null;
  descripcion?: string | null;
  iconoPortal?: string | null;
  colorPortal?: string | null;
  logoUrl?: string | null;
}