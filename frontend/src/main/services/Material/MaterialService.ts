import apiClient from '../../services/apiClient';
import type { MaterialResponse, SubirMaterialRequest } from '../../types/Material/Material';

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
}

export const materialService = new MaterialService();