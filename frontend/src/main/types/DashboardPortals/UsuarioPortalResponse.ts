// types/DashboardPortals/UsuarioPortalResponse.ts

export type RolPortal = 'ADMIN' | 'MIEMBRO';

export interface UsuarioPortalResponse {
  id: number;
  universidad: string;
  carrera: string;
  unidadAcademica: string | null;
  descripcion: string | null;
  logoUrl: string | null;
  iconoPortal: string | null;
  colorPortal: string | null;
  rol: RolPortal;
  cantidadMiembros: number;
  cantidadMaterias: number;
}