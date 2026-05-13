import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { 
  GraduationCap, BookOpen, Code, Briefcase, FlaskConical, 
  Calculator, Languages, Search, ArrowLeft, UserPlus, Loader2,
  type LucideIcon
} from "lucide-react";
import { portalService } from "../../services/PortalService";
import type { Portal } from "../../types/Portales";


const ICON_MAP: Record<string, LucideIcon> = {
  "GraduationCap": GraduationCap,
  "BookOpen": BookOpen,
  "Code": Code,
  "Briefcase": Briefcase,
  "FlaskConical": FlaskConical,
  "Calculator": Calculator,
  "Languages": Languages,
};

export function ExplorePortals() {
  const navigate = useNavigate();
  

  const [portales, setPortales] = useState<Portal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");


  const [filtroUniversidad] = useState<string>(""); 
  const [filtroCarrera] = useState<string>("");

  useEffect(() => {
    const fetchPortales = async () => {
      try {
        setLoading(true);
       
        const data = await portalService.getPortales(filtroUniversidad, filtroCarrera);
        setPortales(data.portales);
      } catch (error) {
        console.error("Error al obtener portales del backend:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortales();
  }, [filtroUniversidad, filtroCarrera]);

  const getUserPortals = (): string[] => {
    const stored = localStorage.getItem("userPortals");
    return stored ? JSON.parse(stored) : [];
  };

  const getAdminPortals = (): string[] => {
    const stored = localStorage.getItem("adminPortals");
    return stored ? JSON.parse(stored) : [];
  };

  const getPortalStatus = (portalId: string): "admin" | "miembro" | null => {
    if (getAdminPortals().includes(portalId)) return "admin";
    if (getUserPortals().includes(portalId)) return "miembro";
    return null;
  };

  const filteredPortals = portales.filter(portal =>
    portal.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    portal.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/home" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Volver a Mis Portales
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Explorar Portales</h1>
        <p className="text-muted-foreground">Encuentra tu comunidad académica</p>
      </div>

      <div className="mb-8 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Filtrar resultados..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border-2 border-black/5 rounded-sm focus:ring-2 focus:ring-primary outline-none"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPortals.map((portal) => {
            const Icon = ICON_MAP[portal.icon] || GraduationCap;
            const status = getPortalStatus(portal.id);

            return (
              <div key={portal.id} className="bg-surface-container-lowest p-6 relative rounded-sm shadow-sm border border-black/5">
                {status && (
                  <span className={`absolute top-4 right-4 px-2 py-1 text-xs font-medium rounded-sm ${
                    status === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {status === 'admin' ? 'Admin' : 'Miembro'}
                  </span>
                )}

                <div className="flex items-start gap-4 mb-4">
                  <div className={`${portal.color} p-3 rounded-sm`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{portal.nombre}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{portal.descripcion}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase">
                      <BookOpen className="w-3 h-3" />
                      {portal.estudiantes} Estudiantes
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  {status ? (
                    <Link to={`/portal/${portal.id}`} className="block w-full py-2 text-center text-sm bg-primary text-white rounded-sm">
                      Entrar
                    </Link>
                  ) : (
                    <button 
                      onClick={() => navigate(`/portal/${portal.id}/solicitud`)}
                      className="w-full py-2 flex items-center justify-center gap-2 text-sm bg-primary text-white rounded-sm"
                    >
                      <UserPlus className="w-4 h-4" /> Solicitar Acceso
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}