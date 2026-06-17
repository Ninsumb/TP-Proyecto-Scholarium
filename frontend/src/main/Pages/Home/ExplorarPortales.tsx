// pages/Home/ExplorarPortales.tsx

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  Search, ArrowLeft, UserPlus, Loader2,
  SquareArrowLeft, SquareArrowRight, Plus, ArrowRight, Flag, Check
} from "lucide-react";
import { portalService } from "../../services/PortalService";
import type { PortalBusquedaDTO } from "../../types/Portales";
import { PortalAvatar } from "../../Components/common/PortalAvatar";

export function ExplorePortals() {
  const navigate = useNavigate();

  const [portales, setPortales] = useState<PortalBusquedaDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [universidadQuery, setUniversidadQuery] = useState<string>("");
  const [carreraQuery, setCarreraQuery] = useState<string>("");

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [filtroUniversidad, setFiltroUniversidad] = useState<string>("");
  const [filtroCarrera, setFiltroCarrera] = useState<string>("");

  // ─── Estado para el Modal de Denuncia ───
  const [denunciaModal, setDenunciaModal] = useState<{ isOpen: boolean; portalId: number | null }>({ isOpen: false, portalId: null });
  const [denunciaMotivo, setDenunciaMotivo] = useState<string>("");
  const [denunciaComentarios, setDenunciaComentarios] = useState<string>("");
  const [denunciaError, setDenunciaError] = useState<string | null>(null);
  const [denunciaSuccess, setDenunciaSuccess] = useState<string | null>(null); // <-- Nuevo estado de éxito
  const [isSubmittingDenuncia, setIsSubmittingDenuncia] = useState<boolean>(false);

  // Búsqueda con debounce — dispara fetchPortales cuando cambian los filtros
  useEffect(() => {
    fetchPortales(0);
  }, [filtroUniversidad, filtroCarrera]);

  // Debounce universidad
  useEffect(() => {
    const id = setTimeout(() => setFiltroUniversidad(universidadQuery), 500);
    return () => clearTimeout(id);
  }, [universidadQuery]);

  // Debounce carrera
  useEffect(() => {
    const id = setTimeout(() => setFiltroCarrera(carreraQuery), 500);
    return () => clearTimeout(id);
  }, [carreraQuery]);

  const fetchPortales = async (pagina: number) => {
    try {
      setLoading(true);
      const data = await portalService.getPortales(filtroUniversidad, filtroCarrera, pagina);
      setPortales(data.portales);
      setPage(data.page);
      setTotalPages(data.total);
    } catch (error) {
      console.error("Error al obtener portales:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevPage = () => {
    if (page > 0) fetchPortales(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) fetchPortales(page + 1);
  };

  // ─── Lógica para enviar denuncia ───
  const handleDenunciar = async () => {
    if (!denunciaModal.portalId || !denunciaMotivo.trim()) return;
    setIsSubmittingDenuncia(true);
    setDenunciaError(null);
    setDenunciaSuccess(null); 
    
    try {
      const response = await portalService.denunciarPortal(denunciaModal.portalId, {
        motivo: denunciaMotivo,
        comentarios: denunciaComentarios.trim() ? denunciaComentarios : undefined
      });
      setDenunciaSuccess(response.message); 
     
    } catch (error: unknown) {
      console.error("Error al enviar denuncia:", error);
      const axiosErr = error as { response?: { data?: { message?: string } } };
      const msg = axiosErr?.response?.data?.message ?? "Ocurrió un error al enviar la denuncia. Por favor intentá de nuevo.";
      setDenunciaError(msg);
    } finally {
      setIsSubmittingDenuncia(false);
    }
  };

  const closeDenunciaModal = () => {
    setDenunciaModal({ isOpen: false, portalId: null });
    setDenunciaMotivo("");
    setDenunciaComentarios("");
    setDenunciaError(null);
    setDenunciaSuccess(null); 
  };

  const sinResultados = !loading && portales.length === 0;

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
        <h1 className="text-3xl font-bold text-foreground mb-2">Explorar Portales</h1>
        <p className="text-muted-foreground">Encontrá tu comunidad académica</p>
      </div>

      {/* Búsquedas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por universidad..."
            value={universidadQuery}
            onChange={(e) => setUniversidadQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-foreground bg-surface-container-lowest border-2 border-black/5 rounded-sm focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por carrera..."
            value={carreraQuery}
            onChange={(e) => setCarreraQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-foreground bg-surface-container-lowest border-2 border-black/5 rounded-sm focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
      </div>

      {/* Grid de resultados */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin w-8 h-8 text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portales.map((portal) => (
            <div
              key={portal.id}
              className="flex flex-col bg-surface-container-lowest p-6 relative rounded-sm shadow-sm border border-black/5"
            >
              {/* Botón de denuncia */}
              <button
                onClick={() => setDenunciaModal({ isOpen: true, portalId: portal.id })}
                className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                title="Denunciar este portal"
              >
                <Flag className="w-4 h-4" />
              </button>

              <div className="flex items-start gap-4 mb-4 pr-6">
                <PortalAvatar
                  logoUrl={portal.logoUrl}
                  iconoPortal={portal.iconoPortal}
                  colorPortal={portal.colorPortal}
                  carrera={portal.carrera}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">{portal.carrera}</h3>
                  <p className="text-sm text-muted-foreground">{portal.universidad}</p>
                  {portal.unidadAcademica && (
                    <p className="text-xs text-muted-foreground">{portal.unidadAcademica}</p>
                  )}
                  {portal.descripcion && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {portal.descripcion}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    <span>{portal.estudiantes} {portal.estudiantes === 1 ? "estudiante" : "estudiantes"}</span>
                  </div>
                </div>
              </div>

              <div className="grow" />

              <div className="mt-4">
                {portal.tipoAcceso === "ABIERTO" ? (
                  <button
                    onClick={() => navigate(`/portal/${portal.id}`)}
                    className="w-full py-2 flex items-center justify-center gap-2 text-sm rounded-sm transition-all"
                    style={{
                      background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 100%)",
                      color: "var(--primary-foreground)",
                    }}
                  >
                    <ArrowRight className="w-4 h-4" />
                    Ir al portal
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/portal/${portal.id}/solicitud`)}
                    className="w-full py-2 flex items-center justify-center gap-2 text-sm rounded-sm transition-all"
                    style={{
                      background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 100%)",
                      color: "var(--primary-foreground)",
                    }}
                  >
                    <UserPlus className="w-4 h-4" />
                    Solicitar acceso
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estado vacío: sin resultados */}
      {sinResultados && (
        <div className="bg-surface-container-lowest p-10 rounded-sm text-center">
          <p className="text-foreground mb-2">
            No se encontraron portales con esos criterios de búsqueda.
          </p>
          <p className="text-muted-foreground text-sm mb-6">
            Si el portal de tu carrera no existe todavía, podés crearlo vos.
          </p>
          <Link
            to="/crear-portal"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-sm transition-all font-medium"
            style={{
              background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 100%)",
              color: "var(--primary-foreground)",
            }}
          >
            <Plus className="w-4 h-4" />
            Crear el portal de mi carrera
          </Link>
        </div>
      )}

      {/* Paginación */}
      {!sinResultados && (
        <div className="p-4 my-8 bg-surface-container-lowest rounded-sm">
          <p className="flex items-center justify-center text-foreground gap-2">
            <button onClick={handlePrevPage} disabled={page === 0} className="disabled:opacity-30">
              <SquareArrowLeft className="text-foreground" />
            </button>
            Página {page + 1} de {totalPages || 1}
            <button onClick={handleNextPage} disabled={page >= totalPages - 1} className="disabled:opacity-30">
              <SquareArrowRight className="text-foreground" />
            </button>
          </p>
        </div>
      )}

      {/* Botón de crear portal siempre visible al fondo */}
      {!sinResultados && !loading && (
        <div
          className="pt-6 text-center"
          style={{ borderTop: "1px solid rgba(169, 180, 185, 0.1)" }}
        >
          <p className="text-sm text-muted-foreground mb-3">
            ¿No encontrás el portal de tu carrera?
          </p>
          <Link
            to="/crear-portal"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm text-sm font-medium bg-surface-container-high text-foreground hover:bg-surface-container transition-colors"
          >
            <Plus className="w-4 h-4" />
            Crear nuevo portal
          </Link>
        </div>
      )}

      {/* ─── Modal de Denuncia ─── */}
      {denunciaModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-sm shadow-xl p-6 relative">
            <h2 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
              <Flag className="w-5 h-5 text-destructive" />
              Denunciar Portal
            </h2>
            
            {denunciaSuccess ? (
              // ─── ESTADO DE ÉXITO ───
              <>
                <div className="mb-6 mt-4 p-4 text-sm text-green-700 bg-green-600/10 border border-green-600/25 rounded-sm font-medium flex flex-col items-center text-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-600/20 flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <p>{denunciaSuccess}</p>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={closeDenunciaModal}
                    className="px-5 py-2.5 text-sm font-medium text-foreground bg-surface-container hover:bg-surface-container-high border border-black/10 rounded-sm transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </>
            ) : (
              // ─── ESTADO DE FORMULARIO ───
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Por favor, contanos por qué estás denunciando este portal. Nuestro equipo de moderación revisará el caso.
                </p>
                
                {/* Mensaje de error controlado en rojo si viene del back */}
                {denunciaError && (
                  <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/25 rounded-sm font-medium">
                    {denunciaError}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Motivo principal <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={denunciaMotivo}
                      onChange={(e) => setDenunciaMotivo(e.target.value)}
                      className="w-full p-2.5 text-sm bg-surface-container border border-black/10 rounded-sm outline-none focus:ring-2 focus:ring-primary text-foreground"
                    >
                      <option value="" disabled>Seleccioná un motivo...</option>
                      <option value="Contenido inapropiado u ofensivo">Contenido inapropiado u ofensivo</option>
                      <option value="Spam o publicidad engañosa">Spam o publicidad engañosa</option>
                      <option value="Nombre o información falsa">Nombre o información falsa</option>
                      <option value="Suplantación de identidad institucional">Suplantación de identidad institucional</option>
                      <option value="Otro motivo">Otro motivo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Comentarios adicionales (opcional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Añadí más detalles sobre la denuncia..."
                      value={denunciaComentarios}
                      onChange={(e) => setDenunciaComentarios(e.target.value)}
                      className="w-full p-2.5 text-sm bg-surface-container border border-black/10 rounded-sm outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={closeDenunciaModal}
                    disabled={isSubmittingDenuncia}
                    className="px-4 py-2 text-sm font-medium text-foreground border border-black/10 rounded-sm hover:bg-surface-container transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDenunciar}
                    disabled={!denunciaMotivo || isSubmittingDenuncia}
                    className="px-4 py-2 text-sm font-medium rounded-sm flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isSubmittingDenuncia && <Loader2 className="w-4 h-4 animate-spin" />}
                    Enviar denuncia
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}