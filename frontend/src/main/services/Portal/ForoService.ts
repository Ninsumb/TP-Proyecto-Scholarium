// src/main/services/foroService.ts

import axios from 'axios';
import { authService } from '../AuthService';
import type {
  TableroResponse,
  PostResponse,
  CrearTableroRequest,
  CrearPostRequest,
  CrearRespuestaRequest,
  EditarPostRequest,
} from '../../types/Portal/Foro';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9001/api';

class ForoService {
  private api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
  });

  private authHeaders() {
    const token = authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // ── Tableros ──────────────────────────────────────────────────────────────

  async listarTableros(
    portalId: number,
    etiqueta?: string
  ): Promise<TableroResponse[]> {
    const params = etiqueta ? { etiqueta } : {};
    const response = await this.api.get<TableroResponse[]>(
      `/portales/${portalId}/foros`,
      { headers: this.authHeaders(), params }
    );
    return response.data;
  }

  async crearTablero(
    portalId: number,
    request: CrearTableroRequest
  ): Promise<TableroResponse> {
    const response = await this.api.post<TableroResponse>(
      `/portales/${portalId}/foros`,
      request,
      { headers: this.authHeaders() }
    );
    return response.data;
  }

  // ── Posts ─────────────────────────────────────────────────────────────────

  async listarPosts(tableroId: string): Promise<PostResponse[]> {
    const response = await this.api.get<PostResponse[]>(
      `/foros/${tableroId}/posts`,
      { headers: this.authHeaders() }
    );
    return response.data;
  }

  async crearPost(
    tableroId: string,
    request: CrearPostRequest
  ): Promise<PostResponse> {
    const response = await this.api.post<PostResponse>(
      `/foros/${tableroId}/posts`,
      request,
      { headers: this.authHeaders() }
    );
    return response.data;
  }

  async editarPost(
    postId: string,
    request: EditarPostRequest
  ): Promise<PostResponse> {
    const response = await this.api.put<PostResponse>(
      `/posts/${postId}`,
      request,
      { headers: this.authHeaders() }
    );
    return response.data;
  }

  async eliminarPost(postId: string): Promise<void> {
    await this.api.delete(`/posts/${postId}`, {
      headers: this.authHeaders(),
    });
  }

  // ── Respuestas ────────────────────────────────────────────────────────────

  async listarRespuestas(postId: string): Promise<PostResponse[]> {
    const response = await this.api.get<PostResponse[]>(
      `/posts/${postId}/respuestas`,
      { headers: this.authHeaders() }
    );
    return response.data;
  }

  async responderPost(
    postId: string,
    request: CrearRespuestaRequest
  ): Promise<PostResponse> {
    const response = await this.api.post<PostResponse>(
      `/posts/${postId}/respuestas`,
      request,
      { headers: this.authHeaders() }
    );
    return response.data;
  }
}

export const foroService = new ForoService();