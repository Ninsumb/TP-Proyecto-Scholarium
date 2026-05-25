import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { 
  GraduationCap, BookOpen, Code, Briefcase, FlaskConical, 
  Calculator, Languages, Search, ArrowLeft, ArrowRight, UserPlus, Loader2, SquareArrowLeft, SquareArrowRight,
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
  const [filteredPortals, setFilteredPortals] = useState<Portal[]>([])
  const [loading, setLoading] = useState<boolean>(true);
  const [universidadSearchQuery, setUniversidadSearchQuery] = useState<string>("");
  const [carreraSearchQuery, setCarreraSearchQuery] = useState<string>("");

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [filtroUniversidad, setFiltroUniversidad] = useState<string>(""); 
  const [filtroCarrera, setFiltroCarrera] = useState<string>("");

  useEffect(() => {
    fetchPortales(0);
  }, [filtroUniversidad, filtroCarrera]);

  useEffect(()=>{
    console.log("FILTERED PORTALS:")
    console.log(portales)
  }, [portales])

  const fetchPortales = async (pagina: number) => {
      try {
        setLoading(true);
       
        const data = await portalService.getPortales(filtroUniversidad, filtroCarrera, pagina);
        console.log("DATA:")
        console.log(data)

        setPortales(data.portales)
        setFilteredPortals(data.portales);
        setPage(data.page)
        setTotalPages(data.total)
        
        /*
        setFilteredPortals(portales.filter(portal =>
          portal.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          portal.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
        ))
        */
          
        //setFilteredPortals(portales)
      } catch (error) {
        console.error("Error al obtener portales del backend:", error);
      } finally {
        setLoading(false);
      }
    };

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

  const handlePrevPage = (e:any) => {
    if (page > 0) 
      fetchPortales(page-1)
  }

  const handleNextPage = (e:any) => {
    if (page < totalPages-1)
      fetchPortales(page+1)
  }

  useEffect(() => {
    const delayInputTimeoutId = setTimeout(() => {
      setFiltroCarrera(carreraSearchQuery);
    }, 500);
    return () => clearTimeout(delayInputTimeoutId);
  }, [carreraSearchQuery, 500]);

  useEffect(() => {
    const delayInputTimeoutId = setTimeout(() => {
      setFiltroUniversidad(universidadSearchQuery);
    }, 500);
    return () => clearTimeout(delayInputTimeoutId);
  }, [universidadSearchQuery, 500]);



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
          placeholder="Buscar por universidad..."
          value={universidadSearchQuery}
          onChange={(e) => setUniversidadSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 text-foreground bg-surface-container-lowest border-2 border-black/5 rounded-sm focus:ring-2 focus:ring-primary outline-none"
        />
      </div>

      <div className="mb-8 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por carrera..."
          value={carreraSearchQuery}
          onChange={(e) => setCarreraSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 text-foreground bg-surface-container-lowest border-2 border-black/5 rounded-sm focus:ring-2 focus:ring-primary outline-none"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {
          filteredPortals.map((portal) => {
            const Icon = ICON_MAP[portal.icon] || GraduationCap;
            const status = getPortalStatus(portal.id);

            return (
              <div key={portal.id} className="flex flex-col bg-surface-container-lowest p-6 relative rounded-sm shadow-sm border border-black/5">
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
                    <h3 className="font-semibold">{portal.carrera}</h3>
                    <h4 className="font-semibold">
                      <BookOpen className="w-6 h-6 inline p-1" />
                      {portal.universidad}
                      </h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">{portal.descripcion}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase">
                      <BookOpen className="w-3 h-3" />
                      {portal.estudiantes} Estudiantes
                    </div>
                  </div>
                </div>

                <div className="grow"/>

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
          })
          }
        </div>
      )}

      {filteredPortals.length == 0 && (
        <div className="bg-surface-container-lowest p-2">
          <p className="text-foreground text-center">No se encontraron resultados con los filtros ingresados.</p>
        </div>
      )}

      <div className="p-4 my-8 bg-surface-container-lowest">
        <p className="flex items-center justify-center text-foreground">
          <button onClick={handlePrevPage} className="px-2">
            <SquareArrowLeft className={page > 0 ? "text-foreground" : "text-secondary"}/>
          </button>
          Pagina {page+1}
          <button onClick={handleNextPage} className="px-2">
            <SquareArrowRight className={page < totalPages-1 ? "text-foreground" : "text-secondary"}/>
            </button>
        </p>
      </div>
    </div>
  );
}