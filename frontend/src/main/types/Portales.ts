// types/Portales.ts

export type TipoAcceso = 'ABIERTO' | 'CERRADO';

export interface PortalBusquedaDTO {
  id: number;
  universidad: string;
  carrera: string;
  unidadAcademica: string | null;
  descripcion: string | null;
  estudiantes: number;
  logoUrl: string | null;
  iconoPortal: string | null;
  colorPortal: string | null;
  tipoAcceso: TipoAcceso;
}

export interface BuscarPortalesResponse {
  portales: PortalBusquedaDTO[];
  page: number;
  total: number;
}

export interface CrearPortalRequest {
  universidad: string;
  carrera: string;
  unidadAcademica?: string;
  descripcion?: string;
  logoUrl?: string;
  iconoPortal?: string;
  colorPortal?: string;
  tipoAcceso: TipoAcceso;
}

export interface CrearPortalResponse {
  id: number;
  universidad: string;
  carrera: string;
}