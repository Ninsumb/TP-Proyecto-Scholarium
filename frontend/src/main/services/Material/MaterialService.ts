import apiClient from '../../services/apiClient';
import type { MaterialResponse, SubirMaterialRequest, TipoMaterial } from '../../types/Material/Material';

export interface EditarMaterialRequest {
  nombre: string;
  descripcion?: string;
  tipo: TipoMaterial;
}

class MaterialService {
  async subirMaterial(materiaId: string, payload: SubirMaterialRequest): Promise<MaterialResponse> {
    const fd = new FormData();
    fd.append('archivo', payload.archivo);
    fd.append('nombre', payload.nombre);
    fd.append('tipo', payload.tipo);
    if (payload.descripcion?.trim()) {
      fd.append('descripcion', payload.descripcion);
    }

    const { data } = await apiClient.post<MaterialResponse>(
      `/material/materias/${materiaId}/material`,
      fd
    );
    return data;
  }

  async listarMaterialPublicado(materiaId: string): Promise<MaterialResponse[]> {
    const { data } = await apiClient.get<MaterialResponse[]>(
      `/materias/${materiaId}/material`
    );
    return data;
  }

  async buscarMaterial(materiaId: string, nombre: string): Promise<MaterialResponse[]> {
    const { data } = await apiClient.get<MaterialResponse[]>(
      `/materias/${materiaId}/material/buscar`,
      { params: { nombre } }
    );
    return data;
  }

  async obtenerUrlDescarga(materialId: string): Promise<string> {
    const { data } = await apiClient.get<{ url: string }>(
      `/material/${materialId}/descargar`
    );
    return data.url;
  }

  async editarMaterial(materialId: string, payload: EditarMaterialRequest): Promise<MaterialResponse> {
    const { data } = await apiClient.put<MaterialResponse>(
      `/material/${materialId}`,
      payload
    );
    return data;
  }

  async eliminarMaterial(materialId: string): Promise<void> {
    await apiClient.delete(`/material/${materialId}`);
  }
}

export const materialService = new MaterialService();