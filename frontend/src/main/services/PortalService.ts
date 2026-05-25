import apiClient from './apiClient';
import type { buscarPortalesResponse } from '../types/Portales';
import type { Portal } from '../types/Portales';


class PortalService {
    private api: AxiosInstance;
    constructor() {
        this.api = axios.create({
            baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:9001/api'}/portales`,
            headers: { 'Content-Type': 'application/json' },
        });

        // Interceptor para agregar el token
        this.api.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('token');
            if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
        );
    }

    async getPortales(universidad: string, carrera: string, pagina: number): Promise<buscarPortalesResponse> {
        const response = await this.api.get<buscarPortalesResponse>('/buscar', { params: { universidad, carrera, pagina } });
        return response.data;
    }

}

export const portalService = new PortalService();