import apiClient from "../apiClient";
import type { PortalEstructura } from "../../types/Portal/Carpeta";

class CarpetaService {
    async getEstructura(portalId: number): Promise<PortalEstructura> {
        const response = await apiClient.get<PortalEstructura>(
            `/portales/${portalId}/estructura`,
        );
        return response.data;
    }
}

export const carpetaService = new CarpetaService();
