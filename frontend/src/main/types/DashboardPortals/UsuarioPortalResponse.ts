export type RolPortal = 'ADMIN' | 'MIEMBRO';

export interface UsuarioPortalResponse {
  id: number;
  universidad: string;
  carrera: string;
  descripcion: string | null;
  logoUrl: string | null;
  rol: RolPortal;
  cantidadMiembros: number;
  cantidadMaterias: number;
}