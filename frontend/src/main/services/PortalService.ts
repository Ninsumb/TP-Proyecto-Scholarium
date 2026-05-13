import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type { buscarPortalesResponse } from '../types/Portales';



class PortalService {
    private api: AxiosInstance;
    constructor() {
        this.api = axios.create({
            baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:9001/api'}/portales`,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    async getPortales(universidad: string, carrera: string): Promise<buscarPortalesResponse> {
        const response = await this.api.get<buscarPortalesResponse>('/buscar', { params: { universidad, carrera } });
        return response.data;
    }

}

export const portalService = new PortalService();