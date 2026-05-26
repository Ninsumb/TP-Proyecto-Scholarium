// types/Portal/Portal.ts

export interface PortalDetailResponse {
  id: number;
  universidad: string;
  carrera: string;
  unidadAcademica: string | null;
  descripcion: string | null;
  logoUrl: string | null;
  iconoPortal: string | null;
  colorPortal: string | null;
  cantidadMiembros: number;
  cantidadMaterias: number;
  cantidadMaterialPublicado: number;
  rolUsuarioAutenticado: string | null;
  fechaRegistro: string;
  activo: boolean;
}

export type RolUsuario = 'ADMIN' | 'MIEMBRO' | 'GUEST';

export function getRolFromPortal(portal: PortalDetailResponse): RolUsuario {
  if (!portal.rolUsuarioAutenticado) return 'GUEST';
  if (portal.rolUsuarioAutenticado === 'ADMIN') return 'ADMIN';
  return 'MIEMBRO';
}