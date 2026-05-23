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
      fd,
      // Sin Content-Type explícito: axios lo setea automático para FormData
    );
    return data;
  }
}

export const materialService = new MaterialService();