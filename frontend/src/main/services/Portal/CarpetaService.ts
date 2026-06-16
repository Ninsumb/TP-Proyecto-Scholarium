import apiClient from "../apiClient";
import type { PortalEstructura } from "../../types/Portal/Carpeta";

class CarpetaService {
    async getEstructura(portalId: number): Promise<PortalEstructura> {
        const response = await apiClient.get<PortalEstructura>(
            `/portales/${portalId}/estructura`,
        );
        return response.data;
    }

    async crear(
        portalId: number,
        nombre: string,
        carpetaPadreId: string | null,
    ): Promise<void> {
        await apiClient.post(`/portales/${portalId}/carpetas`, {
            nombre,
            carpetaPadreId: carpetaPadreId ?? undefined,
        });
    }

    async renombrar(
        portalId: number,
        carpetaId: string,
        nuevoNombre: string,
    ): Promise<void> {
        await apiClient.put(
            `/portales/${portalId}/carpetas/${carpetaId}/renombrar`,
            nuevoNombre,
            {
                headers: { "Content-Type": "text/plain" },
            },
        );
    }

    async eliminar(carpetaId: string): Promise<void> {
        await apiClient.delete(`/carpetas/${carpetaId}`);
    }

    async mover(
        carpetaId: string,
        carpetaPadreId: string | null,
    ): Promise<void> {
        await apiClient.patch(`/carpetas/${carpetaId}/mover`, {
            carpetaPadre: carpetaPadreId,
        });
    }
}

export const carpetaService = new CarpetaService();
