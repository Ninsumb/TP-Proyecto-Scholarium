// src/pages/Home.tsx
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Code, Search, UserPlus, BookOpen } from "lucide-react";
import { usuarioService } from "../../services/UsuarioService";
import type { UsuarioPortalResponse } from "../../types/DashboardPortals/UsuarioPortalResponse";

export function Home() {
  const [portales, setPortales] = useState<UsuarioPortalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userName = localStorage.getItem("userName") || "Usuario";

  useEffect(() => {
    const fetchPortales = async () => {
      try {
        setLoading(true);
        const data = await usuarioService.getMisPortales();
        setPortales(data);
      } catch (err) {
        console.error("Error al cargar portales:", err);
        setError("No se pudieron cargar los portales");
      } finally {
        setLoading(false);
      }
    };

    fetchPortales();
  }, []);

  const totalMiembros = portales.reduce((sum, p) => sum + p.cantidadMiembros, 0);

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
          to="/crear-portal"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-sm bg-surface-container-high text-foreground hover:bg-surface-container transition-all"
        >
          <UserPlus className="w-5 h-5" />
          Crear Nuevo Portal
        </Link>
      </div>

      {/* Portals Grid */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-6" style={{ fontFamily: 'Work Sans, sans-serif' }}>
          Mis Portales
        </h2>

        {loading ? (
          <div className="bg-surface-container-lowest p-12 text-center rounded-sm">
            <p className="text-muted-foreground">Cargando portales...</p>
          </div>
        ) : error ? (
          <div className="bg-surface-container-lowest p-12 text-center rounded-sm">
            <p className="text-destructive mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-sm transition-all"
              style={{ 
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 100%)',
                color: 'var(--primary-foreground)'
              }}
            >
              Reintentar
            </button>
          </div>
        ) : portales.length === 0 ? (
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
            {portales.map((portal) => (
              <Link
                key={portal.id}
                to={`/portal/${portal.id}`}
                className="bg-surface-container-lowest p-6 hover:shadow-lg transition-all group relative rounded-sm"
                style={{ boxShadow: '0 1px 3px rgba(58, 95, 148, 0.06)' }}
              >
                <div className="absolute top-4 right-4">
                  {portal.rol === "ADMIN" ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
                      Administrador
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                      Miembro
                    </span>
                  )}
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-500 p-3 rounded-sm group-hover:scale-105 transition-transform">
                    <Code className="w-6 h-6 text-white" />
                  </div>

                  <div className="flex-1 pr-20">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {portal.carrera}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {portal.universidad}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-foreground uppercase tracking-wide">
                      <BookOpen className="w-3 h-3" />
                      <span>{portal.cantidadMiembros} miembros</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest p-6 text-center rounded-sm">
          <div className="text-3xl font-bold text-primary mb-2">{portales.length}</div>
          <div className="text-sm text-foreground uppercase tracking-wide">Mis Portales</div>
        </div>
        <div className="bg-surface-container-lowest p-6 text-center rounded-sm">
          <div className="text-3xl font-bold text-primary mb-2">
            {totalMiembros.toLocaleString()}
          </div>
          <div className="text-sm text-foreground uppercase tracking-wide">Miembros Totales</div>
        </div>
        <div className="bg-surface-container-lowest p-6 text-center rounded-sm">
          <div className="text-3xl font-bold text-primary mb-2">24/7</div>
          <div className="text-sm text-foreground uppercase tracking-wide">Acceso Disponible</div>
        </div>
      </div>
    </div>
  );
}