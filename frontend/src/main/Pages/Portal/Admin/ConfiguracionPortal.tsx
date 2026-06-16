import { useState, useEffect } from "react";
import {
    Settings,
    Lock,
    Upload,
    Palette,
    AlertTriangle,
    Archive,
    Loader2,
    Search,
    Check,
    GraduationCap,
    BookOpen,
    Code,
    Briefcase,
    FlaskConical,
    Calculator,
    Languages,
    Network,
    BarChart2,
    Rocket,
    Cpu,
    Terminal,
    type LucideIcon,
} from "lucide-react";
import { adminService } from "../../../services/AdminService";
import { usePortalContext } from "../../../hooks/usePortalContext";
import type { TipoAcceso } from "../../../types/Portal/Portal";
import type {
    PlantillaSolicitudResponse,
    CrearVotacionRequest,
} from "../../../types/Admin/Admin";
import { useToast } from "../../../hooks/useToast";
import { Toast } from "../../../Components/common/Toast";
import apiClient from "../../../services/apiClient";

// ─── Opciones de icono y color ────────────────────────────────────────────────

const ICONOS_DISPONIBLES: { value: string; label: string; Icon: LucideIcon }[] =
    [
        { value: "GraduationCap", label: "Birrete", Icon: GraduationCap },
        { value: "BookOpen", label: "Libro", Icon: BookOpen },
        { value: "Code", label: "Código", Icon: Code },
        { value: "Briefcase", label: "Maletín", Icon: Briefcase },
        { value: "FlaskConical", label: "Laboratorio", Icon: FlaskConical },
        { value: "Calculator", label: "Calculadora", Icon: Calculator },
        { value: "Languages", label: "Idiomas", Icon: Languages },
        { value: "Network", label: "Redes", Icon: Network },
        { value: "BarChart2", label: "Datos", Icon: BarChart2 },
        { value: "Rocket", label: "Cohete", Icon: Rocket },
        { value: "Cpu", label: "CPU", Icon: Cpu },
        { value: "Terminal", label: "Terminal", Icon: Terminal },
    ];

// ─── Modales ──────────────────────────────────────────────────────────────────

interface VoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    title: string;
    description: string;
    loading?: boolean;
}

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    loading?: boolean;
}

function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    loading,
}: ConfirmModalProps) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
                className="bg-card max-w-lg w-full shadow-2xl"
                style={{ borderRadius: "var(--radius)" }}
            >
                <div className="border-b border-border px-6 py-4">
                    <h2 className="text-card-foreground">{title}</h2>
                </div>
                <div className="p-6">
                    <p className="text-foreground mb-6">{message}</p>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="px-5 py-2.5 border border-border hover:bg-accent transition-colors disabled:opacity-50"
                            style={{ borderRadius: "var(--radius)" }}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                            }}
                            disabled={loading}
                            className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors flex items-center gap-2 disabled:opacity-50"
                            style={{ borderRadius: "var(--radius)" }}
                        >
                            {loading && (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            )}
                            Confirmar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
                className="bg-card max-w-lg w-full shadow-2xl"
                style={{ borderRadius: "var(--radius)" }}
            >
                <div className="border-b border-border px-6 py-4">
                    <h2 className="text-card-foreground">{title}</h2>
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
                            className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none disabled:opacity-50"
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
                            className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            style={{ borderRadius: "var(--radius)" }}
                        >
                            {loading && (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            )}
                            Abrir Votación
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function PortalConfig() {
    const { portal, portalId, isArchived } = usePortalContext();

    // ── isPortalOpen: derivado directo del contexto, nunca en useState ────────
    // Razón: portal llega null en el primer render (fetch asíncrono).
    // Si lo metés en useState, se inicializa como false y nunca se actualiza.
    // Al derivarlo acá se recalcula en cada render, siempre fresco.
    const isPortalOpen = portal?.tipoAcceso === "ABIERTO";

    // ── Estado de identidad ───────────────────────────────────────────────────
    // Sí necesita ser estado local porque el usuario edita estos campos.
    // Se inicializa vacío y se sincroniza con useEffect cuando portal llega.
    const [identityData, setIdentityData] = useState({
        universityName: "",
        careerName: "",
        academicUnit: "",
        description: "",
    });

    useEffect(() => {
        if (!portal) return;
        setIdentityData({
            universityName: portal.universidad ?? "",
            careerName: portal.carrera ?? "",
            academicUnit: portal.unidadAcademica ?? "",
            description: portal.descripcion ?? "",
        });
    }, [portal]);

    // ── Estado visual ─────────────────────────────────────────────────────────
    // Mismo caso: estado local editable, sincronizado cuando portal llega.
    const [modoVisual, setModoVisual] = useState<"icono" | "imagen">("icono");
    const [iconoSeleccionado, setIconoSeleccionado] = useState("GraduationCap");
    const [colorSeleccionado, setColorSeleccionado] = useState("#2563EB");
    const [busquedaIcono, setBusquedaIcono] = useState("");
    const [customImage, setCustomImage] = useState<string | null>(null);

    useEffect(() => {
        if (!portal) return;
        setModoVisual(portal.logoUrl ? "imagen" : "icono");
        setIconoSeleccionado(portal.iconoPortal ?? "GraduationCap");
        setColorSeleccionado(portal.colorPortal ?? "#2563EB");
        setCustomImage(portal.logoUrl ?? null);
    }, [portal]);

    const iconosFiltrados = ICONOS_DISPONIBLES.filter((i) =>
        i.label.toLowerCase().includes(busquedaIcono.toLowerCase()),
    );

    // ── Estado de acceso ──────────────────────────────────────────────────────
    // areRequestsOpen y joinRequirements vienen del back (PlantillaSolicitud).
    // isPortalOpen ya NO vive acá — ver derivación arriba.
    const [accessData, setAccessData] = useState({
        areRequestsOpen: true,
        joinRequirements: "",
    });

    // Loading states granulares
    const [loadingPlantilla, setLoadingPlantilla] = useState(true);
    const [loadingDescription, setLoadingDescription] = useState(false);
    const [loadingVisual, setLoadingVisual] = useState(false);
    const [loadingRequirements, setLoadingRequirements] = useState(false);
    const [loadingToggleRequest, setLoadingToggleRequest] = useState(false);
    const [loadingVote, setLoadingVote] = useState(false);

    const { toast, showToast } = useToast();

    // Modales
    const [voteModal, setVoteModal] = useState<{
        isOpen: boolean;
        type: "university" | "career" | "portalAccess" | "archive" | "activate";
        title: string;
        description: string;
    }>({ isOpen: false, type: "university", title: "", description: "" });

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

    // ── Carga inicial: plantilla de solicitud ─────────────────────────────────

    useEffect(() => {
        if (!portalId) return;
        adminService
            .getPlantilla(portalId)
            .then((plantilla: PlantillaSolicitudResponse) => {
                setAccessData({
                    areRequestsOpen: plantilla.abierta,
                    joinRequirements: plantilla.requisitos ?? "",
                });
            })
            .catch(() =>
                setError("No se pudo cargar la configuración de solicitudes."),
            )
            .finally(() => setLoadingPlantilla(false));
    }, [portalId]);

    // ── Helpers ───────────────────────────────────────────────────────────────

    const showSuccess = (msg: string) => showToast(msg, "success");
    const setError = (msg: string | null) => {
        if (msg) showToast(msg, "error");
    };

    const closeVoteModal = () =>
        setVoteModal((prev) => ({ ...prev, isOpen: false }));
    const closeConfirmModal = () =>
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));

    // ── Acciones de identidad ─────────────────────────────────────────────────

    const handleProposeUniversityChange = () => {
        setVoteModal({
            isOpen: true,
            type: "university",
            title: "Proponer Cambio de Universidad",
            description: `Estás proponiendo cambiar el nombre de la universidad a "${identityData.universityName}". Esta acción requiere votación de todos los administradores.`,
        });
    };

    const handleProposeCareerChange = () => {
        setVoteModal({
            isOpen: true,
            type: "career",
            title: "Proponer Cambio de Carrera",
            description: `Estás proponiendo cambiar el nombre de la carrera a "${identityData.careerName}". Esta acción requiere votación de todos los administradores.`,
        });
    };

    const handleSaveDescription = () => {
        setConfirmModal({
            isOpen: true,
            title: "Guardar Descripción",
            message:
                "¿Estás seguro de que deseas actualizar la descripción del portal? Este cambio será visible para todos los usuarios.",
            onConfirm: async () => {
                setLoadingDescription(true);
                closeConfirmModal();
                try {
                    await adminService.actualizarPortal(portalId, {
                        descripcion: identityData.description || null,
                        unidadAcademica: identityData.academicUnit || null,
                        iconoPortal: portal?.iconoPortal ?? null, // preservar
                        colorPortal: portal?.colorPortal ?? null, // preservar
                        logoUrl: portal?.logoUrl ?? null, // preservar
                    });
                    showSuccess("Descripción actualizada correctamente.");
                } catch {
                    setError("No se pudo actualizar la descripción.");
                } finally {
                    setLoadingDescription(false);
                }
            },
        });
    };

    // ── Acciones de identidad visual ──────────────────────────────────────────

    const handleSaveVisualIdentity = () => {
        setConfirmModal({
            isOpen: true,
            title: "Guardar Identidad Visual",
            message:
                "¿Estás seguro de que deseas actualizar la identidad visual del portal? Este cambio afectará cómo se ve la tarjeta del portal en la página de exploración.",
            onConfirm: async () => {
                setLoadingVisual(true);
                closeConfirmModal();
                try {
                    await adminService.actualizarPortal(portalId, {
                        iconoPortal:
                            modoVisual === "icono" ? iconoSeleccionado : null,
                        colorPortal:
                            modoVisual === "icono" ? colorSeleccionado : null,
                        logoUrl:
                            modoVisual === "imagen"
                                ? (customImage ?? null)
                                : null,
                    });
                    showSuccess("Identidad visual actualizada correctamente.");
                } catch {
                    setError("No se pudo actualizar la identidad visual.");
                } finally {
                    setLoadingVisual(false);
                }
            },
        });
    };

    const handleImageUpload = async (file: File) => {
        if (!file.type.startsWith("image/")) return;
        setLoadingVisual(true);
        try {
            const formData = new FormData();
            formData.append("imagen", file);
            const res = await apiClient.patch(
                `/portales/${portalId}/imagen`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                },
            );
            setCustomImage(res.data.logoUrl); // URL de Cloudinary
            setModoVisual("imagen");
        } catch {
            setError("No se pudo subir la imagen.");
        } finally {
            setLoadingVisual(false);
        }
    };

    // ── Acciones de acceso ────────────────────────────────────────────────────

    const handleProposePortalAccessChange = () => {
        setVoteModal({
            isOpen: true,
            type: "portalAccess",
            title: "Proponer Cambio de Acceso al Portal",
            description: `Estás proponiendo cambiar el portal a modo ${isPortalOpen ? "Cerrado" : "Abierto"}. Esta acción requiere votación de todos los administradores.`,
        });
    };

    const handleToggleRequests = () => {
        const newState = !accessData.areRequestsOpen;
        setConfirmModal({
            isOpen: true,
            title: newState ? "Abrir Solicitudes" : "Cerrar Solicitudes",
            message: newState
                ? "¿Estás seguro de que deseas abrir las solicitudes de membresía? Los usuarios podrán enviar solicitudes para unirse al portal."
                : "¿Estás seguro de que deseas cerrar las solicitudes de membresía? Los usuarios no podrán enviar nuevas solicitudes hasta que las vuelvas a abrir.",
            onConfirm: async () => {
                setLoadingToggleRequest(true);
                closeConfirmModal();
                try {
                    const updated = await adminService.actualizarPlantilla(
                        portalId,
                        { abierta: newState },
                    );
                    setAccessData((prev) => ({
                        ...prev,
                        areRequestsOpen: updated.abierta,
                    }));
                    showSuccess(
                        newState
                            ? "Solicitudes abiertas."
                            : "Solicitudes cerradas.",
                    );
                } catch {
                    setError(
                        "No se pudo actualizar el estado de las solicitudes.",
                    );
                } finally {
                    setLoadingToggleRequest(false);
                }
            },
        });
    };

    const handleSaveRequirements = () => {
        setConfirmModal({
            isOpen: true,
            title: "Guardar Requisitos",
            message:
                "¿Estás seguro de que deseas actualizar los requisitos para unirse? Este mensaje será visible para todos los usuarios que intenten enviar una solicitud.",
            onConfirm: async () => {
                setLoadingRequirements(true);
                closeConfirmModal();
                try {
                    await adminService.actualizarPlantilla(portalId, {
                        requisitos: accessData.joinRequirements || null,
                    });
                    showSuccess("Requisitos actualizados correctamente.");
                } catch {
                    setError("No se pudo actualizar los requisitos.");
                } finally {
                    setLoadingRequirements(false);
                }
            },
        });
    };

    // ── Zona peligrosa ────────────────────────────────────────────────────────

    const handleProposeArchive = () => {
        setVoteModal({
            isOpen: true,
            type: "archive",
            title: "Proponer Archivar Portal",
            description:
                "Estás proponiendo archivar este portal. El portal será ocultado pero no eliminado permanentemente. Esta acción requiere votación de todos los administradores.",
        });
    };

    const handleProposeActivate = () => {
        setVoteModal({
            isOpen: true,
            type: "activate",
            title: "Proponer Activar Portal",
            description:
                "Estás proponiendo activar este portal. El portal volverá a ser visible para todos los miembros. Esta acción requiere votación de todos los administradores.",
        });
    };

    // ── Confirmar votación ────────────────────────────────────────────────────

    const handleConfirmVote = async (reason: string) => {
        setLoadingVote(true);

        const tipoMap: Record<
            typeof voteModal.type,
            CrearVotacionRequest["tipo"]
        > = {
            university: "CAMBIO_UNIVERSIDAD",
            career: "CAMBIO_CARRERA",
            portalAccess: "CAMBIO_TIPO_ACCESO",
            archive: "ARCHIVAR_PORTAL",
            activate: "ACTIVAR_PORTAL",
        };

        let metadatos: string | null = null;
        if (voteModal.type === "university") {
            metadatos = JSON.stringify({
                nuevoValor: identityData.universityName,
            });
        } else if (voteModal.type === "career") {
            metadatos = JSON.stringify({ nuevoValor: identityData.careerName });
        } else if (voteModal.type === "portalAccess") {
            const nuevoTipo: TipoAcceso = isPortalOpen ? "CERRADO" : "ABIERTO";
            metadatos = JSON.stringify({ nuevoTipoAcceso: nuevoTipo });
        }

        try {
            await adminService.crearVotacion(portalId, {
                tipo: tipoMap[voteModal.type],
                motivo: reason,
                metadatos: metadatos,
            });
            closeVoteModal();
            showSuccess(
                "Votación abierta correctamente. Los administradores serán notificados.",
            );
        } catch (err: unknown) {
            const axiosErr = err as {
                response?: { data?: { message?: string } };
            };
            const msg =
                axiosErr?.response?.data?.message ??
                "No se pudo abrir la votación.";
            setError(msg);
        } finally {
            setLoadingVote(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────

    if (loadingPlantilla) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
                <h1 className="text-foreground mb-2">
                    Configuración del Portal
                </h1>
                <p className="text-on-surface-variant">
                    Administra la identidad, acceso y configuración general del
                    portal
                </p>
            </div>

            {/* Feedback global */}

            <div className="space-y-6">
                {/* ── Identidad del Portal ── */}
                <section
                    className="bg-surface-container-lowest p-6 shadow-sm"
                    style={{ borderRadius: "var(--radius)" }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div
                            className="p-2 bg-primary/10"
                            style={{ borderRadius: "var(--radius)" }}
                        >
                            <Settings className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-foreground">
                            Identidad del Portal
                        </h2>
                    </div>

                    <div className="space-y-5">
                        {/* Universidad */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-foreground">
                                Universidad
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={identityData.universityName}
                                    onChange={(e) =>
                                        setIdentityData({
                                            ...identityData,
                                            universityName: e.target.value,
                                        })
                                    }
                                    className="flex-1 px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                    style={{ borderRadius: "var(--radius)" }}
                                />
                                <button
                                    onClick={handleProposeUniversityChange}
                                    className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors shadow-sm whitespace-nowrap"
                                    style={{ borderRadius: "var(--radius)" }}
                                >
                                    Proponer Cambio
                                </button>
                            </div>
                            <p className="text-xs text-on-surface-variant mt-1.5 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Cambiar el nombre de la universidad requiere
                                votación de todos los administradores
                            </p>
                        </div>

                        {/* Carrera */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-foreground">
                                Carrera
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={identityData.careerName}
                                    onChange={(e) =>
                                        setIdentityData({
                                            ...identityData,
                                            careerName: e.target.value,
                                        })
                                    }
                                    className="flex-1 px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                    style={{ borderRadius: "var(--radius)" }}
                                />
                                <button
                                    onClick={handleProposeCareerChange}
                                    className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors shadow-sm whitespace-nowrap"
                                    style={{ borderRadius: "var(--radius)" }}
                                >
                                    Proponer Cambio
                                </button>
                            </div>
                            <p className="text-xs text-on-surface-variant mt-1.5 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Cambiar el nombre de la carrera requiere
                                votación de todos los administradores
                            </p>
                        </div>

                        {/* Unidad Académica */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-foreground">
                                Unidad Académica (opcional)
                            </label>
                            <input
                                type="text"
                                value={identityData.academicUnit}
                                onChange={(e) =>
                                    setIdentityData({
                                        ...identityData,
                                        academicUnit: e.target.value,
                                    })
                                }
                                className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                style={{ borderRadius: "var(--radius)" }}
                                placeholder="Ej: Facultad de Ingeniería"
                            />
                        </div>

                        {/* Descripción */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-foreground">
                                Descripción Corta
                            </label>
                            <textarea
                                rows={3}
                                value={identityData.description}
                                onChange={(e) =>
                                    setIdentityData({
                                        ...identityData,
                                        description: e.target.value,
                                    })
                                }
                                className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                                style={{ borderRadius: "var(--radius)" }}
                                placeholder="Descripción que aparece en las tarjetas de búsqueda"
                            />
                            <p className="text-xs text-on-surface-variant mt-1.5">
                                Se muestra en los resultados de búsqueda y la
                                página de exploración
                            </p>
                        </div>

                        <button
                            onClick={handleSaveDescription}
                            disabled={loadingDescription}
                            className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                            style={{ borderRadius: "var(--radius)" }}
                        >
                            {loadingDescription && (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            )}
                            Guardar Cambios
                        </button>
                    </div>
                </section>

                {/* ── Identidad Visual ── */}

                <section
                    className="bg-surface-container-lowest p-6 shadow-sm"
                    style={{ borderRadius: "var(--radius)" }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div
                            className="p-2 bg-primary/10"
                            style={{ borderRadius: "var(--radius)" }}
                        >
                            <Palette className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-foreground">Identidad Visual</h2>
                    </div>

                    <div className="space-y-5">
                        {/* Selector de modo */}
                        <div
                            className="grid grid-cols-2 gap-2 p-1"
                            style={{
                                background: "rgba(169, 180, 185, 0.1)",
                                borderRadius: "var(--radius)",
                            }}
                        >
                            <button
                                onClick={() => setModoVisual("icono")}
                                className={`py-2 px-4 text-sm font-medium transition-all ${
                                    modoVisual === "icono"
                                        ? "bg-surface-container-lowest text-foreground shadow-sm"
                                        : "text-on-surface-variant hover:text-foreground"
                                }`}
                                style={{ borderRadius: "var(--radius)" }}
                            >
                                Ícono + color
                            </button>
                            <button
                                onClick={() => setModoVisual("imagen")}
                                className={`py-2 px-4 text-sm font-medium transition-all ${
                                    modoVisual === "imagen"
                                        ? "bg-surface-container-lowest text-foreground shadow-sm"
                                        : "text-on-surface-variant hover:text-foreground"
                                }`}
                                style={{ borderRadius: "var(--radius)" }}
                            >
                                Subir imagen
                            </button>
                        </div>

                        {/* Panel ícono + color */}
                        {modoVisual === "icono" && (
                            <div className="space-y-4">
                                {/* Buscador */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Ícono
                                    </label>
                                    <div className="relative mb-3">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                                        <input
                                            type="text"
                                            placeholder="Buscar ícono..."
                                            value={busquedaIcono}
                                            onChange={(e) =>
                                                setBusquedaIcono(e.target.value)
                                            }
                                            className="w-full pl-9 pr-4 py-2 text-sm bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                            style={{
                                                borderRadius: "var(--radius)",
                                                border: "2px solid rgba(169, 180, 185, 0.15)",
                                            }}
                                        />
                                    </div>
                                    <div className="grid grid-cols-6 gap-2">
                                        {iconosFiltrados.map(
                                            ({ value, label, Icon }) => (
                                                <button
                                                    key={value}
                                                    onClick={() =>
                                                        setIconoSeleccionado(
                                                            value,
                                                        )
                                                    }
                                                    title={label}
                                                    className={`relative flex flex-col items-center gap-1 p-3 transition-all ${
                                                        iconoSeleccionado ===
                                                        value
                                                            ? "ring-2 ring-primary bg-primary/10"
                                                            : "hover:bg-surface-container-low"
                                                    }`}
                                                    style={{
                                                        borderRadius:
                                                            "var(--radius)",
                                                    }}
                                                >
                                                    <Icon className="w-5 h-5 text-foreground" />
                                                    <span className="text-xs text-on-surface-variant truncate w-full text-center">
                                                        {label}
                                                    </span>
                                                    {iconoSeleccionado ===
                                                        value && (
                                                        <div className="absolute top-1 right-1">
                                                            <Check className="w-3 h-3 text-primary" />
                                                        </div>
                                                    )}
                                                </button>
                                            ),
                                        )}
                                        {iconosFiltrados.length === 0 && (
                                            <p className="col-span-6 text-sm text-on-surface-variant text-center py-4">
                                                No hay íconos que coincidan.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Color picker libre */}

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-3">
                                        Color de fondo
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <label
                                            className="relative w-14 h-14 cursor-pointer group flex-shrink-0"
                                            style={{
                                                borderRadius: "var(--radius)",
                                            }}
                                        >
                                            <input
                                                type="color"
                                                value={colorSeleccionado}
                                                onChange={(e) =>
                                                    setColorSeleccionado(
                                                        e.target.value,
                                                    )
                                                }
                                                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                            />
                                            <div
                                                className="w-full h-full shadow-md ring-2 ring-white/20 group-hover:ring-primary/50 transition-all"
                                                style={{
                                                    backgroundColor:
                                                        colorSeleccionado,
                                                    borderRadius:
                                                        "var(--radius)",
                                                }}
                                            />
                                            <div
                                                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20"
                                                style={{
                                                    borderRadius:
                                                        "var(--radius)",
                                                }}
                                            >
                                                <Palette className="w-4 h-4 text-white" />
                                            </div>
                                        </label>

                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-medium text-foreground">
                                                Color seleccionado
                                            </span>
                                            <div
                                                className="flex items-center gap-2 px-3 py-1.5 bg-surface-container border border-border w-fit"
                                                style={{
                                                    borderRadius:
                                                        "var(--radius)",
                                                }}
                                            >
                                                <div
                                                    className="w-3 h-3 flex-shrink-0"
                                                    style={{
                                                        backgroundColor:
                                                            colorSeleccionado,
                                                        borderRadius: "2px",
                                                    }}
                                                />
                                                <span className="text-sm font-mono text-foreground tracking-wider">
                                                    {colorSeleccionado.toUpperCase()}
                                                </span>
                                            </div>
                                            <span className="text-xs text-on-surface-variant">
                                                Hacé click en el cuadrado para
                                                cambiar
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Panel imagen */}
                        {modoVisual === "imagen" && (
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Imagen del portal
                                </label>
                                <div
                                    className="border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary hover:bg-primary/5 cursor-pointer"
                                    style={{ borderRadius: "var(--radius)" }}
                                    onClick={() =>
                                        document
                                            .getElementById("image-upload")
                                            ?.click()
                                    }
                                >
                                    {customImage ? (
                                        <div className="space-y-3">
                                            <img
                                                src={customImage}
                                                alt="Preview"
                                                className="w-32 h-32 object-cover mx-auto"
                                                style={{
                                                    borderRadius:
                                                        "var(--radius)",
                                                }}
                                            />
                                            <p className="text-sm text-on-surface-variant">
                                                Click para cambiar
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 text-on-surface-variant mx-auto mb-2" />
                                            <p className="text-sm text-foreground mb-1">
                                                Click para subir una imagen
                                            </p>
                                            <p className="text-xs text-on-surface-variant">
                                                PNG, JPG o SVG (recomendado:
                                                400x400px)
                                            </p>
                                        </>
                                    )}
                                </div>
                                <input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleImageUpload(file);
                                    }}
                                />
                            </div>
                        )}

                        {/* Vista previa */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Vista Previa
                            </label>
                            <div
                                className="p-5 bg-surface-container"
                                style={{ borderRadius: "var(--radius)" }}
                            >
                                <div className="flex items-center gap-4">
                                    {/* Avatar igual al que aparece en ExplorarPortales */}
                                    <div
                                        className="w-14 h-14 flex items-center justify-center flex-shrink-0"
                                        style={{
                                            borderRadius: "var(--radius)",
                                            backgroundColor:
                                                modoVisual === "icono"
                                                    ? colorSeleccionado
                                                    : undefined,
                                            overflow: "hidden",
                                        }}
                                    >
                                        {modoVisual === "imagen" &&
                                        customImage ? (
                                            <img
                                                src={customImage}
                                                alt="Portal"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            (() => {
                                                const found =
                                                    ICONOS_DISPONIBLES.find(
                                                        (i) =>
                                                            i.value ===
                                                            iconoSeleccionado,
                                                    );
                                                if (!found) return null;
                                                const { Icon } = found;
                                                return (
                                                    <Icon className="w-7 h-7 text-white" />
                                                );
                                            })()
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground">
                                            {portal?.carrera ??
                                                "Nombre de la carrera"}
                                        </p>
                                        <p className="text-sm text-on-surface-variant">
                                            {portal?.universidad ??
                                                "Universidad"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSaveVisualIdentity}
                            disabled={loadingVisual}
                            className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                            style={{ borderRadius: "var(--radius)" }}
                        >
                            {loadingVisual && (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            )}
                            Guardar Identidad Visual
                        </button>
                    </div>
                </section>

                {/* ── Control de Acceso ── */}
                <section
                    className="bg-surface-container-lowest p-6 shadow-sm"
                    style={{ borderRadius: "var(--radius)" }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div
                            className="p-2 bg-primary/10"
                            style={{ borderRadius: "var(--radius)" }}
                        >
                            <Lock className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-foreground">Control de Acceso</h2>
                    </div>

                    <div className="space-y-6">
                        {/* Portal Abierto/Cerrado */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <div className="text-sm font-medium text-foreground mb-1">
                                        Portal{" "}
                                        {isPortalOpen ? "Abierto" : "Cerrado"}
                                    </div>
                                    <p className="text-xs text-on-surface-variant">
                                        {isPortalOpen
                                            ? "No miembros pueden ver Materias y Foro en modo lectura"
                                            : "No miembros solo pueden ver la página de Inicio"}
                                    </p>
                                </div>
                                <button
                                    onClick={handleProposePortalAccessChange}
                                    className={`px-4 py-2 transition-colors ${
                                        isPortalOpen
                                            ? "bg-green-600 text-white hover:bg-green-700"
                                            : "bg-surface-container text-foreground hover:bg-accent"
                                    }`}
                                    style={{ borderRadius: "var(--radius)" }}
                                >
                                    {isPortalOpen ? "Abierto" : "Cerrado"}
                                </button>
                            </div>
                            <p className="text-xs text-on-surface-variant flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Cambiar el acceso al portal requiere votación de
                                todos los administradores
                            </p>
                        </div>

                        <div className="h-px bg-border" />

                        {/* Solicitudes Abiertas/Cerradas */}
                        <div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-foreground mb-1">
                                        Solicitudes de Membresía
                                    </div>
                                    <p className="text-xs text-on-surface-variant">
                                        {accessData.areRequestsOpen
                                            ? "Los usuarios pueden enviar solicitudes para unirse"
                                            : "Las solicitudes están cerradas temporalmente"}
                                    </p>
                                </div>
                                <button
                                    onClick={handleToggleRequests}
                                    disabled={loadingToggleRequest}
                                    className={`px-4 py-2 transition-colors flex items-center gap-2 disabled:opacity-50 ${
                                        accessData.areRequestsOpen
                                            ? "bg-green-600 text-white hover:bg-green-700"
                                            : "bg-surface-container text-foreground hover:bg-accent"
                                    }`}
                                    style={{ borderRadius: "var(--radius)" }}
                                >
                                    {loadingToggleRequest && (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    )}
                                    {accessData.areRequestsOpen
                                        ? "Abiertas"
                                        : "Cerradas"}
                                </button>
                            </div>
                        </div>

                        <div className="h-px bg-border" />

                        {/* Requisitos */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-foreground">
                                Requisitos para Unirse (opcional)
                            </label>
                            <textarea
                                rows={4}
                                value={accessData.joinRequirements}
                                onChange={(e) =>
                                    setAccessData((prev) => ({
                                        ...prev,
                                        joinRequirements: e.target.value,
                                    }))
                                }
                                className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                                style={{ borderRadius: "var(--radius)" }}
                                placeholder="Indica qué deben incluir los usuarios en su solicitud (ej: número de legajo, año de cursada, etc.)"
                            />
                            <p className="text-xs text-on-surface-variant mt-1.5">
                                Los usuarios verán este texto antes de enviar
                                una solicitud
                            </p>
                        </div>

                        <button
                            onClick={handleSaveRequirements}
                            disabled={loadingRequirements}
                            className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                            style={{ borderRadius: "var(--radius)" }}
                        >
                            {loadingRequirements && (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            )}
                            Guardar Requisitos
                        </button>
                    </div>
                </section>

                {/* ── Zona Peligrosa ── */}
                <section
                    className="bg-surface-container-lowest p-6 border-2 border-destructive/20 shadow-sm"
                    style={{ borderRadius: "var(--radius)" }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div
                            className="p-2 bg-destructive/10"
                            style={{ borderRadius: "var(--radius)" }}
                        >
                            <Archive className="w-5 h-5 text-destructive" />
                        </div>
                        <h2 className="text-destructive">Zona Peligrosa</h2>
                    </div>

                    <div
                        className="p-4 bg-destructive/5 border border-destructive/20 mb-4"
                        style={{ borderRadius: "var(--radius)" }}
                    >
                        <p className="text-sm text-foreground mb-1 font-medium">
                            {isArchived ? "Activar Portal" : "Archivar Portal"}
                        </p>
                        <p className="text-sm text-on-surface-variant">
                            {isArchived
                                ? "El portal está archivado. Proponer activarlo lo hará visible nuevamente para los miembros. Requiere votación de todos los administradores."
                                : "El portal será ocultado y los miembros no podrán acceder. Esta acción se puede revertir, pero requiere votación de todos los administradores."}
                        </p>
                    </div>

                    <button
                        onClick={
                            isArchived
                                ? handleProposeActivate
                                : handleProposeArchive
                        }
                        className="px-5 py-2.5 border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        style={{ borderRadius: "var(--radius)" }}
                    >
                        {isArchived
                            ? "Proponer Activar Portal"
                            : "Proponer Archivar Portal"}
                    </button>
                </section>
            </div>

            {/* ── Modales ── */}
            <VoteModal
                isOpen={voteModal.isOpen}
                onClose={closeVoteModal}
                onConfirm={handleConfirmVote}
                title={voteModal.title}
                description={voteModal.description}
                loading={loadingVote}
            />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={closeConfirmModal}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                loading={
                    loadingDescription ||
                    loadingVisual ||
                    loadingToggleRequest ||
                    loadingRequirements
                }
            />

            <Toast toast={toast} />
        </div>
    );
}
