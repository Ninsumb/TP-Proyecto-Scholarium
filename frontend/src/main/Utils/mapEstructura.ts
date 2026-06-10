import type {
    CarpetaDTO,
    FolderItemNode,
} from "../types/Estructura/Estructura";

export function mapCarpetaToNode(c: CarpetaDTO): FolderItemNode {
    const subcarpetasNodos = c.subcarpetas.map(mapCarpetaToNode);
    const materiasNodos: FolderItemNode[] = c.materias.map((m) => ({
        id: m.id,
        nombre: m.nombre,
        type: "subject",
        orden: m.orden,
    }));

    const children = [...subcarpetasNodos, ...materiasNodos].sort(
        (a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre),
    );

    return {
        id: c.id,
        nombre: c.nombre,
        type: "folder",
        orden: c.orden,
        children,
    };
}
