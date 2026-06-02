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

  const { portal, loading, error, isMember, isAdmin, isGuest, portalId } = usePortalContext();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    navigate("/login");
  };

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
          <h2 className="text-2xl font-bold text-foreground mb-2">Error</h2>
          <p className="text-muted-foreground mb-6">{error || "No se pudo cargar el portal"}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-sm transition-all"
            style={{ 
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 100%)',
              color: 'var(--primary-foreground)'
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
      {/* Layout con Sidebar */}
      <div className="flex">
        {/* Sidebar Lateral */}
        <aside
          className={`bg-sidebar-border h-screen sticky top-0 overflow-y-auto transition-all duration-300 ${
            isSidebarCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          <div className={`${isSidebarCollapsed ? 'p-2' : 'p-6'} transition-all duration-300`}>
            {/* Botón de colapsar/expandir */}
            <div className={`flex ${isSidebarCollapsed ? 'justify-center mb-4' : 'justify-end mb-6'}`}>
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-2 hover:bg-surface-container-low transition-colors"
                style={{ borderRadius: 'var(--radius)' }}
                title={isSidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
              >
                {isSidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-foreground" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-foreground" />
                )}
              </button>
            </div>

            {/* Título del portal */}
            {!isSidebarCollapsed && !isActive(`/portal/${portalId}`) && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-1" style={{ fontFamily: 'Work Sans, sans-serif' }}>
                  {portalName}
                </h2>
                <p className="text-xs text-foreground uppercase tracking-wide">
                  {portal.universidad}
                </p>
              </div>
            )}
            {!isSidebarCollapsed && isActive(`/portal/${portalId}`) && (
              <div className="mb-8">
                <p className="text-xs text-foreground uppercase tracking-wide">Portal Académico</p>
              </div>
            )}

            {/* Navegación */}
            <nav className="space-y-1">
              {/* Inicio - visible para todos */}
              <Link
                to={`/portal/${portalId}`}
                className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-2.5 rounded-sm transition-all relative ${
                  isActive(`/portal/${portalId}`)
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-container-low"
                }`}
                title={isSidebarCollapsed ? 'Inicio' : ''}
              >
                {isActive(`/portal/${portalId}`) && !isSidebarCollapsed && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-sm" />
                )}
                <Home className={`w-5 h-5 ${isSidebarCollapsed && isActive(`/portal/${portalId}`) ? 'text-primary' : ''}`} />
                {!isSidebarCollapsed && <span>Inicio</span>}
              </Link>

              {/* Materias y Foro - solo para miembros y admins */}
              {isMember && (
                <>
                  <Link
                    to={`/portal/${portalId}/materias`}
                    className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-2.5 rounded-sm transition-all relative ${
                      location.pathname.startsWith(`/portal/${portalId}/materias`)
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface-container-low"
                    }`}
                    title={isSidebarCollapsed ? 'Materias' : ''}
                  >
                    {location.pathname.startsWith(`/portal/${portalId}/materias`) && !isSidebarCollapsed && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-sm" />
                    )}
                    <BookOpen className={`w-5 h-5 ${isSidebarCollapsed && location.pathname.startsWith(`/portal/${portalId}/materias`) ? 'text-primary' : ''}`} />
                    {!isSidebarCollapsed && <span>Materias</span>}
                  </Link>

                  <Link
                    to={`/portal/${portalId}/foro`}
                    className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-2.5 rounded-sm transition-all relative ${
                      location.pathname.startsWith(`/portal/${portalId}/foro`)
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface-container-low"
                    }`}
                    title={isSidebarCollapsed ? 'Foro' : ''}
                  >
                    {location.pathname.startsWith(`/portal/${portalId}/foro`) && !isSidebarCollapsed && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-sm" />
                    )}
                    <MessageSquare className={`w-5 h-5 ${isSidebarCollapsed && location.pathname.startsWith(`/portal/${portalId}/foro`) ? 'text-primary' : ''}`} />
                    {!isSidebarCollapsed && <span>Foro</span>}
                  </Link>
                </>
              )}

              {/* Unirse - solo para invitados (GUEST) */}
              {isGuest && (
                <Link
                  to={`/portal/${portalId}/solicitud`}
                  className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-2.5 rounded-sm transition-all relative ${
                    location.pathname.includes(`/portal/${portalId}/solicitud`)
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-container-low"
                  }`}
                  title={isSidebarCollapsed ? 'Unirse' : ''}
                >
                  {location.pathname.includes(`/portal/${portalId}/solicitud`) && !isSidebarCollapsed && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-sm" />
                  )}
                  <UserPlus className={`w-5 h-5 ${isSidebarCollapsed && location.pathname.includes(`/portal/${portalId}/solicitud`) ? 'text-primary' : ''}`} />
                  {!isSidebarCollapsed && <span>Unirse</span>}
                </Link>
              )}

              {/* Sección Admin - solo para admins */}
              {isAdmin && (
                <>
                  {/* Divisor */}
                  <div className="my-4">
                    <div className="h-px bg-border mb-3"></div>
                  </div>

                  {/* Header Admin - expandible (solo cuando sidebar está expandido) */}
                  {!isSidebarCollapsed && (
                    <button
                      onClick={() => setIsAdminExpanded(!isAdminExpanded)}
                      className="w-full flex items-center justify-between px-4 py-2 text-on-surface-variant hover:text-foreground hover:bg-surface-container-low rounded-sm transition-colors"
                    >
                      <span className="text-xs uppercase tracking-wide font-medium">Admin</span>
                      {isAdminExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  {/* Links admin: visibles si el grupo está expandido, o si el sidebar está colapsado
                      (en sidebar colapsado siempre se muestran los íconos, no hay label que colapsar) */}
                  {(isAdminExpanded || isSidebarCollapsed) && (
                    <>
                      <Link
                        to={`/portal/${portalId}/admin/solicitudes`}
                        className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-2.5 rounded-sm transition-all relative ${
                          location.pathname.includes(`/portal/${portalId}/admin/solicitudes`)
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-surface-container-low"
                        }`}
                        title={isSidebarCollapsed ? 'Solicitudes y Material' : ''}
                      >
                        {location.pathname.includes(`/portal/${portalId}/admin/solicitudes`) && !isSidebarCollapsed && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-sm" />
                        )}
                        <FileText className={`w-5 h-5 ${isSidebarCollapsed && location.pathname.includes(`/portal/${portalId}/admin/solicitudes`) ? 'text-primary' : ''}`} />
                        {!isSidebarCollapsed && <span>Solicitudes y Material</span>}
                      </Link>

                      <Link
                        to={`/portal/${portalId}/admin/panel`}
                        className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-2.5 rounded-sm transition-all relative ${
                          location.pathname.includes(`/portal/${portalId}/admin/panel`)
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-surface-container-low"
                        }`}
                        title={isSidebarCollapsed ? 'Panel de Administración' : ''}
                      >
                        {location.pathname.includes(`/portal/${portalId}/admin/panel`) && !isSidebarCollapsed && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-sm" />
                        )}
                        <Users className={`w-5 h-5 ${isSidebarCollapsed && location.pathname.includes(`/portal/${portalId}/admin/panel`) ? 'text-primary' : ''}`} />
                        {!isSidebarCollapsed && <span>Panel de Administración</span>}
                      </Link>

                      <Link
                        to={`/portal/${portalId}/admin/configuracion`}
                        className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-2.5 rounded-sm transition-all relative ${
                          location.pathname.includes(`/portal/${portalId}/admin/configuracion`)
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-surface-container-low"
                        }`}
                        title={isSidebarCollapsed ? 'Configuración' : ''}
                      >
                        {location.pathname.includes(`/portal/${portalId}/admin/configuracion`) && !isSidebarCollapsed && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-sm" />
                        )}
                        <Settings className={`w-5 h-5 ${isSidebarCollapsed && location.pathname.includes(`/portal/${portalId}/admin/configuracion`) ? 'text-primary' : ''}`} />
                        {!isSidebarCollapsed && <span>Configuración</span>}
                      </Link>
                    </>
                  )}
                </>
              )}
            </nav>

            {/* Info del usuario en el portal */}
            {!isSidebarCollapsed && (
              <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(169, 180, 185, 0.15)' }}>
                <div className="text-xs text-foreground uppercase tracking-wide mb-2">Estado</div>
                {isMember ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="text-sm text-foreground">Miembro activo</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span className="text-sm text-foreground">Invitado</span>
                  </div>
                )}
                {isAdmin && (
                  <div className="mt-2 px-2 py-1 bg-destructive/10 text-destructive rounded-sm text-xs inline-block border border-destructive/20">
                    Administrador
                  </div>
                )}
              </div>
            )}

            {/* Estado visual cuando está colapsado */}
            {isSidebarCollapsed && (
              <div className="mt-4 flex justify-center">
                <div 
                  className={`w-2 h-2 rounded-full ${isMember ? 'bg-primary' : 'bg-yellow-500'}`} 
                  title={isMember ? 'Miembro activo' : 'Invitado'}
                ></div>
              </div>
            )}
          </div>
        </aside>

        {/* Contenido Principal */}
        <main className="flex-1">
          <Outlet context={{ portal, isMember, isAdmin, isGuest }} />
        </main>
      </div>
    </div>
  );
}