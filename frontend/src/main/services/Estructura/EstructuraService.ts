import axios from "axios";
import type { AxiosInstance } from "axios";
import type { EstructuraResponse } from "../../types/Estructura/Estructura";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9001/api";

class EstructuraService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({ baseURL: API_URL });
        this.api.interceptors.request.use((config) => {
            const token = localStorage.getItem("token");
            if (token) config.headers.Authorization = `Bearer ${token}`;
            return config;
        });
        this.api.interceptors.response.use(
            (r) => r,
            (err) => {
                if (err.response?.status === 401) {
                    localStorage.removeItem("token");
                    window.location.href = "/login";
                }
                return Promise.reject(err);
            },
        );
    }

    async getEstructura(portalId: string): Promise<EstructuraResponse> {
        const { data } = await this.api.get<EstructuraResponse>(
            `/portales/${portalId}/estructura`,
        );
        return data;
    }
}

export const estructuraService = new EstructuraService();
