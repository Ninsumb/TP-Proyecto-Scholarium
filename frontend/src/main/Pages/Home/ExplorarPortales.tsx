import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { GraduationCap, BookOpen, Code, Briefcase, FlaskConical, Calculator, Languages, Search, ArrowLeft, UserPlus } from "lucide-react";

const portales = [
  {
    id: "ingenieria-informatica",
    nombre: "Ingeniería Informática",
    descripcion: "Sistemas, programación y desarrollo de software",
    icon: Code,
    color: "bg-blue-500",
    estudiantes: 1250,
  },
  {
    id: "administracion",
    nombre: "Administración de Empresas",
    descripcion: "Gestión, finanzas y desarrollo organizacional",
    icon: Briefcase,
    color: "bg-green-500",
    estudiantes: 980,
  },
  {
    id: "ingenieria-quimica",
    nombre: "Ingeniería Química",
    descripcion: "Procesos químicos y desarrollo industrial",
    icon: FlaskConical,
    color: "bg-purple-500",
    estudiantes: 650,
  },
  {
    id: "matematicas",
    nombre: "Matemáticas",
    descripcion: "Análisis matemático y aplicaciones",
    icon: Calculator,
    color: "bg-orange-500",
    estudiantes: 420,
  },
  {
    id: "letras",
    nombre: "Letras",
    descripcion: "Literatura, lingüística y análisis textual",
    icon: Languages,
    color: "bg-pink-500",
    estudiantes: 530,
  },
  {
    id: "medicina",
    nombre: "Medicina",
    descripcion: "Ciencias de la salud y práctica médica",
    icon: GraduationCap,
    color: "bg-red-500",
    estudiantes: 1450,
  },
];

export function ExplorePortals() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Obtener datos de membresía
  const getUserPortals = () => {
    const stored = localStorage.getItem("userPortals");
    return stored ? JSON.parse(stored) : ["ingenieria-informatica"];
  };

  const getAdminPortals = () => {
    const stored = localStorage.getItem("adminPortals");
    return stored ? JSON.parse(stored) : ["ingenieria-informatica"];
  };

  const userPortals = getUserPortals();
  const adminPortals = getAdminPortals();

  const getPortalStatus = (portalId: string) => {
    if (adminPortals.includes(portalId)) return "admin";
    if (userPortals.includes(portalId)) return "miembro";
    return null;
  };

  // Filtrar portales por búsqueda
  const filteredPortals = portales.filter(portal =>
    portal.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    portal.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRequestAccess = (portalId: string) => {
    navigate(`/portal/${portalId}/solicitud`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        to="/home"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a Mis Portales
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2" style={{ fontFamily: 'Work Sans, sans-serif' }}>
          Explorar Portales Universitarios
        </h1>
        <p className="text-muted-foreground">
          Busca y solicita acceso a diferentes portales de carreras creados por la comunidad académica
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest text-foreground rounded-sm focus:outline-none focus:ring-2 focus:ring-primary"
            style={{ border: '2px solid rgba(169, 180, 185, 0.15)' }}
          />
        </div>
      </div>

      {/* Portals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPortals.map((portal) => {
          const Icon = portal.icon;
          const status = getPortalStatus(portal.id);
          const isMember = status !== null;

          return (
            <div
              key={portal.id}
              className="bg-surface-container-lowest p-6 hover:shadow-lg transition-all relative rounded-sm"
              style={{ boxShadow: '0 1px 3px rgba(58, 95, 148, 0.06)' }}
            >
              {/* Badge de estado en la esquina */}
              {status && (
                <div className="absolute top-4 right-4">
                  {status === "admin" ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
                      Administrador
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                      Miembro
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-start gap-4 mb-4">
                <div className={`${portal.color} p-3 rounded-sm`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 pr-20">
                  <h3 className="font-semibold text-foreground mb-1">
                    {portal.nombre}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {portal.descripcion}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant uppercase tracking-wide">
                    <BookOpen className="w-3 h-3" />
                    <span>{portal.estudiantes} estudiantes</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {isMember ? (
                  <Link
                    to={`/portal/${portal.id}`}
                    className="flex-1 px-4 py-2 text-center text-sm rounded-sm transition-all"
                    style={{ 
                      background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 100%)',
                      color: 'var(--primary-foreground)'
                    }}
                  >
                    Ir al Portal
                  </Link>
                ) : (
                  <button
                    onClick={() => handleRequestAccess(portal.id)}
                    className="flex-1 px-4 py-2 text-sm rounded-sm transition-all flex items-center justify-center gap-2"
                    style={{ 
                      background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 100%)',
                      color: 'var(--primary-foreground)'
                    }}
                  >
                    <UserPlus className="w-4 h-4" />
                    Solicitar Acceso
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredPortals.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No se encontraron portales que coincidan con tu búsqueda
        </div>
      )}
    </div>
  );
}
