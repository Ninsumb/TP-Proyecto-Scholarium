// services/Portal/MateriaService.ts
import apiClient from "../apiClient";
import type { MateriaResponse } from "../../types/Portal/Materia";

class MateriaService {
    async obtenerMateria(materiaId: string): Promise<MateriaResponse> {
        const response = await apiClient.get<MateriaResponse>(
            `/materias/${materiaId}`,
        );
        return response.data;
    }

    async actualizarMateria(
        materiaId: string,
        data: { nombre: string; descripcion?: string },
    ): Promise<MateriaResponse> {
        const response = await apiClient.put<MateriaResponse>(
            `/materias/${materiaId}`,
            data,
        );
        return response.data;
    }

    async mover(materiaId: string, nuevaCarpetaId: string): Promise<void> {
        await apiClient.put(`/materias/${materiaId}/mover`, { nuevaCarpetaId });
    }
}

export const materiaService = new MateriaService();
