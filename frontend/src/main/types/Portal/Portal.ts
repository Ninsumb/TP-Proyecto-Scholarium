export interface PortalDetailResponse {
  id: number;
  universidad: string;
  carrera: string;
  descripcion: string | null;
  logoUrl: string | null;
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