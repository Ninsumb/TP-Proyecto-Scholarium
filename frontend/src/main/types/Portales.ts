export interface Portal {
    id: string;
    nombre: string;
    descripcion: string;
    icon: string; 
    color: string;
    universidad: string;
    carrera: string;
    estudiantes: number;
}

export interface buscarPortalesResponse {
    portales: Portal[];
    page: number;
    total: number;
}