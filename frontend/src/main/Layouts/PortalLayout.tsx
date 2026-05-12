import { Outlet, Link, useLocation, useParams, useNavigate } from "react-router";
import { GraduationCap, BookOpen, MessageSquare, UserPlus, Shield, Home, User, LogOut, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

export function PortalLayout() {
  const location = useLocation();
  const { portalId } = useParams();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Simulación de datos del usuario - en producción vendría de un contexto/estado global
  // Por defecto el usuario es miembro y admin de "ingenieria-informatica"
  const getUserPortals = () => {
    const stored = localStorage.getItem("userPortals");
    return stored ? JSON.parse(stored) : ["ingenieria-informatica"];
  };

  const getAdminPortals = () => {
    const stored = localStorage.getItem("adminPortals");
    return stored ? JSON.parse(stored) : ["ingenieria-informatica"];
  };

  const [userPortals] = useState<string[]>(getUserPortals());
  const [adminPortals] = useState<string[]>(getAdminPortals());
  
  const isMember = userPortals.includes(portalId || "");
  const isAdmin = adminPortals.includes(portalId || "");

  // Verificar si hay solicitud pendiente
  const requestDataStr = localStorage.getItem(`portal-request-${portalId}`);
  const hasRequest = !!requestDataStr;
  const requestStatus = hasRequest ? JSON.parse(requestDataStr).status : null;

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userUniversity");
    navigate("/login");
  };

  const userName = localStorage.getItem("userName") || "Usuario";

  // Obtener nombre del portal
  const portalNames: Record<string, string> = {
    "ingenieria-informatica": "Ingeniería Informática",
    "administracion": "Administración de Empresas",
    "ingenieria-quimica": "Ingeniería Química",
    "matematicas": "Matemáticas",
    "letras": "Letras",
    "medicina": "Medicina",
  };

  const portalName = portalNames[portalId || ""] || "Portal";

  return (
    <div className="min-h-screen bg-background">
      
      

      {/* Layout con Sidebar */}
      <div className="flex">
        {/* Sidebar Lateral - Academic Brutalism Style - Plegable */}
        <aside
          className={`bg-surface-container-high h-[calc(100vh-4rem)] sticky top-0 overflow-y-auto transition-all duration-300 ${
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
                  <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-on-surface-variant" />
                )}
              </button>
            </div>

            {!isSidebarCollapsed && !isActive(`/portal/${portalId}`) && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-1" style={{ fontFamily: 'Work Sans, sans-serif' }}>{portalName}</h2>
                <p className="text-xs text-on-surface-variant uppercase tracking-wide">Portal Académico</p>
              </div>
            )}
            {!isSidebarCollapsed && isActive(`/portal/${portalId}`) && (
              <div className="mb-8">
                <p className="text-xs text-on-surface-variant uppercase tracking-wide">Portal Académico</p>
              </div>
            )}

            <nav className="space-y-1">
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

              {!isMember && !hasRequest && (
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

              {!isMember && hasRequest && (
                <Link
                  to={`/portal/${portalId}/solicitud-estado`}
                  className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-2.5 rounded-sm transition-all relative ${
                    location.pathname.includes(`/portal/${portalId}/solicitud-estado`)
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-container-low"
                  }`}
                  title={isSidebarCollapsed ? 'Mi Solicitud' : ''}
                >
                  {location.pathname.includes(`/portal/${portalId}/solicitud-estado`) && !isSidebarCollapsed && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-sm" />
                  )}
                  <FileText className={`w-5 h-5 ${isSidebarCollapsed && location.pathname.includes(`/portal/${portalId}/solicitud-estado`) ? 'text-primary' : ''}`} />
                  {!isSidebarCollapsed && (
                    <span className="flex items-center gap-2">
                      Mi Solicitud
                      {requestStatus === 'pending' && (
                        <div className="w-2 h-2 rounded-full bg-yellow-500" title="Pendiente"></div>
                      )}
                      {requestStatus === 'rejected' && (
                        <div className="w-2 h-2 rounded-full bg-destructive" title="Rechazada"></div>
                      )}
                    </span>
                  )}
                </Link>
              )}

              {isAdmin && (
                <Link
                  to={`/portal/${portalId}/admin`}
                  className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-2.5 rounded-sm transition-all relative ${
                    isActive(`/portal/${portalId}/admin`)
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-container-low"
                  }`}
                  title={isSidebarCollapsed ? 'Administración' : ''}
                >
                  {isActive(`/portal/${portalId}/admin`) && !isSidebarCollapsed && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-sm" />
                  )}
                  <Shield className={`w-5 h-5 ${isSidebarCollapsed && isActive(`/portal/${portalId}/admin`) ? 'text-primary' : ''}`} />
                  {!isSidebarCollapsed && <span>Administración</span>}
                </Link>
              )}
            </nav>

            {/* Info del usuario en el portal */}
            {!isSidebarCollapsed && (
              <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(169, 180, 185, 0.15)' }}>
                <div className="text-xs text-on-surface-variant uppercase tracking-wide mb-2">Estado</div>
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
                <div className={`w-2 h-2 rounded-full ${isMember ? 'bg-primary' : 'bg-yellow-500'}`} title={isMember ? 'Miembro activo' : 'Invitado'}></div>
              </div>
            )}
          </div>
        </aside>

        {/* Contenido Principal */}
        <main className="flex-1">
          <Outlet context={{ isMember, isAdmin }} />
        </main>
      </div>
    </div>
  );
}