import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
    BookOpen,
    MessageSquare,
    UserPlus,
    Home,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    Loader2,
    FileText,
    Users,
    Settings,
} from "lucide-react";
import { useState } from "react";
import { usePortalContext } from "../hooks/usePortalContext";

export function PortalLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isAdminExpanded, setIsAdminExpanded] = useState(true);

    const { portal, loading, error, isMember, isAdmin, isGuest, portalId } =
        usePortalContext();

    // Un GUEST puede ver contenido si el portal es ABIERTO
    const isOpen = portal?.tipoAcceso === "ABIERTO";
    const canViewContent = isMember || isAdmin || isOpen;

    const isActive = (path: string) => location.pathname === path;

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Cargando portal...</p>
                </div>
            </div>
        );
    }

    if (error || !portal) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center max-w-md px-4">
                    <div className="text-destructive mb-4 text-5xl">⚠️</div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                        Error
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        {error || "No se pudo cargar el portal"}
                    </p>
                    <button
                        onClick={() => navigate("/")}
                        className="px-6 py-3 rounded-sm transition-all"
                        style={{
                            background:
                                "linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 100%)",
                            color: "var(--primary-foreground)",
                        }}
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    const isArchived = portal?.activo === false;

    if (isArchived && !isAdmin) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center max-w-md px-4">
                    <div className="text-5xl mb-4">📦</div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                        Portal archivado
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        Este portal fue archivado y ya no está disponible para
                        sus miembros.
                    </p>
                    <button
                        onClick={() => navigate("/")}
                        className="px-6 py-3 rounded-sm transition-all"
                        style={{
                            background:
                                "linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 100%)",
                            color: "var(--primary-foreground)",
                        }}
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    const portalName = portal.carrera;

    return (
        <div className="min-h-screen bg-background">
            <div className="flex">
                <aside
                    className={`bg-sidebar-border h-screen sticky top-0 overflow-y-auto transition-all duration-300 ${
                        isSidebarCollapsed ? "w-16" : "w-64"
                    }`}
                >
                    <div
                        className={`${isSidebarCollapsed ? "p-2" : "p-6"} transition-all duration-300`}
                    >
                        {/* Colapsar/expandir */}
                        <div
                            className={`flex ${isSidebarCollapsed ? "justify-center mb-4" : "justify-end mb-6"}`}
                        >
                            <button
                                onClick={() =>
                                    setIsSidebarCollapsed(!isSidebarCollapsed)
                                }
                                className="p-2 hover:bg-surface-container-low transition-colors"
                                style={{ borderRadius: "var(--radius)" }}
                                title={
                                    isSidebarCollapsed
                                        ? "Expandir sidebar"
                                        : "Colapsar sidebar"
                                }
                            >
                                {isSidebarCollapsed ? (
                                    <ChevronRight className="w-4 h-4 text-foreground" />
                                ) : (
                                    <ChevronLeft className="w-4 h-4 text-foreground" />
                                )}
                            </button>
                        </div>

                        {/* Título */}
                        {!isSidebarCollapsed &&
                            !isActive(`/portal/${portalId}`) && (
                                <div className="mb-8">
                                    <h2
                                        className="text-lg font-semibold text-foreground mb-1"
                                        style={{
                                            fontFamily: "Work Sans, sans-serif",
                                        }}
                                    >
                                        {portalName}
                                    </h2>
                                    <p className="text-xs text-foreground uppercase tracking-wide">
                                        {portal.universidad}
                                    </p>
                                </div>
                            )}
                        {!isSidebarCollapsed &&
                            isActive(`/portal/${portalId}`) && (
                                <div className="mb-8">
                                    <p className="text-xs text-foreground uppercase tracking-wide">
                                        Portal Académico
                                    </p>
                                </div>
                            )}

                        <nav className="space-y-1">
                            {/* Inicio — visible para todos */}
                            <Link
                                to={`/portal/${portalId}`}
                                className={`flex items-center ${isSidebarCollapsed ? "justify-center px-2" : "gap-3 px-4"} py-2.5 rounded-sm transition-all relative ${
                                    isActive(`/portal/${portalId}`)
                                        ? "text-foreground"
                                        : "text-muted-foreground hover:text-foreground hover:bg-surface-container-low"
                                }`}
                                title={isSidebarCollapsed ? "Inicio" : ""}
                            >
                                {isActive(`/portal/${portalId}`) &&
                                    !isSidebarCollapsed && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-sm" />
                                    )}
                                <Home
                                    className={`w-5 h-5 ${isSidebarCollapsed && isActive(`/portal/${portalId}`) ? "text-primary" : ""}`}
                                />
                                {!isSidebarCollapsed && <span>Inicio</span>}
                            </Link>

                            {/* Materias y Foro — visible si es miembro/admin O si el portal es ABIERTO */}
                            {canViewContent && (
                                <>
                                    <Link
                                        to={`/portal/${portalId}/materias`}
                                        className={`flex items-center ${isSidebarCollapsed ? "justify-center px-2" : "gap-3 px-4"} py-2.5 rounded-sm transition-all relative ${
                                            location.pathname.startsWith(
                                                `/portal/${portalId}/materias`,
                                            )
                                                ? "text-foreground"
                                                : "text-muted-foreground hover:text-foreground hover:bg-surface-container-low"
                                        }`}
                                        title={
                                            isSidebarCollapsed ? "Materias" : ""
                                        }
                                    >
                                        {location.pathname.startsWith(
                                            `/portal/${portalId}/materias`,
                                        ) &&
                                            !isSidebarCollapsed && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-sm" />
                                            )}
                                        <BookOpen
                                            className={`w-5 h-5 ${isSidebarCollapsed && location.pathname.startsWith(`/portal/${portalId}/materias`) ? "text-primary" : ""}`}
                                        />
                                        {!isSidebarCollapsed && (
                                            <span>Materias</span>
                                        )}
                                    </Link>

                                    <Link
                                        to={`/portal/${portalId}/foro`}
                                        className={`flex items-center ${isSidebarCollapsed ? "justify-center px-2" : "gap-3 px-4"} py-2.5 rounded-sm transition-all relative ${
                                            location.pathname.startsWith(
                                                `/portal/${portalId}/foro`,
                                            )
                                                ? "text-foreground"
                                                : "text-muted-foreground hover:text-foreground hover:bg-surface-container-low"
                                        }`}
                                        title={isSidebarCollapsed ? "Foro" : ""}
                                    >
                                        {location.pathname.startsWith(
                                            `/portal/${portalId}/foro`,
                                        ) &&
                                            !isSidebarCollapsed && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-sm" />
                                            )}
                                        <MessageSquare
                                            className={`w-5 h-5 ${isSidebarCollapsed && location.pathname.startsWith(`/portal/${portalId}/foro`) ? "text-primary" : ""}`}
                                        />
                                        {!isSidebarCollapsed && (
                                            <span>Foro</span>
                                        )}
                                    </Link>
                                </>
                            )}

                            {/* Unirse — solo para GUEST */}
                            {isGuest && (
                                <Link
                                    to={`/portal/${portalId}/solicitud`}
                                    className={`flex items-center ${isSidebarCollapsed ? "justify-center px-2" : "gap-3 px-4"} py-2.5 rounded-sm transition-all relative ${
                                        location.pathname.includes(
                                            `/portal/${portalId}/solicitud`,
                                        )
                                            ? "text-foreground"
                                            : "text-muted-foreground hover:text-foreground hover:bg-surface-container-low"
                                    }`}
                                    title={isSidebarCollapsed ? "Unirse" : ""}
                                >
                                    {location.pathname.includes(
                                        `/portal/${portalId}/solicitud`,
                                    ) &&
                                        !isSidebarCollapsed && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-sm" />
                                        )}
                                    <UserPlus
                                        className={`w-5 h-5 ${isSidebarCollapsed && location.pathname.includes(`/portal/${portalId}/solicitud`) ? "text-primary" : ""}`}
                                    />
                                    {!isSidebarCollapsed && <span>Unirse</span>}
                                </Link>
                            )}

                            {/* Admin — solo admins, sin cambios */}
                            {isAdmin && (
                                <>
                                    <div className="my-4">
                                        <div className="h-px bg-border mb-3" />
                                    </div>

                                    {!isSidebarCollapsed && (
                                        <button
                                            onClick={() =>
                                                setIsAdminExpanded(
                                                    !isAdminExpanded,
                                                )
                                            }
                                            className="w-full flex items-center justify-between px-4 py-2 text-on-surface-variant hover:text-foreground hover:bg-surface-container-low rounded-sm transition-colors"
                                        >
                                            <span className="text-xs uppercase tracking-wide font-medium">
                                                Admin
                                            </span>
                                            {isAdminExpanded ? (
                                                <ChevronUp className="w-4 h-4" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4" />
                                            )}
                                        </button>
                                    )}

                                    {(isAdminExpanded ||
                                        isSidebarCollapsed) && (
                                        <>
                                            <Link
                                                to={`/portal/${portalId}/admin/solicitudes`}
                                                className={`flex items-center ${isSidebarCollapsed ? "justify-center px-2" : "gap-3 px-4"} py-2.5 rounded-sm transition-all relative ${
                                                    location.pathname.includes(
                                                        `/portal/${portalId}/admin/solicitudes`,
                                                    )
                                                        ? "text-foreground"
                                                        : "text-muted-foreground hover:text-foreground hover:bg-surface-container-low"
                                                }`}
                                                title={
                                                    isSidebarCollapsed
                                                        ? "Solicitudes y Material"
                                                        : ""
                                                }
                                            >
                                                {location.pathname.includes(
                                                    `/portal/${portalId}/admin/solicitudes`,
                                                ) &&
                                                    !isSidebarCollapsed && (
                                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-sm" />
                                                    )}
                                                <FileText
                                                    className={`w-5 h-5 ${isSidebarCollapsed && location.pathname.includes(`/portal/${portalId}/admin/solicitudes`) ? "text-primary" : ""}`}
                                                />
                                                {!isSidebarCollapsed && (
                                                    <span>
                                                        Solicitudes y Material
                                                    </span>
                                                )}
                                            </Link>

                                            <Link
                                                to={`/portal/${portalId}/admin/panel`}
                                                className={`flex items-center ${isSidebarCollapsed ? "justify-center px-2" : "gap-3 px-4"} py-2.5 rounded-sm transition-all relative ${
                                                    location.pathname.includes(
                                                        `/portal/${portalId}/admin/panel`,
                                                    )
                                                        ? "text-foreground"
                                                        : "text-muted-foreground hover:text-foreground hover:bg-surface-container-low"
                                                }`}
                                                title={
                                                    isSidebarCollapsed
                                                        ? "Panel de Administración"
                                                        : ""
                                                }
                                            >
                                                {location.pathname.includes(
                                                    `/portal/${portalId}/admin/panel`,
                                                ) &&
                                                    !isSidebarCollapsed && (
                                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-sm" />
                                                    )}
                                                <Users
                                                    className={`w-5 h-5 ${isSidebarCollapsed && location.pathname.includes(`/portal/${portalId}/admin/panel`) ? "text-primary" : ""}`}
                                                />
                                                {!isSidebarCollapsed && (
                                                    <span>
                                                        Panel de Administración
                                                    </span>
                                                )}
                                            </Link>

                                            <Link
                                                to={`/portal/${portalId}/admin/configuracion`}
                                                className={`flex items-center ${isSidebarCollapsed ? "justify-center px-2" : "gap-3 px-4"} py-2.5 rounded-sm transition-all relative ${
                                                    location.pathname.includes(
                                                        `/portal/${portalId}/admin/configuracion`,
                                                    )
                                                        ? "text-foreground"
                                                        : "text-muted-foreground hover:text-foreground hover:bg-surface-container-low"
                                                }`}
                                                title={
                                                    isSidebarCollapsed
                                                        ? "Configuración"
                                                        : ""
                                                }
                                            >
                                                {location.pathname.includes(
                                                    `/portal/${portalId}/admin/configuracion`,
                                                ) &&
                                                    !isSidebarCollapsed && (
                                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-sm" />
                                                    )}
                                                <Settings
                                                    className={`w-5 h-5 ${isSidebarCollapsed && location.pathname.includes(`/portal/${portalId}/admin/configuracion`) ? "text-primary" : ""}`}
                                                />
                                                {!isSidebarCollapsed && (
                                                    <span>Configuración</span>
                                                )}
                                            </Link>
                                        </>
                                    )}
                                </>
                            )}
                        </nav>

                        {/* Estado */}
                        {!isSidebarCollapsed && (
                            <div
                                className="mt-8 pt-6"
                                style={{
                                    borderTop:
                                        "1px solid rgba(169, 180, 185, 0.15)",
                                }}
                            >
                                <div className="text-xs text-foreground uppercase tracking-wide mb-2">
                                    Estado
                                </div>
                                {isAdmin ? (
                                    <>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-2 h-2 rounded-full bg-primary" />
                                            <span className="text-sm text-foreground">
                                                Miembro activo
                                            </span>
                                        </div>
                                        <div className="mt-2 px-2 py-1 bg-destructive/10 text-destructive rounded-sm text-xs inline-block border border-destructive/20">
                                            Administrador
                                        </div>
                                    </>
                                ) : isMember ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                        <span className="text-sm text-foreground">
                                            Miembro activo
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                        <span className="text-sm text-foreground">
                                            {isOpen
                                                ? "Visitante (portal abierto)"
                                                : "Invitado"}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {isSidebarCollapsed && (
                            <div className="mt-4 flex justify-center">
                                <div
                                    className={`w-2 h-2 rounded-full ${isMember || isAdmin ? "bg-primary" : "bg-yellow-500"}`}
                                    title={
                                        isMember || isAdmin
                                            ? "Miembro activo"
                                            : isOpen
                                              ? "Visitante (portal abierto)"
                                              : "Invitado"
                                    }
                                />
                            </div>
                        )}
                    </div>
                </aside>

                <main className="flex-1">
                    <Outlet
                        context={{ portal, isMember, isAdmin, isGuest, isOpen }}
                    />
                </main>
            </div>
        </div>
    );
}
