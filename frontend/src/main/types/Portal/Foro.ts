export interface AutorDTO {
  id: number;
  nombre: string;
}

export interface EtiquetaSimpleResponse {
  id: string;
  nombre: string;
}

export interface TableroResponse {
  id: string;
  nombre: string;
  descripcion: string | null;
  etiqueta: EtiquetaSimpleResponse;
  createdAt: string;
  updatedAt: string | null;
}

export interface PostResponse {
  id: string;
  titulo: string | null;
  contenido: string;
  tableroId: string;
  autor: AutorDTO;
  postPadreId: string | null;
  cantidadRespuestas: number;
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

export interface CrearRespuestaRequest {
  contenido: string;
}