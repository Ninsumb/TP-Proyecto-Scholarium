// src/types/Portal/Foro.ts

export interface EtiquetaResponse {
  id: string;
  nombre: string;
}

export interface TableroResponse {
  id: string;
  nombre: string;
  descripcion: string | null;
  etiqueta: EtiquetaResponse;
  createdAt: string;
  updatedAt: string;
}

export interface AutorDTO {
  id: number;
  nombre: string;
  fotoPerfil: string | null;
}

export interface PostResponse {
  id: string;
  titulo: string | null;
  contenido: string | null;   // null cuando el post está eliminado
  tableroId: string;
  autor: AutorDTO | null;     // null cuando el post está eliminado
  postPadreId: string | null;
  cantidadRespuestas: number;
  eliminado: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CrearTableroRequest {
  nombre: string;
  etiqueta: string;
  descripcion: string | null;
}

export interface CrearPostRequest {
  titulo: string | null;
  contenido: string;
}

export interface EditarPostRequest {
  titulo?: string;
  contenido: string;
}

export interface CrearRespuestaRequest {
  contenido: string;
}

export interface PostResponse {
  id: string;
  titulo: string | null;
  contenido: string | null;
  tableroId: string;
  autor: AutorDTO | null;
  postPadreId: string | null;
  cantidadRespuestas: number;
  eliminado: boolean;
  ocultado: boolean;           // NUEVO
  ocultadoMotivo: string | null; // NUEVO — solo presente para admins
  createdAt: string;
  updatedAt: string;
}

export interface OcultarPostRequest {
  motivo: string;
}

export interface EditarTableroRequest {
  nombre: string;
  descripcion: string | null;
}