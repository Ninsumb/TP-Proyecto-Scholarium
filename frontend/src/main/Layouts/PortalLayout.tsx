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
            <div className="min-h-screen bg-background portal-scope flex items-center justify-center">
                <div className="text-center portal-fade-up">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Cargando portal...</p>
                </div>
            </div>
        );
    }

    if (error || !portal) {
        return (
            <div className="min-h-screen bg-background portal-scope flex items-center justify-center">
                <div
                    className="text-center max-w-md px-8 py-10 mx-4 portal-fade-up"
                    style={{
                        borderRadius: "var(--radius-lg)",
                        background: "var(--card)",
                        boxShadow: "var(--portal-shadow-card)",
                        border: "1px solid var(--border)",
                    }}
                >
                    <div className="text-destructive mb-4 text-5xl">⚠️</div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                        Error
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        {error || "No se pudo cargar el portal"}
                    </p>
                    <button
                        onClick={() => navigate("/")}
                        className="px-6 py-3 transition-all portal-hoverable"
                        style={{
                            borderRadius: "var(--radius-sm)",
                            background:
                                "linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 100%)",
                            color: "var(--primary-foreground)",
                            boxShadow: "var(--portal-shadow-card)",
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
            <div className="min-h-screen bg-background portal-scope flex items-center justify-center">
                <div
                    className="text-center max-w-md px-8 py-10 mx-4 portal-fade-up"
                    style={{
                        borderRadius: "var(--radius-lg)",
                        background: "var(--card)",
                        boxShadow: "var(--portal-shadow-card)",
                        border: "1px solid var(--border)",
                    }}
                >
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
                        className="px-6 py-3 transition-all portal-hoverable"
                        style={{
                            borderRadius: "var(--radius-sm)",
                            background:
                                "linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 100%)",
                            color: "var(--primary-foreground)",
                            boxShadow: "var(--portal-shadow-card)",
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
        <div className="min-h-screen bg-background portal-scope">
            <div className="flex">
                <aside
                    className={`h-screen sticky top-0 overflow-y-auto transition-all duration-300 ${
                        isSidebarCollapsed ? "w-16" : "w-64"
                    }`}
                    style={{
                        background: "var(--card)",
                        borderRight: "1px solid var(--border)",
                        boxShadow: "var(--portal-shadow-card)",
                    }}
                >
                    <div
                        className={`${isSidebarCollapsed ? "p-2" : "p-5"} transition-all duration-300`}
                    >
                        {/* Colapsar/expandir */}
                        <div
                            className={`flex ${isSidebarCollapsed ? "justify-center mb-4" : "justify-end mb-5"}`}
                        >
                            <button
                                onClick={() =>
                                    setIsSidebarCollapsed(!isSidebarCollapsed)
                                }
                                className="p-2 hover:bg-surface-container-low transition-colors"
                                style={{ borderRadius: "var(--radius-sm)" }}
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
                                <div
                                    className="mb-7 pb-5"
                                    style={{
                                        borderBottom:
                                            "1px solid var(--border)",
                                    }}
                                >
                                    <h2
                                        className="text-lg font-semibold text-foreground mb-1 leading-snug"
                                        style={{
                                            fontFamily: "Work Sans, sans-serif",
                                        }}
                                    >
                                        {portalName}
                                    </h2>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                        {portal.universidad}
                                    </p>
                                </div>
                            )}
                        {!isSidebarCollapsed &&
                            isActive(`/portal/${portalId}`) && (
                                <div
                                    className="mb-7 pb-5"
                                    style={{
                                        borderBottom:
                                            "1px solid var(--border)",
                                    }}
                                >
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                        Portal Académico
                                    </p>
                                </div>
                            )}

                        <nav className="space-y-1">
                            {/* Inicio — visible para todos */}
                            <Link
                                to={`/portal/${portalId}`}
                                className={`flex items-center ${isSidebarCollapsed ? "justify-center px-2" : "gap-3 px-3.5"} py-2.5 transition-all ${
                                    isActive(`/portal/${portalId}`)
                                        ? "text-primary font-medium bg-primary/10"
                                        : "text-muted-foreground hover:text-foreground hover:bg-surface-container-low"
                                }`}
                                style={{ borderRadius: "var(--radius-sm)" }}
                                title={isSidebarCollapsed ? "Inicio" : ""}
                            >
                                <Home className="w-5 h-5" />
                                {!isSidebarCollapsed && <span>Inicio</span>}
                            </Link>

                            {/* Materias y Foro — visible si es miembro/admin O si el portal es ABIERTO */}
                            {canViewContent && (
                                <>
                                    <Link
                                        to={`/portal/${portalId}/materias`}
                                        className={`flex items-center ${isSidebarCollapsed ? "justify-center px-2" : "gap-3 px-3.5"} py-2.5 transition-all ${
                                            location.pathname.startsWith(
                                                `/portal/${portalId}/materias`,
                                            )
                                                ? "text-primary font-medium bg-primary/10"
                                                : "text-muted-foreground hover:text-foreground hover:bg-surface-container-low"
                                        }`}
                                        style={{ borderRadius: "var(--radius-sm)" }}
                                        title={
                                            isSidebarCollapsed ? "Materias" : ""
                                        }
                                    >
                                        <BookOpen className="w-5 h-5" />
                                        {!isSidebarCollapsed && (
                                            <span>Materias</span>
                                        )}
                                    </Link>

                                    <Link
                                        to={`/portal/${portalId}/foro`}
                                        className={`flex items-center ${isSidebarCollapsed ? "justify-center px-2" : "gap-3 px-3.5"} py-2.5 transition-all ${
                                            location.pathname.startsWith(
                                                `/portal/${portalId}/foro`,
                                            )
                                                ? "text-primary font-medium bg-primary/10"
                                                : "text-muted-foreground hover:text-foreground hover:bg-surface-container-low"
                                        }`}
                                        style={{ borderRadius: "var(--radius-sm)" }}
                                        title={isSidebarCollapsed ? "Foro" : ""}
                                    >
                                        <MessageSquare className="w-5 h-5" />
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
                                    className={`flex items-center ${isSidebarCollapsed ? "justify-center px-2" : "gap-3 px-3.5"} py-2.5 transition-all ${
                                        location.pathname.includes(
                                            `/portal/${portalId}/solicitud`,
                                        )
                                            ? "text-primary font-medium bg-primary/10"
                                            : "text-muted-foreground hover:text-foreground hover:bg-surface-container-low"
                                    }`}
                                    style={{ borderRadius: "var(--radius-sm)" }}
                                    title={isSidebarCollapsed ? "Unirse" : ""}
                                >
                                    <UserPlus className="w-5 h-5" />
                                    {!isSidebarCollapsed && <span>Unirse</span>}
                                </Link>
                            )}

                            {/* Admin — solo admins, sin cambios */}
                            {isAdmin && (
                                <>
                                    <div
                                        className="my-4"
                                        style={{
                                            borderTop:
                                                "1px solid var(--border)",
                                        }}
                                    />

                                    {!isSidebarCollapsed && (
                                        <button
                                            onClick={() =>
                                                setIsAdminExpanded(
                                                    !isAdminExpanded,
                                                )
                                            }
                                            className="w-full flex items-center justify-between px-3.5 py-2 text-on-surface-variant hover:text-foreground hover:bg-surface-container-low transition-colors"
                                            style={{ borderRadius: "var(--radius-sm)" }}
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
                                                className={`flex items-center ${isSidebarCollapsed ? "justify-center px-2" : "gap-3 px-3.5"} py-2.5 transition-all ${
                                                    location.pathname.includes(
                                                        `/portal/${portalId}/admin/solicitudes`,
                                                    )
                                                        ? "text-primary font-medium bg-primary/10"
                                                        : "text-muted-foreground hover:text-foreground hover:bg-surface-container-low"
                                                }`}
                                                style={{ borderRadius: "var(--radius-sm)" }}
                                                title={
                                                    isSidebarCollapsed
                                                        ? "Solicitudes y Material"
                                                        : ""
                                                }
                                            >
                                                <FileText className="w-5 h-5" />
                                                {!isSidebarCollapsed && (
                                                    <span>
                                                        Solicitudes y Material
                                                    </span>
                                                )}
                                            </Link>

                                            <Link
                                                to={`/portal/${portalId}/admin/panel`}
                                                className={`flex items-center ${isSidebarCollapsed ? "justify-center px-2" : "gap-3 px-3.5"} py-2.5 transition-all ${
                                                    location.pathname.includes(
                                                        `/portal/${portalId}/admin/panel`,
                                                    )
                                                        ? "text-primary font-medium bg-primary/10"
                                                        : "text-muted-foreground hover:text-foreground hover:bg-surface-container-low"
                                                }`}
                                                style={{ borderRadius: "var(--radius-sm)" }}
                                                title={
                                                    isSidebarCollapsed
                                                        ? "Panel de Administración"
                                                        : ""
                                                }
                                            >
                                                <Users className="w-5 h-5" />
                                                {!isSidebarCollapsed && (
                                                    <span>
                                                        Panel de Administración
                                                    </span>
                                                )}
                                            </Link>

                                            <Link
                                                to={`/portal/${portalId}/admin/configuracion`}
                                                className={`flex items-center ${isSidebarCollapsed ? "justify-center px-2" : "gap-3 px-3.5"} py-2.5 transition-all ${
                                                    location.pathname.includes(
                                                        `/portal/${portalId}/admin/configuracion`,
                                                    )
                                                        ? "text-primary font-medium bg-primary/10"
                                                        : "text-muted-foreground hover:text-foreground hover:bg-surface-container-low"
                                                }`}
                                                style={{ borderRadius: "var(--radius-sm)" }}
                                                title={
                                                    isSidebarCollapsed
                                                        ? "Configuración"
                                                        : ""
                                                }
                                            >
                                                <Settings className="w-5 h-5" />
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
                                className="mt-6 pt-5"
                                style={{
                                    borderTop: "1px solid var(--border)",
                                }}
                            >
                                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2.5">
                                    Estado
                                </div>
                                {isAdmin ? (
                                    <>
                                        <div className="flex items-center gap-2 mb-2.5">
                                            <div className="w-2 h-2 rounded-full bg-primary" />
                                            <span className="text-sm text-foreground">
                                                Miembro activo
                                            </span>
                                        </div>
                                        <div
                                            className="px-2.5 py-1 bg-destructive/10 text-destructive text-xs inline-block border border-destructive/20 font-medium"
                                            style={{ borderRadius: "var(--radius-sm)" }}
                                        >
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
                                        <div className="w-2 h-2 rounded-full" style={{ background: "var(--portal-amber)" }} />
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
                                    className="w-2 h-2 rounded-full"
                                    style={{
                                        background:
                                            isMember || isAdmin
                                                ? "var(--primary)"
                                                : "var(--portal-amber)",
                                    }}
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

                <main className="flex-1 portal-fade-up">
                    <Outlet
                        context={{ portal, isMember, isAdmin, isGuest, isOpen }}
                    />
                </main>
            </div>

            {/* Portal target for modals/dropdowns — stays inside .portal-scope (and
                the .dark wrapper above it) so tokens and theme still apply, but
                outside any ancestor that clips via overflow or shifts the
                containing block via transform. */}
            <div id="portal-overlay-root" />
        </div>
    );
}
