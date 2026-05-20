import axios from "axios";
import type { AxiosInstance } from "axios";
import type {
    MaterialResponse,
    SubirMaterialRequest,
} from "../../types/Material/Material";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9001/api";

class MaterialService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({ baseURL: `${API_URL}/material` });
        // misma logica de interceptors que PortalService (token + 401)
        this.api.interceptors.request.use((config) => {
            const token = localStorage.getItem("token");
            if (token) config.headers.Authorization = `Bearer ${token}`;
            return config;
        });
        this.api.interceptors.response.use(
            (r) => r,
            (error) => {
                if (error.response?.status === 401) {
                    localStorage.removeItem("token");
                    window.location.href = "/login";
                }
                return Promise.reject(error);
            },
        );
    }

    async subirMaterial(
        materiaId: string,
        payload: SubirMaterialRequest,
    ): Promise<MaterialResponse> {
        const fd = new FormData();
        fd.append("archivo", payload.archivo);
        fd.append("nombre", payload.nombre);
        fd.append("tipo", payload.tipo);
        if (payload.descripcion?.trim())
            fd.append("descripcion", payload.descripcion);

        const { data } = await this.api.post<MaterialResponse>(
            `/materias/${materiaId}/material`,
            fd,
        );
        return data;
    }
}

export const materialService = new MaterialService();
