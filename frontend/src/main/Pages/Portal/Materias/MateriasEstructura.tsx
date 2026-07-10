import { useEffect, useState, useContext } from "react";
import { Link, useParams, useOutletContext } from "react-router";
import {
    BookOpen,
    ChevronDown,
    ChevronRight,
    Folder,
    FolderPlus,
    Plus,
    Pencil,
    Trash2,
    FolderSymlink,
    Loader2,
    MoveRight,
    UserPlus,
    Lock,
    FolderTree,
    AlertTriangle,
} from "lucide-react";
import { carpetaService } from "../../../services/Portal/CarpetaService";
import type { CarpetaArbol } from "../../../types/Portal/Carpeta";
import { materiaService } from "../../../services/Portal/MateriaService";
import { adminService } from "../../../services/AdminService";
import { MainContext } from "../../../types/MainContext";
import apiClient from "../../../services/apiClient";
import { Modal } from "../../../Components/common/Modal";
import { ContextMenu } from "../../../Components/common/ContextMenu";

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

interface VoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    title: string;
    description: string;
    loading?: boolean;
}


function VoteModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    loading,
}: VoteModalProps) {
    const [reason, setReason] = useState("");

    useEffect(() => {
        if (isOpen) setReason("");
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (reason.trim()) {
            onConfirm(reason);
        }
    };

    const handleClose = () => {
        setReason("");
        onClose();
    };

    return (
        <Modal onClose={handleClose} maxWidth="32rem">
            <div className="border-b border-border px-6 py-4">
                <h2
                    className="text-card-foreground text-lg font-semibold"
                    style={{ fontFamily: "Work Sans, sans-serif" }}
                >
                    {title}
                </h2>
            </div>
            <div className="p-6 space-y-4">
                <div
                    className="p-4 bg-primary/5 border border-primary/20"
                    style={{ borderRadius: "var(--radius)" }}
                >
                    <p className="text-sm text-foreground">{description}</p>
                </div>
                <div>
                    <label className="block mb-2 text-sm font-medium text-foreground">
                        Motivo de la propuesta{" "}
                        <span className="text-destructive">*</span>
                    </label>
                    <textarea
                        rows={4}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        disabled={loading}
                        className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none disabled:opacity-50 transition-shadow"
                        style={{ borderRadius: "var(--radius)" }}
                        placeholder="Explica por qué propones este cambio. Todos los administradores verán este mensaje."
                    />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="px-5 py-2.5 border border-border hover:bg-accent transition-colors disabled:opacity-50"
                        style={{ borderRadius: "var(--radius)" }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!reason.trim() || loading}
                        className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 portal-hoverable"
                        style={{ borderRadius: "var(--radius)" }}
                    >
                        {loading && (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                        Abrir Votación
                    </button>
                </div>
            </div>
        </Modal>
    );
}

function AccesoDenegado({ portalId }: { portalId: string | undefined }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <div className="max-w-md">
                <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-8 h-8 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground mb-3">
                    Portal privado
                </h2>
                <p className="text-on-surface-variant mb-8">
                    Este portal es privado. Solo sus miembros pueden acceder a
                    esta sección. Si querés ver el contenido, enviá una
                    solicitud para unirte.
                </p>
                <Link
                    to={`/portal/${portalId}/solicitud`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors portal-hoverable"
                    style={{ borderRadius: "var(--radius)", boxShadow: "var(--portal-shadow-card)" }}
                >
                    <UserPlus className="w-5 h-5" />
                    Enviar Solicitud
                </Link>
            </div>
        </div>
    );
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

// ─── Selector de carpeta (usado en modales de mover/crear) ────────────────────
interface FolderSelectorProps {
    options: FolderOption[];
    value: string | null;
    onChange: (id: string) => void;
    placeholder?: string;
}

function FolderSelector({
    options,
    value,
    onChange,
    placeholder,
}: FolderSelectorProps) {
    return (
        <select
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 bg-surface-container-lowest text-foreground rounded-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none transition-shadow"
            style={{ border: "1px solid var(--border)" }}
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
        <Modal onClose={onClose} maxWidth="28rem" className="p-6">
            <h3
                className="text-xl font-semibold text-foreground mb-4"
                style={{ fontFamily: "Work Sans, sans-serif" }}
            >
                {title}
            </h3>
            {children}
        </Modal>
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

function ModalActions({
    confirmLabel,
    onConfirm,
    onCancel,
    confirmDisabled,
    danger,
}: ModalActionsProps) {
    return (
        <div className="flex gap-3">
            <button
                onClick={onConfirm}
                disabled={confirmDisabled}
                className="flex-1 px-4 py-2 rounded-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed portal-hoverable"
                style={
                    danger
                        ? {
                                background: "var(--destructive)",
                                color: "var(--destructive-foreground)",
                        }
                        : {
                                background: "var(--primary)",
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
    const { isAdmin, isMember, isOpen } = useOutletContext<{
        isAdmin: boolean;
        isMember: boolean;
        isOpen: boolean;
    }>();

    const [voteModalOpen, setVoteModalOpen] = useState(false);
    const [voteLoading, setVoteLoading] = useState(false);

    const [folderStructure, setFolderStructure] = useState<CarpetaArbol[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => {
        const saved = localStorage.getItem(`expandedFolders-${portalId}`);
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });

    // ── Estado del modal activo ─────────────────────────────────────────────────
    const [activeModal, setActiveModal] = useState<ModalType>(null);

    // Datos compartidos para los distintos modales
    const [targetFolderId, setTargetFolderId] = useState<string | null>(null); // carpeta sobre la que se actúa
    const [targetSubjectId, setTargetSubjectId] = useState<string | null>(null); // materia sobre la que se actúa

    // ── Campos de formulario ────────────────────────────────────────────────────
    const [newFolderName, setNewFolderName] = useState("");
    const [selectedParentFolder, setSelectedParentFolder] = useState<
        string | null
    >(null);

    const [subjectName, setSubjectName] = useState("");
    const [subjectTag, setSubjectTag] = useState("");
    const [subjectFolder, setSubjectFolder] = useState<string | null>(null);

    const [renameFolderValue, setRenameFolderValue] = useState("");
    const [moveFolderTarget, setMoveFolderTarget] = useState<string | null>(
        null,
    );
    const [moveSubjectTarget, setMoveSubjectTarget] = useState<string | null>(
        null,
    );

    const { showToast } = useContext(MainContext);

    useEffect(() => {
        localStorage.setItem(
            `expandedFolders-${portalId}`,
            JSON.stringify([...expandedFolders]),
        );
    }, [expandedFolders, portalId]);

    const openDeleteSubjectVote = (subjectId: string) => { 
        setTargetSubjectId(subjectId); 
        setVoteModalOpen(true); 
    };

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
    const findFolder = (
        id: string,
        items: CarpetaArbol[],
    ): CarpetaArbol | null => {
        for (const item of items) {
            if (item.id === id) return item;
            const found = findFolder(id, item.subcarpetas ?? []);
            if (found) return found;
        }
        return null;
    };

    const targetFolder = targetFolderId
        ? findFolder(targetFolderId, folderStructure)
        : null;

    // ── Acciones de carpeta ─────────────────────────────────────────────────────
    const openNewFolderModal = (parentId: string | null) => {
        setSelectedParentFolder(parentId);
        setActiveModal("newFolder");
    };

    const refrescarEstructura = () => {
        carpetaService
            .getEstructura(Number(portalId))
            .then((data) => setFolderStructure(data.carpetas));
    };

    const createFolder = async () => {
        if (!newFolderName.trim()) return;
        await carpetaService.crear(
            Number(portalId),
            newFolderName.trim(),
            selectedParentFolder,
        );
        refrescarEstructura();
        resetModal();
    };

    const renameFolder = async () => {
        if (!renameFolderValue.trim() || !targetFolderId) return;
        await carpetaService.renombrar(
            Number(portalId),
            targetFolderId,
            renameFolderValue.trim(),
        );
        refrescarEstructura();
        resetModal();
    };

    const deleteFolder = async () => {
        if (!targetFolderId) return;
        await carpetaService.eliminar(targetFolderId);
        refrescarEstructura();
        resetModal();
    };

    const moveFolder = async () => {
        if (!targetFolderId) return;
        await carpetaService.mover(targetFolderId, moveFolderTarget); // null = mover a raíz
        refrescarEstructura();
        resetModal();
    };

    // ── Acciones de materia ─────────────────────────────────────────────────────
    const createSubject = async () => {
        if (!subjectName.trim() || !subjectTag.trim() || !subjectFolder) return;
        await apiClient.post(`/carpetas/${subjectFolder}/materias`, {
            nombre: subjectName.trim(),
            etiqueta: subjectTag.trim(),
        });
        refrescarEstructura();
        resetModal();
    };

    const deleteSubject = async (motivo: string) => { 
        if (!targetSubjectId) return; 
        try { 
            setVoteLoading(true); 
            await adminService.crearVotacion(
                Number(portalId), 
                { 
                    tipo: "ELIMINAR_MATERIA", 
                    motivo, entidadId: 
                    targetSubjectId, 
                }
            ); 
            showToast( "Votación creada correctamente. Los administradores serán notificados.", "success" ); 
            refrescarEstructura(); 
            setVoteModalOpen(false); 
            resetModal(); 
        } catch (error: any) { 
            showToast( error.response?.data?.message || "No se pudo generar la votación", "error" ); 
        } finally { setVoteLoading(false); } 
    };

    const moveSubject = async () => {
        if (!targetSubjectId || !moveSubjectTarget) return;
        await materiaService.mover(targetSubjectId, moveSubjectTarget);
        refrescarEstructura();
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
            <div key={item.id} className="border-b border-border last:border-b-0">
                <div
                    className="flex items-center gap-2 px-4 py-3 hover:bg-surface-container-low transition-colors group"
                    style={{ paddingLeft: `${paddingLeft + 16}px` }}
                >
                    <button
                        onClick={() => toggleFolder(item.id)}
                        className="flex items-center gap-2 flex-1 text-left min-w-0"
                    >
                        {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform" />
                        ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform" />
                        )}
                        <Folder className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="font-medium text-foreground truncate">
                            {item.nombre}
                        </span>
                    </button>

                    {isAdmin && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            <button
                                onClick={() => openNewFolderModal(item.id)}
                                className="p-1.5 hover:bg-surface-container rounded-sm text-muted-foreground hover:text-foreground transition-colors"
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
                        {item.subcarpetas?.map((sub) =>
                            renderFolder(sub, depth + 1),
                        )}
                        {item.materias?.map((materia) => (
                            <div
                                key={materia.id}
                                className="flex items-center hover:bg-surface-container-low transition-colors group"
                                style={{ paddingLeft: `${paddingLeft + 40}px` }}
                            >
                                <Link
                                    to={`/portal/${portalId}/materias/${materia.id}`}
                                    className="flex items-center gap-3 px-4 py-3 flex-1 min-w-0"
                                >
                                    <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <BookOpen className="w-4 h-4 text-primary" />
                                    </div>
                                    <span className="text-foreground group-hover:text-primary transition-colors truncate">
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
                                                {
                                                    label: "Eliminar materia",
                                                    icon: <Trash2 className="w-4 h-4" />,
                                                    danger: true,
                                                    onClick: () => {openDeleteSubjectVote(materia.id)},
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
    const moveFolderOptions = flattenFolders(
        folderStructure,
        0,
        targetFolderId ?? undefined,
    );

    // ── Early returns ───────────────────────────────────────────────────────────
    if (loading)
        return (
            <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Cargando estructura...
            </div>
        );

    if (!isMember && !isAdmin && !isOpen) {
        return <AccesoDenegado portalId={portalId} />;
    }

    const targetFolderIsEmpty =
        targetFolder &&
        (targetFolder.subcarpetas?.length ?? 0) === 0 &&
        (targetFolder.materias?.length ?? 0) === 0;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
            {/* ── Header ── */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-5 portal-fade-up">
                <div className="flex items-start gap-4">
                    <div
                        className="hidden sm:flex w-12 h-12 items-center justify-center flex-shrink-0"
                        style={{
                            borderRadius: "var(--radius-sm)",
                            background: "var(--primary)",
                            color: "var(--primary-foreground)",
                        }}
                    >
                        <FolderTree className="w-6 h-6" />
                    </div>
                    <div>
                        <h1
                            className="text-2xl sm:text-3xl mb-2 text-foreground font-semibold"
                            style={{ fontFamily: "Work Sans, sans-serif" }}
                        >
                            Materias de la Carrera
                        </h1>
                        <p className="text-muted-foreground">
                            Explora las materias organizadas en carpetas
                            personalizadas
                        </p>
                    </div>
                </div>

                {isAdmin && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            onClick={() => setActiveModal("createSubject")}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-sm transition-all portal-hoverable"
                            style={{
                                background: "var(--primary)",
                                color: "var(--primary-foreground)",
                            }}
                        >
                            <Plus className="w-4 h-4" />
                            Crear Materia
                        </button>
                        <button
                            onClick={() => openNewFolderModal(null)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-surface-container-high text-foreground hover:bg-surface-container transition-all portal-hoverable"
                        >
                            <FolderPlus className="w-4 h-4" />
                            Nueva Carpeta
                        </button>
                    </div>
                )}
            </div>

            {/* ── Árbol ── */}
            <div
                className="bg-card rounded-lg border border-border overflow-hidden portal-fade-up-delay"
                style={{ boxShadow: "var(--portal-shadow-card)" }}
            >
                {folderStructure.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                        <FolderTree className="w-8 h-8 opacity-60" />
                        <span>Todavía no hay carpetas ni materias creadas.</span>
                    </div>
                ) : (
                    folderStructure.map((item) => renderFolder(item))
                )}
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
                            className="w-full px-4 py-3 bg-surface-container-lowest text-foreground rounded-sm focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                            style={{
                                border: "1px solid var(--border)",
                            }}
                            autoFocus
                            onKeyDown={(e) =>
                                e.key === "Enter" && createFolder()
                            }
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
                                style={{
                                    border: "1px solid var(--border)",
                                }}
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Etiqueta
                            </label>
                            <p className="text-xs text-muted-foreground mb-2">
                                Identificador corto que se usará para el tablero
                                en el foro.
                            </p>
                            <input
                                type="text"
                                value={subjectTag}
                                onChange={(e) => setSubjectTag(e.target.value)}
                                placeholder="Ej: AED, MATE1, SO..."
                                className="w-full px-4 py-3 bg-surface-container-lowest text-foreground rounded-sm focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                                style={{
                                    border: "1px solid var(--border)",
                                }}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Carpeta
                            </label>
                            {allFolderOptions.length === 0 ? (
                                <p
                                    className="text-sm text-muted-foreground px-4 py-3 rounded-sm"
                                    style={{
                                        border: "1px dashed var(--border)",
                                    }}
                                >
                                    No hay carpetas disponibles. Creá una
                                    primero.
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
                <ModalShell
                    title="Cambiar Nombre de Carpeta"
                    onClose={resetModal}
                >
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Nuevo nombre
                        </label>
                        <input
                            type="text"
                            value={renameFolderValue}
                            onChange={(e) =>
                                setRenameFolderValue(e.target.value)
                            }
                            className="w-full px-4 py-3 bg-surface-container-lowest text-foreground rounded-sm focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                            style={{
                                border: "1px solid var(--border)",
                            }}
                            autoFocus
                            onKeyDown={(e) =>
                                e.key === "Enter" && renameFolder()
                            }
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
                                <strong>"{targetFolder?.nombre}"</strong>? Esta
                                acción no se puede deshacer.
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
                                className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 mb-6"
                                style={{ borderRadius: "var(--radius-sm)" }}
                            >
                                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-destructive mb-1">
                                        No se puede eliminar esta carpeta
                                    </p>
                                    <p className="text-sm text-foreground">
                                        La carpeta{" "}
                                        <strong>
                                            "{targetFolder?.nombre}"
                                        </strong>{" "}
                                        contiene elementos. Movelos o eliminá su
                                        contenido antes de continuar.
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
                        <strong className="text-foreground">
                            "{targetFolder?.nombre}"
                        </strong>
                        .
                    </p>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Carpeta destino
                        </label>
                        <div className="mb-3">
                            <button
                                type="button"
                                onClick={() => setMoveFolderTarget(null)}
                                className={`w-full flex items-center gap-2 text-left px-4 py-2 rounded-sm text-sm transition-colors ${
                                    moveFolderTarget === null
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "hover:bg-surface-container-low text-foreground"
                                }`}
                                style={{
                                    border: "1px solid var(--border)",
                                }}
                            >
                                <Folder className="w-4 h-4 flex-shrink-0" />
                                Raíz (sin carpeta padre)
                            </button>
                        </div>
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
                        confirmDisabled={false}
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
            <VoteModal 
                isOpen={voteModalOpen} 
                loading={voteLoading} 
                title="Proponer Eliminar Materia" 
                description=" 
                Estás proponiendo eliminar esta materia. 
                Esta acción requiere votación de todos los administradores." 
                onClose={() => { 
                    setVoteModalOpen(false); 
                    setTargetSubjectId(null); 
                    }} 
                onConfirm={deleteSubject} 
            />
        </div>
    );
}
