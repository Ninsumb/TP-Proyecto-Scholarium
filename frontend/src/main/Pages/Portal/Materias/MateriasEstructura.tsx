import { useEffect, useState } from "react";
import { Link, useParams, useOutletContext } from "react-router";
import {
    BookOpen,
    ChevronDown,
    ChevronRight,
    Folder,
    FolderPlus,
} from "lucide-react";
import { carpetaService } from "../../../services/Portal/CarpetaService";
import type { CarpetaArbol } from "../../../types/Portal/Carpeta";

export function Subjects() {
    const { portalId } = useParams();
    const { isAdmin } = useOutletContext<{
        isAdmin: boolean;
        isMember: boolean;
    }>();
    const [folderStructure, setFolderStructure] = useState<CarpetaArbol[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
        new Set(),
    );
    const [showNewFolderModal, setShowNewFolderModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [selectedParentFolder, setSelectedParentFolder] = useState<
        string | null
    >(null);

    useEffect(() => {
        carpetaService
            .getEstructura(Number(portalId))
            .then((data) => setFolderStructure(data.carpetas))
            .finally(() => setLoading(false));
    }, [portalId]);

    const toggleFolder = (folderId: string) => {
        const newExpanded = new Set(expandedFolders);
        if (newExpanded.has(folderId)) {
            newExpanded.delete(folderId);
        } else {
            newExpanded.add(folderId);
        }
        setExpandedFolders(newExpanded);
    };

    const handleCreateFolder = (parentId: string | null) => {
        setSelectedParentFolder(parentId);
        setShowNewFolderModal(true);
    };

    const createFolder = () => {
        if (!newFolderName.trim()) return;

        const newFolder: CarpetaArbol = {
            id: `folder-${Date.now()}`,
            nombre: newFolderName,
            carpetaPadreId: selectedParentFolder,
            orden: 0,
            subcarpetas: [],
            materias: [],
        };

        if (selectedParentFolder === null) {
            // Agregar a raíz
            setFolderStructure([...folderStructure, newFolder]);
        } else {
            // Agregar dentro de una carpeta
            const addToFolder = (items: CarpetaArbol[]): CarpetaArbol[] => {
                return items.map((item) => {
                    if (item.id === selectedParentFolder) {
                        return {
                            ...item,
                            subcarpetas: [
                                ...(item.subcarpetas || []),
                                newFolder,
                            ],
                        };
                    }
                    if (item.subcarpetas) {
                        return {
                            ...item,
                            subcarpetas: addToFolder(item.subcarpetas),
                        };
                    }
                    return item;
                });
            };
            setFolderStructure(addToFolder(folderStructure));
        }

        setNewFolderName("");
        setShowNewFolderModal(false);
        setSelectedParentFolder(null);
    };

    const renderFolder = (item: CarpetaArbol, depth: number = 0) => {
        const isExpanded = expandedFolders.has(item.id);
        const paddingLeft = depth * 24;

        return (
            <div key={item.id}>
                <div
                    className="flex items-center gap-2 px-4 py-3 hover:bg-surface-container-low transition-colors group rounded-sm"
                    style={{ paddingLeft: `${paddingLeft + 16}px` }}
                >
                    <button
                        onClick={() => toggleFolder(item.id)}
                        className="flex items-center gap-2 flex-1 text-left"
                    >
                        {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <Folder className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="font-medium text-foreground">
                            {item.nombre}
                        </span>
                        <span className="text-xs text-foreground ml-2">
                            {(item.subcarpetas?.length || 0) +
                                (item.materias?.length || 0)}{" "}
                            elementos
                        </span>
                    </button>

                    {isAdmin && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <button
                                onClick={() => handleCreateFolder(item.id)}
                                className="p-1.5 hover:bg-surface-container rounded-sm text-muted-foreground hover:text-foreground"
                                title="Crear subcarpeta"
                            >
                                <FolderPlus className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {isExpanded && (
                    <div>
                        {item.subcarpetas?.map((sub) =>
                            renderFolder(sub, depth + 1),
                        )}
                        {item.materias?.map((materia) => (
                            <Link
                                key={materia.id}
                                to={`/portal/${portalId}/materias/${materia.id}`}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors group rounded-sm"
                                style={{ paddingLeft: `${paddingLeft + 40}px` }}
                            >
                                <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <BookOpen className="w-4 h-4 text-primary" />
                                </div>
                                <span className="text-foreground group-hover:text-primary transition-colors">
                                    {materia.nombre}
                                </span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    if (loading)
        return (
            <div className="p-8 text-muted-foreground">
                Cargando estructura...
            </div>
        );
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1
                        className="text-3xl mb-2 text-foreground"
                        style={{ fontFamily: "Work Sans, sans-serif" }}
                    >
                        Materias de la Carrera
                    </h1>
                    <p className="text-muted-foreground">
                        Explora las materias organizadas en carpetas
                        personalizadas
                    </p>
                </div>

                {isAdmin && (
                    <button
                        onClick={() => handleCreateFolder(null)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-surface-container-high text-foreground hover:bg-surface-container transition-all"
                    >
                        <FolderPlus className="w-4 h-4" />
                        Nueva Carpeta
                    </button>
                )}
            </div>

            <div
                className="bg-surface-container-lowest rounded-sm"
                style={{ boxShadow: "0 1px 3px rgba(58, 95, 148, 0.06)" }}
            >
                {folderStructure.map((item) => renderFolder(item))}
            </div>

            {/* Modal para crear nueva carpeta */}
            {showNewFolderModal && (
                <div
                    className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4"
                    style={{ backdropFilter: "blur(4px)" }}
                    onClick={() => setShowNewFolderModal(false)}
                >
                    <div
                        className="bg-surface-container-lowest p-6 rounded-sm max-w-md w-full"
                        style={{
                            boxShadow: "0 24px 40px rgba(42, 52, 57, 0.15)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3
                            className="text-xl font-semibold text-foreground mb-4"
                            style={{ fontFamily: "Work Sans, sans-serif" }}
                        >
                            Crear Nueva Carpeta
                        </h3>

                        <div className="mb-6">
                            <label
                                htmlFor="folderName"
                                className="block text-sm font-medium text-foreground mb-2"
                            >
                                Nombre de la carpeta
                            </label>
                            <input
                                type="text"
                                id="folderName"
                                value={newFolderName}
                                onChange={(e) =>
                                    setNewFolderName(e.target.value)
                                }
                                placeholder="Ej: Tercer Año, Electivas, etc."
                                className="w-full px-4 py-3 bg-surface-container-lowest text-foreground rounded-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                style={{
                                    border: "2px solid rgba(169, 180, 185, 0.15)",
                                }}
                                autoFocus
                                onKeyPress={(e) =>
                                    e.key === "Enter" && createFolder()
                                }
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={createFolder}
                                className="flex-1 px-4 py-2 rounded-sm transition-all"
                                style={{
                                    background:
                                        "linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 100%)",
                                    color: "var(--primary-foreground)",
                                }}
                            >
                                Crear Carpeta
                            </button>
                            <button
                                onClick={() => {
                                    setShowNewFolderModal(false);
                                    setNewFolderName("");
                                }}
                                className="px-4 py-2 bg-surface-container-high text-foreground rounded-sm hover:bg-surface-container transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
