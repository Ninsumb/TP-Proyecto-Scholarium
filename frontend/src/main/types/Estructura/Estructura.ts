export interface MateriaDTO {
    id: string;
    nombre: string;
    foroId: string;
    orden: number;
}

export interface CarpetaDTO {
    id: string;
    nombre: string;
    carpetaPadreId: string | null;
    orden: number;
    subcarpetas: CarpetaDTO[];
    materias: MateriaDTO[];
}

export interface EstructuraResponse {
    portalId: number | string;
    carpetas: CarpetaDTO[];
}

export interface FolderItemNode {
    id: string;
    nombre: string;
    type: "folder" | "subject";
    orden: number;
    children?: FolderItemNode[];
}
