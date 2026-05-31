export interface MateriaArbol {
    id: string;
    nombre: string;
    foroId: string | null;
    orden: number;
}

export interface CarpetaArbol {
    id: string;
    nombre: string;
    carpetaPadreId: string | null;
    orden: number;
    subcarpetas: CarpetaArbol[];
    materias: MateriaArbol[];
}

export interface PortalEstructura {
    portalId: number;
    carpetas: CarpetaArbol[];
}
