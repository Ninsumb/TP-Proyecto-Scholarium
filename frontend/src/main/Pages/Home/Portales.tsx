import { Link, useNavigate } from "react-router-dom";
import { Code, Briefcase, FlaskConical, Calculator, Languages, GraduationCap, BookOpen, Search, UserPlus } from "lucide-react";

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

//OJO QUE TODA ESTA LÓGICA ESTÁ SACADA DE FIGMA Y ESTA RE MAL 

export function Home() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "Usuario";

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

  // Filtrar solo los portales de los que soy miembro
  const myPortals = portales.filter(portal => 
    userPortals.includes(portal.id) || adminPortals.includes(portal.id)
  );

  const getPortalStatus = (portalId: string) => {
    if (adminPortals.includes(portalId)) return "admin";
    if (userPortals.includes(portalId)) return "miembro";
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Welcome Section */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-foreground mb-2" style={{ fontFamily: 'Work Sans, sans-serif' }}>
          Bienvenido, {userName.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground">
          Selecciona un portal de carrera para acceder a materiales, foros y recursos académicos
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mb-8 flex flex-wrap gap-4">
        <Link
          to="/explorar-portales"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-sm transition-all"
          style={{ 
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 100%)',
            color: 'var(--primary-foreground)'
          }}
        >
          <Search className="w-5 h-5" />
          Explorar Portales Universitarios
        </Link>
        
        <Link
          to="/nuevo-portal"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-sm bg-surface-container-high text-foreground hover:bg-surface-container transition-all"
        >
          <UserPlus className="w-5 h-5" />
          Crear Nuevo Portal
        </Link>
      </div>

      {/* Portals Grid */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-6" style={{ fontFamily: 'Work Sans, sans-serif' }}>Mis Portales</h2>
        {myPortals.length === 0 ? (
          <div className="bg-surface-container-lowest p-12 text-center rounded-sm">
            <p className="text-muted-foreground mb-4">
              Aún no eres miembro de ningún portal universitario
            </p>
            <Link
              to="/explorar-portales"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-sm transition-all"
              style={{ 
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 100%)',
                color: 'var(--primary-foreground)'
              }}
            >
              <Search className="w-5 h-5" />
              Explorar Portales
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myPortals.map((portal) => {
              const Icon = portal.icon;
              const status = getPortalStatus(portal.id);
              return (
                <Link
                  key={portal.id}
                  to={`/portal/${portal.id}`}
                  className="bg-surface-container-lowest p-6 hover:shadow-lg transition-all group relative rounded-sm"
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
                  <div className="flex items-start gap-4">
                    <div className={`${portal.color} p-3 rounded-sm group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 pr-20">
                      <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
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
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest p-6 text-center rounded-sm">
          <div className="text-3xl font-bold text-primary mb-2">{myPortals.length}</div>
          <div className="text-sm text-on-surface-variant uppercase tracking-wide">Mis Portales</div>
        </div>
        <div className="bg-surface-container-lowest p-6 text-center rounded-sm">
          <div className="text-3xl font-bold text-primary mb-2">
            {portales.reduce((sum, p) => sum + p.estudiantes, 0).toLocaleString()}
          </div>
          <div className="text-sm text-on-surface-variant uppercase tracking-wide">Estudiantes Activos</div>
        </div>
        <div className="bg-surface-container-lowest p-6 text-center rounded-sm">
          <div className="text-3xl font-bold text-primary mb-2">24/7</div>
          <div className="text-sm text-on-surface-variant uppercase tracking-wide">Acceso Disponible</div>
        </div>
      </div>
    </div>
  );
}