import apiClient from '../apiClient';
import type {
  TableroResponse,
  PostResponse,
  CrearTableroRequest,
  CrearPostRequest,
  CrearRespuestaRequest,
  EditarPostRequest,
  OcultarPostRequest,
  EditarTableroRequest,
  EtiquetaResponse,
} from '../../types/Portal/Foro';

class ForoService {
  async listarTableros(portalId: number, etiqueta?: string): Promise<TableroResponse[]> {
    const params = etiqueta ? { etiqueta } : {};
    const response = await apiClient.get<TableroResponse[]>(`/portales/${portalId}/foros`, { params });
    return response.data;
  }

  async listarEtiquetas(portalId: number): Promise<EtiquetaResponse[]> {
    const response = await apiClient.get<EtiquetaResponse[]>(`/portales/${portalId}/foros/etiquetas`);
    return response.data;
  }

  async crearTablero(portalId: number, request: CrearTableroRequest): Promise<TableroResponse> {
    const response = await apiClient.post<TableroResponse>(`/portales/${portalId}/foros`, request);
    return response.data;
  }

  async listarPosts(tableroId: string): Promise<PostResponse[]> {
    const response = await apiClient.get<PostResponse[]>(`/foros/${tableroId}/posts`);
    return response.data;
  }

  async crearPost(tableroId: string, request: CrearPostRequest): Promise<PostResponse> {
    const response = await apiClient.post<PostResponse>(`/foros/${tableroId}/posts`, request);
    return response.data;
  }

  async buscarPosts(tableroId: string, q: string): Promise<PostResponse[]> {
    const response = await apiClient.get<PostResponse[]>(
      `/foros/${tableroId}/posts/buscar`,
      { params: { q } }
    );
    return response.data;
  }

  async editarPost(postId: string, request: EditarPostRequest): Promise<PostResponse> {
    const response = await apiClient.put<PostResponse>(`/posts/${postId}`, request);
    return response.data;
  }

  async eliminarPost(postId: string): Promise<void> {
    await apiClient.delete(`/posts/${postId}`);
  }

  async listarRespuestas(postId: string): Promise<PostResponse[]> {
    const response = await apiClient.get<PostResponse[]>(`/posts/${postId}/respuestas`);
    return response.data;
  }

  async responderPost(postId: string, request: CrearRespuestaRequest): Promise<PostResponse> {
    const response = await apiClient.post<PostResponse>(`/posts/${postId}/respuestas`, request);
    return response.data;
  }

  async editarTablero(portalId: number, tableroId: string, request: EditarTableroRequest): Promise<TableroResponse> {
  const response = await apiClient.put<TableroResponse>(
    `/portales/${portalId}/foros/${tableroId}`,
    request,
  );
  return response.data;
}

async ocultarPost(postId: string, request: OcultarPostRequest): Promise<PostResponse> {
  const response = await apiClient.post<PostResponse>(`/posts/${postId}/ocultar`, request);
  return response.data;
}

async develarPost(postId: string): Promise<PostResponse> {
  const response = await apiClient.post<PostResponse>(`/posts/${postId}/develar`, {});
  return response.data;
}
}

export const foroService = new ForoService();