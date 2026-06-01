import { useEffect, useState, useRef } from "react";
import { Link, useParams, useOutletContext } from "react-router";
import {
    BookOpen,
    ChevronDown,
    ChevronRight,
    Folder,
    FolderPlus,
    MoreHorizontal,
    Plus,
    Pencil,
    Trash2,
    FolderSymlink,
    MoveRight,
} from "lucide-react";
import { carpetaService } from "../../../services/Portal/CarpetaService";
import type { CarpetaArbol } from "../../../types/Portal/Carpeta";

// ─── Tipos de modal ────────────────────────────────────────────────────────────
type ModalType =
    | "newFolder"
    | "createSubject"
    | "renameFolder"
    | "deleteFolder"
    | "moveFolder"
    | "moveSubject"
    | null;

interface FolderOption {
    id: string;
    nombre: string;
    depth: number;
}

// ─── Helper: aplanar el árbol en una lista con profundidad ─────────────────────
function flattenFolders(
    carpetas: CarpetaArbol[],
    depth: number = 0,
    excludeId?: string,
): FolderOption[] {
    const result: FolderOption[] = [];
    for (const c of carpetas) {
        if (c.id === excludeId) continue;
        result.push({ id: c.id, nombre: c.nombre, depth });
        if (c.subcarpetas?.length) {
            result.push(...flattenFolders(c.subcarpetas, depth + 1, excludeId));
        }
    }
    return result;
}

// ─── Componente de menú contextual "..." ──────────────────────────────────────
interface ContextMenuProps {
    items: { label: string; icon: React.ReactNode; onClick: () => void; danger?: boolean }[];
}

function ContextMenu({ items }: ContextMenuProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen((v) => !v);
                }}
                className="p-1.5 hover:bg-surface-container rounded-sm text-muted-foreground hover:text-foreground transition-colors"
                title="Opciones"
            >
                <MoreHorizontal className="w-4 h-4" />
            </button>

            {open && (
                <div
                    className="absolute right-0 top-full mt-1 bg-surface-container-lowest rounded-sm z-50 min-w-[180px] py-1"
                    style={{
                        boxShadow: "0 8px 24px rgba(42, 52, 57, 0.14)",
                        border: "1px solid rgba(169, 180, 185, 0.15)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {items.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                item.onClick();
                                setOpen(false);
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-surface-container-low text-left ${
                                item.danger
                                    ? "text-destructive hover:text-destructive"
                                    : "text-foreground"
                            }`}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Selector de carpeta (usado en modales de mover/crear) ────────────────────
interface FolderSelectorProps {
    options: FolderOption[];
    value: string | null;
    onChange: (id: string) => void;
    placeholder?: string;
}

function FolderSelector({ options, value, onChange, placeholder }: FolderSelectorProps) {
    return (
        <select
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 bg-surface-container-lowest text-foreground rounded-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
            style={{ border: "2px solid rgba(169, 180, 185, 0.15)" }}
        >
            <option value="" disabled>
                {placeholder ?? "Seleccionar carpeta..."}
            </option>
            {options.map((opt) => (
                <option key={opt.id} value={opt.id}>
                    {"　".repeat(opt.depth)}
                    {opt.depth > 0 ? "└ " : ""}
                    {opt.nombre}
                </option>
            ))}
        </select>
    );
}

// ─── Modal base ────────────────────────────────────────────────────────────────
interface ModalShellProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

function ModalShell({ title, onClose, children }: ModalShellProps) {
    return (
        <div
            className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4"
            style={{ backdropFilter: "blur(4px)" }}
            onClick={onClose}
        >
            <div
                className="bg-surface-container-lowest p-6 rounded-sm max-w-md w-full"
                style={{ boxShadow: "0 24px 40px rgba(42, 52, 57, 0.15)" }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3
                    className="text-xl font-semibold text-foreground mb-4"
                    style={{ fontFamily: "Work Sans, sans-serif" }}
                >
                    {title}
                </h3>
                {children}
            </div>
        </div>
    );
}

// ─── Botones de acción del modal ───────────────────────────────────────────────
interface ModalActionsProps {
    confirmLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmDisabled?: boolean;
    danger?: boolean;
}

function ModalActions({ confirmLabel, onConfirm, onCancel, confirmDisabled, danger }: ModalActionsProps) {
    return (
        <div className="flex gap-3">
            <button
                onClick={onConfirm}
                disabled={confirmDisabled}
                className="flex-1 px-4 py-2 rounded-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={
                    danger
                        ? {
                              background: "var(--destructive)",
                              color: "var(--destructive-foreground)",
                          }
                        : {
                              background:
                                  "linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 100%)",
                              color: "var(--primary-foreground)",
                          }
                }
            >
                {confirmLabel}
            </button>
            <button
                onClick={onCancel}
                className="px-4 py-2 bg-surface-container-high text-foreground rounded-sm hover:bg-surface-container transition-colors"
            >
                Cancelar
            </button>
        </div>
    );
}

// ─── Componente principal ──────────────────────────────────────────────────────
export function Subjects() {
    const { portalId } = useParams();
    const { isAdmin } = useOutletContext<{
        isAdmin: boolean;
        isMember: boolean;
    }>();

    const [folderStructure, setFolderStructure] = useState<CarpetaArbol[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

    // ── Estado del modal activo ─────────────────────────────────────────────────
    const [activeModal, setActiveModal] = useState<ModalType>(null);

    // Datos compartidos para los distintos modales
    const [targetFolderId, setTargetFolderId] = useState<string | null>(null);   // carpeta sobre la que se actúa
    const [targetSubjectId, setTargetSubjectId] = useState<string | null>(null); // materia sobre la que se actúa

    // ── Campos de formulario ────────────────────────────────────────────────────
    const [newFolderName, setNewFolderName] = useState("");
    const [selectedParentFolder, setSelectedParentFolder] = useState<string | null>(null);

    const [subjectName, setSubjectName] = useState("");
    const [subjectTag, setSubjectTag] = useState("");
    const [subjectFolder, setSubjectFolder] = useState<string | null>(null);

    const [renameFolderValue, setRenameFolderValue] = useState("");
    const [moveFolderTarget, setMoveFolderTarget] = useState<string | null>(null);
    const [moveSubjectTarget, setMoveSubjectTarget] = useState<string | null>(null);

    // ── Helpers de estado ───────────────────────────────────────────────────────
    const resetModal = () => {
        setActiveModal(null);
        setTargetFolderId(null);
        setTargetSubjectId(null);
        setNewFolderName("");
        setSelectedParentFolder(null);
        setSubjectName("");
        setSubjectTag("");
        setSubjectFolder(null);
        setRenameFolderValue("");
        setMoveFolderTarget(null);
        setMoveSubjectTarget(null);
    };

    // ── Carga inicial ───────────────────────────────────────────────────────────
    useEffect(() => {
        carpetaService
            .getEstructura(Number(portalId))
            .then((data) => setFolderStructure(data.carpetas))
            .finally(() => setLoading(false));
    }, [portalId]);

    const toggleFolder = (folderId: string) => {
        setExpandedFolders((prev) => {
            const next = new Set(prev);
            next.has(folderId) ? next.delete(folderId) : next.add(folderId);
            return next;
        });
    };

    // ── Busca la carpeta por id recursivamente ─────────────────────────────────
    const findFolder = (id: string, items: CarpetaArbol[]): CarpetaArbol | null => {
        for (const item of items) {
            if (item.id === id) return item;
            const found = findFolder(id, item.subcarpetas ?? []);
            if (found) return found;
        }
        return null;
    };

    const targetFolder = targetFolderId ? findFolder(targetFolderId, folderStructure) : null;

    // ── Acciones de carpeta ─────────────────────────────────────────────────────
    const openNewFolderModal = (parentId: string | null) => {
        setSelectedParentFolder(parentId);
        setActiveModal("newFolder");
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
            setFolderStructure((prev) => [...prev, newFolder]);
        } else {
            const addToFolder = (items: CarpetaArbol[]): CarpetaArbol[] =>
                items.map((item) => {
                    if (item.id === selectedParentFolder) {
                        return { ...item, subcarpetas: [...(item.subcarpetas ?? []), newFolder] };
                    }
                    return { ...item, subcarpetas: addToFolder(item.subcarpetas ?? []) };
                });
            setFolderStructure((prev) => addToFolder(prev));
        }
        resetModal();
    };

    const renameFolder = () => {
        if (!renameFolderValue.trim() || !targetFolderId) return;

        const applyRename = (items: CarpetaArbol[]): CarpetaArbol[] =>
            items.map((item) => {
                if (item.id === targetFolderId) return { ...item, nombre: renameFolderValue.trim() };
                return { ...item, subcarpetas: applyRename(item.subcarpetas ?? []) };
            });

        setFolderStructure((prev) => applyRename(prev));
        resetModal();
    };

    const deleteFolder = () => {
        if (!targetFolderId) return;
        const folder = findFolder(targetFolderId, folderStructure);
        if (!folder) return;

        const isEmpty =
            (folder.subcarpetas?.length ?? 0) === 0 &&
            (folder.materias?.length ?? 0) === 0;

        if (!isEmpty) return; // El modal ya muestra el error; este guard es defensivo

        const removeFolder = (items: CarpetaArbol[]): CarpetaArbol[] =>
            items
                .filter((item) => item.id !== targetFolderId)
                .map((item) => ({ ...item, subcarpetas: removeFolder(item.subcarpetas ?? []) }));

        setFolderStructure((prev) => removeFolder(prev));
        resetModal();
    };

    const moveFolder = () => {
        if (!targetFolderId || !moveFolderTarget) return;
        // TODO: conectar con endpoint del back
        resetModal();
    };

    // ── Acciones de materia ─────────────────────────────────────────────────────
    const createSubject = () => {
        if (!subjectName.trim() || !subjectTag.trim() || !subjectFolder) return;
        // TODO: POST /api/carpetas/{subjectFolder}/materias  body: { nombre, etiqueta }
        resetModal();
    };

    const moveSubject = () => {
        if (!targetSubjectId || !moveSubjectTarget) return;
        // TODO: conectar con endpoint del back
        resetModal();
    };

    // ── Opciones del menu "..." de carpeta ──────────────────────────────────────
    const folderMenuItems = (item: CarpetaArbol) => [
        {
            label: "Cambiar nombre",
            icon: <Pencil className="w-4 h-4" />,
            onClick: () => {
                setTargetFolderId(item.id);
                setRenameFolderValue(item.nombre);
                setActiveModal("renameFolder");
            },
        },
        {
            label: "Mover carpeta",
            icon: <FolderSymlink className="w-4 h-4" />,
            onClick: () => {
                setTargetFolderId(item.id);
                setActiveModal("moveFolder");
            },
        },
        {
            label: "Eliminar carpeta",
            icon: <Trash2 className="w-4 h-4" />,
            danger: true,
            onClick: () => {
                setTargetFolderId(item.id);
                setActiveModal("deleteFolder");
            },
        },
    ];

    // ── Render del árbol ────────────────────────────────────────────────────────
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
                        <span className="font-medium text-foreground">{item.nombre}</span>
                        <span className="text-xs text-foreground ml-2">
                            {(item.subcarpetas?.length || 0) + (item.materias?.length || 0)} elementos
                        </span>
                    </button>

                    {isAdmin && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            <button
                                onClick={() => openNewFolderModal(item.id)}
                                className="p-1.5 hover:bg-surface-container rounded-sm text-muted-foreground hover:text-foreground"
                                title="Crear subcarpeta"
                            >
                                <FolderPlus className="w-4 h-4" />
                            </button>
                            <ContextMenu items={folderMenuItems(item)} />
                        </div>
                    )}
                </div>

                {isExpanded && (
                    <div>
                        {item.subcarpetas?.map((sub) => renderFolder(sub, depth + 1))}
                        {item.materias?.map((materia) => (
                            <div
                                key={materia.id}
                                className="flex items-center hover:bg-surface-container-low transition-colors group rounded-sm"
                                style={{ paddingLeft: `${paddingLeft + 40}px` }}
                            >
                                <Link
                                    to={`/portal/${portalId}/materias/${materia.id}`}
                                    className="flex items-center gap-3 px-4 py-3 flex-1"
                                >
                                    <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <BookOpen className="w-4 h-4 text-primary" />
                                    </div>
                                    <span className="text-foreground group-hover:text-primary transition-colors">
                                        {materia.nombre}
                                    </span>
                                </Link>

                                {isAdmin && (
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-4">
                                        <ContextMenu
                                            items={[
                                                {
                                                    label: "Mover materia",
                                                    icon: <MoveRight className="w-4 h-4" />,
                                                    onClick: () => {
                                                        setTargetSubjectId(materia.id);
                                                        setActiveModal("moveSubject");
                                                    },
                                                },
                                            ]}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // ── Opciones de carpeta para selectores ─────────────────────────────────────
    const allFolderOptions = flattenFolders(folderStructure);
    const moveFolderOptions = flattenFolders(folderStructure, 0, targetFolderId ?? undefined);

    // ── Early returns ───────────────────────────────────────────────────────────
    if (loading)
        return <div className="p-8 text-muted-foreground">Cargando estructura...</div>;

    const targetFolderIsEmpty =
        targetFolder &&
        (targetFolder.subcarpetas?.length ?? 0) === 0 &&
        (targetFolder.materias?.length ?? 0) === 0;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* ── Header ── */}
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1
                        className="text-3xl mb-2 text-foreground"
                        style={{ fontFamily: "Work Sans, sans-serif" }}
                    >
                        Materias de la Carrera
                    </h1>
                    <p className="text-muted-foreground">
                        Explora las materias organizadas en carpetas personalizadas
                    </p>
                </div>

                {isAdmin && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setActiveModal("createSubject")}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-sm transition-all"
                            style={{
                                background:
                                    "linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 100%)",
                                color: "var(--primary-foreground)",
                            }}
                        >
                            <Plus className="w-4 h-4" />
                            Crear Materia
                        </button>
                        <button
                            onClick={() => openNewFolderModal(null)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-surface-container-high text-foreground hover:bg-surface-container transition-all"
                        >
                            <FolderPlus className="w-4 h-4" />
                            Nueva Carpeta
                        </button>
                    </div>
                )}
            </div>

            {/* ── Árbol ── */}
            <div
                className="bg-surface-container-lowest rounded-sm"
                style={{ boxShadow: "0 1px 3px rgba(58, 95, 148, 0.06)" }}
            >
                {folderStructure.map((item) => renderFolder(item))}
            </div>

            {/* ══════════════════════════════════════════════════════════════════════
                MODALES
            ══════════════════════════════════════════════════════════════════════ */}

            {/* ── Modal: Nueva carpeta ── */}
            {activeModal === "newFolder" && (
                <ModalShell title="Crear Nueva Carpeta" onClose={resetModal}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Nombre de la carpeta
                        </label>
                        <input
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="Ej: Tercer Año, Electivas..."
                            className="w-full px-4 py-3 bg-surface-container-lowest text-foreground rounded-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            style={{ border: "2px solid rgba(169, 180, 185, 0.15)" }}
                            autoFocus
                            onKeyDown={(e) => e.key === "Enter" && createFolder()}
                        />
                    </div>
                    <ModalActions
                        confirmLabel="Crear Carpeta"
                        onConfirm={createFolder}
                        onCancel={resetModal}
                        confirmDisabled={!newFolderName.trim()}
                    />
                </ModalShell>
            )}

            {/* ── Modal: Crear Materia ── */}
            {activeModal === "createSubject" && (
                <ModalShell title="Crear Nueva Materia" onClose={resetModal}>
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Nombre de la materia
                            </label>
                            <input
                                type="text"
                                value={subjectName}
                                onChange={(e) => setSubjectName(e.target.value)}
                                placeholder="Ej: Algoritmos y Estructuras de Datos"
                                className="w-full px-4 py-3 bg-surface-container-lowest text-foreground rounded-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                style={{ border: "2px solid rgba(169, 180, 185, 0.15)" }}
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Etiqueta
                            </label>
                            <p className="text-xs text-muted-foreground mb-2">
                                Identificador corto que se usará para el tablero en el foro.
                            </p>
                            <input
                                type="text"
                                value={subjectTag}
                                onChange={(e) => setSubjectTag(e.target.value)}
                                placeholder="Ej: AED, MATE1, SO..."
                                className="w-full px-4 py-3 bg-surface-container-lowest text-foreground rounded-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                style={{ border: "2px solid rgba(169, 180, 185, 0.15)" }}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Carpeta
                            </label>
                            {allFolderOptions.length === 0 ? (
                                <p className="text-sm text-muted-foreground px-4 py-3 rounded-sm" style={{ border: "2px solid rgba(169, 180, 185, 0.15)" }}>
                                    No hay carpetas disponibles. Creá una primero.
                                </p>
                            ) : (
                                <FolderSelector
                                    options={allFolderOptions}
                                    value={subjectFolder}
                                    onChange={setSubjectFolder}
                                    placeholder="Seleccionar carpeta..."
                                />
                            )}
                        </div>
                    </div>

                    <ModalActions
                        confirmLabel="Crear Materia"
                        onConfirm={createSubject}
                        onCancel={resetModal}
                        confirmDisabled={
                            !subjectName.trim() ||
                            !subjectTag.trim() ||
                            !subjectFolder ||
                            allFolderOptions.length === 0
                        }
                    />
                </ModalShell>
            )}

            {/* ── Modal: Cambiar nombre de carpeta ── */}
            {activeModal === "renameFolder" && (
                <ModalShell title="Cambiar Nombre de Carpeta" onClose={resetModal}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Nuevo nombre
                        </label>
                        <input
                            type="text"
                            value={renameFolderValue}
                            onChange={(e) => setRenameFolderValue(e.target.value)}
                            className="w-full px-4 py-3 bg-surface-container-lowest text-foreground rounded-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            style={{ border: "2px solid rgba(169, 180, 185, 0.15)" }}
                            autoFocus
                            onKeyDown={(e) => e.key === "Enter" && renameFolder()}
                        />
                    </div>
                    <ModalActions
                        confirmLabel="Guardar"
                        onConfirm={renameFolder}
                        onCancel={resetModal}
                        confirmDisabled={!renameFolderValue.trim()}
                    />
                </ModalShell>
            )}

            {/* ── Modal: Eliminar carpeta ── */}
            {activeModal === "deleteFolder" && (
                <ModalShell title="Eliminar Carpeta" onClose={resetModal}>
                    {targetFolderIsEmpty ? (
                        <>
                            <p className="text-foreground mb-6">
                                ¿Estás seguro de que querés eliminar la carpeta{" "}
                                <strong>"{targetFolder?.nombre}"</strong>? Esta acción no se puede deshacer.
                            </p>
                            <ModalActions
                                confirmLabel="Eliminar"
                                onConfirm={deleteFolder}
                                onCancel={resetModal}
                                danger
                            />
                        </>
                    ) : (
                        <>
                            <div
                                className="flex items-start gap-3 p-4 rounded-sm mb-6"
                                style={{
                                    background: "rgba(var(--destructive-rgb, 220 38 38) / 0.08)",
                                    border: "1px solid rgba(var(--destructive-rgb, 220 38 38) / 0.2)",
                                }}
                            >
                                <Trash2 className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-destructive mb-1">
                                        No se puede eliminar esta carpeta
                                    </p>
                                    <p className="text-sm text-foreground">
                                        La carpeta <strong>"{targetFolder?.nombre}"</strong> contiene elementos.
                                        Movelos o eliminá su contenido antes de continuar.
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={resetModal}
                                    className="px-4 py-2 bg-surface-container-high text-foreground rounded-sm hover:bg-surface-container transition-colors"
                                >
                                    Entendido
                                </button>
                            </div>
                        </>
                    )}
                </ModalShell>
            )}

            {/* ── Modal: Mover carpeta ── */}
            {activeModal === "moveFolder" && (
                <ModalShell title="Mover Carpeta" onClose={resetModal}>
                    <p className="text-sm text-muted-foreground mb-4">
                        Seleccioná el destino para{" "}
                        <strong className="text-foreground">"{targetFolder?.nombre}"</strong>.
                    </p>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Carpeta destino
                        </label>
                        <FolderSelector
                            options={moveFolderOptions}
                            value={moveFolderTarget}
                            onChange={setMoveFolderTarget}
                            placeholder="Seleccionar carpeta destino..."
                        />
                    </div>
                    <ModalActions
                        confirmLabel="Mover"
                        onConfirm={moveFolder}
                        onCancel={resetModal}
                        confirmDisabled={!moveFolderTarget}
                    />
                </ModalShell>
            )}

            {/* ── Modal: Mover materia ── */}
            {activeModal === "moveSubject" && (
                <ModalShell title="Mover Materia" onClose={resetModal}>
                    <p className="text-sm text-muted-foreground mb-4">
                        Seleccioná la carpeta de destino para esta materia.
                    </p>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Carpeta destino
                        </label>
                        <FolderSelector
                            options={allFolderOptions}
                            value={moveSubjectTarget}
                            onChange={setMoveSubjectTarget}
                            placeholder="Seleccionar carpeta destino..."
                        />
                    </div>
                    <ModalActions
                        confirmLabel="Mover"
                        onConfirm={moveSubject}
                        onCancel={resetModal}
                        confirmDisabled={!moveSubjectTarget}
                    />
                </ModalShell>
            )}
        </div>
    );
}