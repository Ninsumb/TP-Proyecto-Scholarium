// types/Portales.ts
// Alineado con PortalBusquedaDTO del backend.
// Reemplaza la versión anterior que tenía campos fantasma (icon, color, nombre, estudiantes)
// que el backend no enviaba, causando que las cards mostraran undefined en runtime.

export interface PortalBusquedaDTO {
  id: number;
  universidad: string;
  carrera: string;
  unidadAcademica: string | null;
  descripcion: string | null;
  estudiantes: number;
  // Identidad visual — mutuamente excluyentes en el front:
  // si logoUrl tiene valor, se muestra la imagen.
  // Si no, se renderiza iconoPortal sobre colorPortal.
  logoUrl: string | null;
  iconoPortal: string | null;
  colorPortal: string | null;
}

export interface BuscarPortalesResponse {
  portales: PortalBusquedaDTO[];
  page: number;
  total: number;
}

// Request que se envía al backend al crear un portal.
// logoUrl llega como URL ya resuelta de Cloudinary (el front sube la imagen
// directamente a Cloudinary y nos pasa la URL resultante).
export interface CrearPortalRequest {
  universidad: string;
  carrera: string;
  unidadAcademica?: string;
  descripcion?: string;
  logoUrl?: string;
  iconoPortal?: string;
  colorPortal?: string;
}

export interface CrearPortalResponse {
  id: number;
  universidad: string;
  carrera: string;
}