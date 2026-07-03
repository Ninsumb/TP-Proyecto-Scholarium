// pages/Home/ExplorarPortales.tsx

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  Search, ArrowLeft, UserPlus, Loader2,
  Plus, ArrowRight, Flag, Check,
  BookOpen, Building2, Lock, ChevronLeft, ChevronRight, Users
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
  const [denunciaSuccess, setDenunciaSuccess] = useState<string | null>(null);
  const [isSubmittingDenuncia, setIsSubmittingDenuncia] = useState<boolean>(false);

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

  // Fetch cuando cambian los filtros
  useEffect(() => {
    fetchPortales(0);
  }, [filtroUniversidad, filtroCarrera]);

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

  const handlePrevPage = () => { if (page > 0) fetchPortales(page - 1); };
  const handleNextPage = () => { if (page < totalPages - 1) fetchPortales(page + 1); };

  // ─── Denuncia ───
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

  const hayFiltrosActivos = universidadQuery.trim() !== "" || carreraQuery.trim() !== "";
  const sinResultados = !loading && portales.length === 0;

  return (
    <div className="explorar-root">

      {/* ─── HERO BAND ─── */}
      <div className="explorar-hero">
        <div className="paper-grid" aria-hidden="true" />
        <div className="explorar-hero-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <Link to="/home" className="back-link">
            <ArrowLeft className="w-4 h-4" />
            Mis Portales
          </Link>

          <div className="hero-copy">
            <h1 className="explorar-heading">Explorar Portales</h1>
            <p className="explorar-sub">
              Encontrá la comunidad de tu carrera, o creá una si todavía no existe.
            </p>
          </div>

          {/* ── Panel de búsqueda ── */}
          <div className="search-panel">
            {/* Campo Universidad */}
            <div className="search-field-wrap">
              <label className="search-label" htmlFor="buscar-universidad">
                <Building2 className="search-label-icon" />
                Universidad
              </label>
              <div className="search-input-wrap">
                <Search className="search-input-icon" />
                <input
                  id="buscar-universidad"
                  type="text"
                  placeholder="ej. UBA, UNSAM, UTN..."
                  value={universidadQuery}
                  onChange={(e) => setUniversidadQuery(e.target.value)}
                  className="search-input"
                />
                {universidadQuery && (
                  <button
                    className="search-clear"
                    onClick={() => setUniversidadQuery("")}
                    aria-label="Limpiar búsqueda de universidad"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Divisor */}
            <div className="search-divider" aria-hidden="true" />

            {/* Campo Carrera */}
            <div className="search-field-wrap">
              <label className="search-label" htmlFor="buscar-carrera">
                <BookOpen className="search-label-icon" />
                Carrera
              </label>
              <div className="search-input-wrap">
                <Search className="search-input-icon" />
                <input
                  id="buscar-carrera"
                  type="text"
                  placeholder="ej. Informática, Derecho, Medicina..."
                  value={carreraQuery}
                  onChange={(e) => setCarreraQuery(e.target.value)}
                  className="search-input"
                />
                {carreraQuery && (
                  <button
                    className="search-clear"
                    onClick={() => setCarreraQuery("")}
                    aria-label="Limpiar búsqueda de carrera"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Pill de resultados */}
          {!loading && (
            <div className="results-pill">
              {hayFiltrosActivos
                ? `${portales.length === 0 ? "Sin" : portales.length} resultado${portales.length !== 1 ? "s" : ""} para tu búsqueda`
                : `${portales.length} portal${portales.length !== 1 ? "es" : ""} disponible${portales.length !== 1 ? "s" : ""}`}
            </div>
          )}
        </div>
      </div>

      {/* ─── CONTENIDO ─── */}
      <div className="explorar-body max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Loading */}
        {loading && (
          <div className="explorar-loading">
            <div className="explorar-spinner">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <p className="explorar-loading-text">Buscando portales...</p>
          </div>
        )}

        {/* Sin resultados */}
        {sinResultados && (
          <div className="empty-state">
            <div className="empty-illo" aria-hidden="true">
              <Search className="empty-illo-icon" />
              <div className="empty-dots"><span /><span /><span /></div>
            </div>
            <h2 className="empty-title">
              {hayFiltrosActivos
                ? "No encontramos portales con esa búsqueda"
                : "No hay portales todavía"}
            </h2>
            <p className="empty-sub">
              {hayFiltrosActivos
                ? "Probá con otros términos, o creá el portal de tu carrera si todavía no existe."
                : "Sé el primero en crear una comunidad académica para tu carrera."}
            </p>
            <Link to="/crear-portal" className="btn-primary">
              <Plus className="w-4 h-4" />
              Crear el portal de mi carrera
            </Link>
          </div>
        )}

        {/* Grid */}
        {!loading && portales.length > 0 && (
          <>
            <div className="portales-grid">
              {portales.map((portal, index) => (
                <div
                  key={portal.id}
                  className="pcard"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  {/* Franja lateral con colorPortal */}
                  <div
                    className="pcard-stripe"
                    style={{ background: portal.colorPortal ?? "#3a5f94" }}
                  />

                  <div className="pcard-body">
                    {/* Header: avatar + info + flag */}
                    <div className="pcard-header">
                      <PortalAvatar
                        logoUrl={portal.logoUrl}
                        iconoPortal={portal.iconoPortal}
                        colorPortal={portal.colorPortal}
                        carrera={portal.carrera}
                        size="md"
                        className="pcard-avatar"
                      />
                      <div className="pcard-info">
                        <h3 className="pcard-name">{portal.carrera}</h3>
                        <p className="pcard-university">{portal.universidad}</p>
                        {portal.unidadAcademica && (
                          <p className="pcard-faculty">{portal.unidadAcademica}</p>
                        )}
                      </div>
                      <button
                        onClick={() => setDenunciaModal({ isOpen: true, portalId: portal.id })}
                        className="pcard-flag"
                        title="Denunciar este portal"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Descripción */}
                    {portal.descripcion && (
                      <p className="pcard-desc">{portal.descripcion}</p>
                    )}

                    {/* Metadatos */}
                    <div className="pcard-meta">
                      <span className="pcard-meta-item">
                        <Users className="w-3.5 h-3.5" />
                        {portal.estudiantes} {portal.estudiantes === 1 ? "estudiante" : "estudiantes"}
                      </span>
                      {portal.tipoAcceso === "CERRADO" && (
                        <span className="pcard-meta-item pcard-meta-item--cerrado">
                          <Lock className="w-3 h-3" />
                          Acceso con solicitud
                        </span>
                      )}
                    </div>

                    {/* CTA — diferenciado por tipo de acceso */}
                    {portal.tipoAcceso === "ABIERTO" ? (
                      <button
                        onClick={() => navigate(`/portal/${portal.id}`)}
                        className="pcard-cta pcard-cta--open"
                      >
                        <ArrowRight className="w-4 h-4" />
                        Ir al portal
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/portal/${portal.id}/solicitud`)}
                        className="pcard-cta pcard-cta--closed"
                      >
                        <UserPlus className="w-4 h-4" />
                        Solicitar acceso
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 0}
                  className="pagination-btn"
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="pagination-pages">
                  {[...Array(totalPages)].map((_, i) => {
                    // Muestra solo páginas cercanas a la actual
                    const dist = Math.abs(i - page);
                    if (dist > 2 && i !== 0 && i !== totalPages - 1) {
                      if (dist === 3) return <span key={i} className="pagination-ellipsis">…</span>;
                      return null;
                    }
                    return (
                      <button
                        key={i}
                        onClick={() => fetchPortales(i)}
                        className={`pagination-page ${i === page ? "pagination-page--active" : ""}`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={page >= totalPages - 1}
                  className="pagination-btn"
                  aria-label="Página siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Footer CTA — crear portal */}
            <div className="footer-cta">
              <p className="footer-cta-text">¿No encontrás el portal de tu carrera?</p>
              <Link to="/crear-portal" className="btn-ghost">
                <Plus className="w-4 h-4" />
                Crear nuevo portal
              </Link>
            </div>
          </>
        )}
      </div>

      {/* ─── Modal de Denuncia ─── */}
      {denunciaModal.isOpen && (
        <div
          className="modal-backdrop"
          onClick={(e) => { if (e.target === e.currentTarget) closeDenunciaModal(); }}
        >
          <div className="modal-box">
            <h2 className="modal-title">
              <Flag className="w-4 h-4 modal-title-icon" />
              Denunciar Portal
            </h2>

            {denunciaSuccess ? (
              <div className="modal-success">
                <div className="modal-success-icon">
                  <Check className="w-5 h-5" />
                </div>
                <p className="modal-success-text">{denunciaSuccess}</p>
                <button onClick={closeDenunciaModal} className="btn-ghost modal-close-btn">
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                <p className="modal-sub">
                  Contanos por qué estás denunciando este portal. Nuestro equipo de moderación revisará el caso.
                </p>

                {denunciaError && (
                  <div className="modal-error">{denunciaError}</div>
                )}

                <div className="modal-fields">
                  <div>
                    <label className="field-label" htmlFor="denuncia-motivo">
                      Motivo principal <span className="field-required">*</span>
                    </label>
                    <select
                      id="denuncia-motivo"
                      value={denunciaMotivo}
                      onChange={(e) => setDenunciaMotivo(e.target.value)}
                      className="field-select"
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
                    <label className="field-label" htmlFor="denuncia-comentarios">
                      Comentarios adicionales{" "}
                      <span className="field-optional">(opcional)</span>
                    </label>
                    <textarea
                      id="denuncia-comentarios"
                      rows={3}
                      placeholder="Añadí más detalles sobre la denuncia..."
                      value={denunciaComentarios}
                      onChange={(e) => setDenunciaComentarios(e.target.value)}
                      className="field-textarea"
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    onClick={closeDenunciaModal}
                    disabled={isSubmittingDenuncia}
                    className="btn-ghost"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDenunciar}
                    disabled={!denunciaMotivo || isSubmittingDenuncia}
                    className="btn-destructive"
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

      {/* ─── STYLES ─── */}
      <style>{`
        /* ── Tokens ── */
        .explorar-root {
          --navy:     #2c4456;
          --navy-dim: #1f3240;
          --amber:    #d4930f;
          --paper:    #f7f4ef;
          --ink:      #1e2a30;
          --ink-soft: #566166;
          --surface:  #ffffff;
          --r-card:   0.75rem;
          --r-pill:   999px;
          --sh-card:  0 2px 8px rgba(44,68,86,.08), 0 0 0 1px rgba(44,68,86,.06);
          --sh-hover: 0 12px 32px rgba(44,68,86,.15), 0 0 0 1px rgba(44,68,86,.10);
          background: var(--paper);
          min-height: 100vh;
        }

        /* ── Hero band ── */
        .explorar-hero {
          position: relative;
          background: linear-gradient(140deg, var(--navy) 0%, #1a2e3d 100%);
          overflow: hidden;
          padding: 2.5rem 0 0;
        }

        .paper-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }

        .explorar-hero-inner {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: .4rem;
          font-size: .8rem;
          font-weight: 600;
          color: rgba(255,255,255,.55);
          text-decoration: none;
          letter-spacing: .02em;
          transition: color .15s ease;
          width: fit-content;
        }
        .back-link:hover { color: rgba(255,255,255,.9); }

        .hero-copy { animation: fadeUp .5s cubic-bezier(.16,1,.3,1) both; }

        .explorar-heading {
          font-family: 'Work Sans', sans-serif;
          font-size: clamp(1.7rem, 4vw, 2.6rem);
          font-weight: 700;
          color: #fff;
          margin: 0 0 .4rem;
          letter-spacing: -.025em;
          line-height: 1.15;
        }

        .explorar-sub {
          font-size: .97rem;
          color: rgba(255,255,255,.65);
          margin: 0;
          line-height: 1.6;
        }

        /* ── Search panel ── */
        .search-panel {
          display: flex;
          align-items: stretch;
          background: rgba(255,255,255,.09);
          border: 1px solid rgba(255,255,255,.14);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: .625rem .625rem 0 0;
          overflow: hidden;
          animation: fadeUp .5s .1s cubic-bezier(.16,1,.3,1) both;
          margin-top: .25rem;
        }

        .search-field-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 1rem 1.25rem 1.1rem;
          min-width: 0;
        }

        .search-label {
          display: flex;
          align-items: center;
          gap: .35rem;
          font-size: .68rem;
          font-weight: 700;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: rgba(255,255,255,.5);
          margin-bottom: .45rem;
        }

        .search-label-icon { width: 11px; height: 11px; }

        .search-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-input-icon {
          position: absolute;
          left: 0;
          width: 15px; height: 15px;
          color: rgba(255,255,255,.4);
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          padding: .15rem 1.6rem .15rem 1.4rem;
          font-size: .95rem;
          font-weight: 500;
          color: #fff;
          font-family: 'Inter', sans-serif;
        }

        .search-input::placeholder { color: rgba(255,255,255,.35); }

        .search-clear {
          position: absolute;
          right: 0;
          background: none;
          border: none;
          color: rgba(255,255,255,.45);
          font-size: 1.1rem;
          line-height: 1;
          cursor: pointer;
          padding: 0 .15rem;
          transition: color .15s ease;
        }
        .search-clear:hover { color: rgba(255,255,255,.85); }

        .search-divider {
          width: 1px;
          background: rgba(255,255,255,.12);
          margin: .75rem 0;
        }

        /* Pill de resultados */
        .results-pill {
          align-self: flex-end;
          display: inline-flex;
          padding: .3rem .85rem;
          background: rgba(245,200,66,.15);
          border: 1px solid rgba(245,200,66,.25);
          border-radius: var(--r-pill) var(--r-pill) 0 0;
          font-size: .72rem;
          font-weight: 700;
          color: #f5c842;
          letter-spacing: .04em;
          animation: fadeUp .4s .2s cubic-bezier(.16,1,.3,1) both;
        }

        /* ── Body ── */
        .explorar-body { min-height: 40vh; }

        /* Loading */
        .explorar-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 5rem 0;
        }

        .explorar-spinner {
          color: var(--navy);
          opacity: .5;
        }

        .explorar-loading-text {
          font-size: .875rem;
          color: var(--ink-soft);
          margin: 0;
        }

        /* ── Portal grid ── */
        .portales-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.1rem;
          margin-bottom: 2rem;
        }

        /* ── Portal card ── */
        .pcard {
          display: flex;
          background: var(--surface);
          border-radius: var(--r-card);
          box-shadow: var(--sh-card);
          overflow: hidden;
          transition: transform .22s cubic-bezier(.16,1,.3,1), box-shadow .22s ease;
          animation: cardIn .4s cubic-bezier(.16,1,.3,1) both;
        }
        .pcard:hover {
          transform: translateY(-3px);
          box-shadow: var(--sh-hover);
        }

        .pcard-stripe {
          width: 5px;
          flex-shrink: 0;
          transition: width .18s ease;
        }
        .pcard:hover .pcard-stripe { width: 7px; }

        .pcard-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: .7rem;
          padding: 1.1rem 1.15rem 1rem;
          min-width: 0;
        }

        .pcard-header {
          display: flex;
          align-items: flex-start;
          gap: .85rem;
        }

        .pcard-avatar {
          flex-shrink: 0;
          transition: transform .2s ease;
        }
        .pcard:hover .pcard-avatar { transform: scale(1.05); }

        .pcard-info {
          flex: 1;
          min-width: 0;
        }

        .pcard-name {
          font-family: 'Work Sans', sans-serif;
          font-size: .93rem;
          font-weight: 700;
          color: var(--ink);
          margin: 0 0 .18rem;
          line-height: 1.35;
          word-break: break-word;
          overflow-wrap: break-word;
          transition: color .15s ease;
        }
        .pcard:hover .pcard-name { color: var(--navy); }

        .pcard-university {
          font-size: .78rem;
          color: var(--ink-soft);
          margin: 0 0 .1rem;
          word-break: break-word;
          overflow-wrap: break-word;
          line-height: 1.4;
        }

        .pcard-faculty {
          font-size: .72rem;
          color: var(--ink-soft);
          opacity: .75;
          margin: 0;
        }

        /* Botón de denuncia — menos intrusivo */
        .pcard-flag {
          flex-shrink: 0;
          padding: .3rem;
          background: none;
          border: none;
          border-radius: .35rem;
          color: var(--ink-soft);
          opacity: 0;
          cursor: pointer;
          transition: opacity .15s ease, color .15s ease, background .15s ease;
        }
        .pcard:hover .pcard-flag { opacity: 1; }
        .pcard-flag:hover {
          color: #a01028;
          background: rgba(212,24,61,.08);
        }

        .pcard-desc {
          font-size: .8rem;
          color: var(--ink-soft);
          margin: 0;
          line-height: 1.55;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Metadatos: estudiantes + tipo acceso */
        .pcard-meta {
          display: flex;
          align-items: center;
          gap: .85rem;
          flex-wrap: wrap;
        }

        .pcard-meta-item {
          display: flex;
          align-items: center;
          gap: .3rem;
          font-size: .72rem;
          font-weight: 500;
          color: var(--ink-soft);
        }

        .pcard-meta-item--cerrado {
          color: #7a5c00;
          background: rgba(212,147,15,.1);
          border: 1px solid rgba(212,147,15,.2);
          padding: .18rem .55rem;
          border-radius: var(--r-pill);
          font-weight: 600;
        }

        /* CTAs diferenciados */
        .pcard-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: .5rem;
          width: 100%;
          padding: .62rem;
          border-radius: .4rem;
          font-size: .83rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: transform .16s ease, box-shadow .16s ease, background .16s ease, opacity .16s ease;
          margin-top: auto;
        }

        /* Acceso abierto — navy sólido */
        .pcard-cta--open {
          background: var(--navy);
          color: #fff;
        }
        .pcard-cta--open:hover {
          background: var(--navy-dim);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(44,68,86,.25);
        }

        /* Acceso con solicitud — contorno, más sutil */
        .pcard-cta--closed {
          background: transparent;
          color: var(--navy);
          border: 1.5px solid rgba(44,68,86,.28);
        }
        .pcard-cta--closed:hover {
          background: rgba(44,68,86,.06);
          border-color: var(--navy);
        }

        /* ── Paginación ── */
        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: .5rem;
          padding: 1.5rem 0;
        }

        .pagination-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px; height: 36px;
          border-radius: .4rem;
          border: 1.5px solid rgba(44,68,86,.18);
          background: var(--surface);
          color: var(--navy);
          cursor: pointer;
          transition: all .15s ease;
          box-shadow: var(--sh-card);
        }
        .pagination-btn:hover:not(:disabled) {
          background: var(--navy);
          color: white;
          border-color: var(--navy);
        }
        .pagination-btn:disabled { opacity: .3; cursor: default; }

        .pagination-pages {
          display: flex;
          align-items: center;
          gap: .3rem;
        }

        .pagination-page {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 36px; height: 36px;
          padding: 0 .5rem;
          border-radius: .4rem;
          border: 1.5px solid transparent;
          background: transparent;
          color: var(--ink-soft);
          font-size: .85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all .15s ease;
        }
        .pagination-page:hover:not(.pagination-page--active) {
          background: rgba(44,68,86,.07);
          color: var(--ink);
        }
        .pagination-page--active {
          background: var(--navy);
          color: white;
          border-color: var(--navy);
          box-shadow: 0 2px 8px rgba(44,68,86,.22);
        }

        .pagination-ellipsis {
          font-size: .85rem;
          color: var(--ink-soft);
          padding: 0 .2rem;
          user-select: none;
        }

        /* ── Footer CTA ── */
        .footer-cta {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: .75rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(44,68,86,.08);
          text-align: center;
        }

        .footer-cta-text {
          font-size: .875rem;
          color: var(--ink-soft);
          margin: 0;
        }

        /* ── Empty state ── */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 4.5rem 2rem;
          background: var(--surface);
          border-radius: var(--r-card);
          box-shadow: var(--sh-card);
        }

        .empty-illo {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: .55rem;
          margin-bottom: 1.5rem;
        }

        .empty-illo-icon {
          width: 44px; height: 44px;
          color: var(--navy);
          opacity: .25;
        }

        .empty-dots { display: flex; gap: 5px; }
        .empty-dots span {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: var(--amber);
        }
        .empty-dots span:nth-child(1) { opacity: .5; }
        .empty-dots span:nth-child(2) { opacity: .28; }
        .empty-dots span:nth-child(3) { opacity: .12; }

        .empty-title {
          font-family: 'Work Sans', sans-serif;
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--ink);
          margin: 0 0 .45rem;
        }

        .empty-sub {
          font-size: .875rem;
          color: var(--ink-soft);
          max-width: 380px;
          margin: 0 auto 1.75rem;
          line-height: 1.65;
        }

        /* ── Shared buttons ── */
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: .5rem;
          padding: .72rem 1.35rem;
          background: var(--navy);
          color: white;
          font-size: .85rem;
          font-weight: 700;
          border-radius: .375rem;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
        }
        .btn-primary:hover {
          background: var(--navy-dim);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(44,68,86,.22);
        }

        .btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: .5rem;
          padding: .65rem 1.25rem;
          background: transparent;
          color: var(--navy);
          font-size: .85rem;
          font-weight: 700;
          border-radius: .375rem;
          border: 1.5px solid rgba(44,68,86,.22);
          text-decoration: none;
          cursor: pointer;
          transition: all .18s ease;
          font-family: 'Inter', sans-serif;
        }
        .btn-ghost:hover {
          background: rgba(44,68,86,.06);
          border-color: rgba(44,68,86,.35);
        }

        /* ── Modal ── */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(15,20,25,.55);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          padding: 1rem;
          animation: fadeIn .2s ease both;
        }

        .modal-box {
          background: var(--surface);
          width: 100%;
          max-width: 440px;
          border-radius: .75rem;
          box-shadow: 0 24px 64px rgba(0,0,0,.2), 0 0 0 1px rgba(44,68,86,.1);
          padding: 1.6rem;
          animation: scaleIn .22s cubic-bezier(.16,1,.3,1) both;
        }

        .modal-title {
          display: flex;
          align-items: center;
          gap: .5rem;
          font-family: 'Work Sans', sans-serif;
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--ink);
          margin: 0 0 .5rem;
        }

        .modal-title-icon { color: #a01028; }

        .modal-sub {
          font-size: .845rem;
          color: var(--ink-soft);
          margin: 0 0 1.15rem;
          line-height: 1.6;
        }

        .modal-error {
          margin-bottom: 1rem;
          padding: .7rem .9rem;
          font-size: .82rem;
          font-weight: 600;
          color: #a01028;
          background: rgba(212,24,61,.08);
          border: 1px solid rgba(212,24,61,.2);
          border-radius: .4rem;
        }

        .modal-fields { display: flex; flex-direction: column; gap: .85rem; }

        .field-label {
          display: block;
          font-size: .78rem;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: .4rem;
          letter-spacing: .01em;
        }

        .field-required { color: #a01028; }
        .field-optional { font-weight: 400; color: var(--ink-soft); }

        .field-select,
        .field-textarea {
          width: 100%;
          padding: .65rem .8rem;
          font-size: .845rem;
          font-family: 'Inter', sans-serif;
          background: #f7f4ef;
          border: 1.5px solid rgba(44,68,86,.15);
          border-radius: .4rem;
          color: var(--ink);
          outline: none;
          transition: border-color .15s ease, box-shadow .15s ease;
        }
        .field-select:focus,
        .field-textarea:focus {
          border-color: var(--navy);
          box-shadow: 0 0 0 3px rgba(44,68,86,.1);
        }
        .field-textarea { resize: none; }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: .7rem;
          margin-top: 1.35rem;
        }

        .btn-destructive {
          display: inline-flex;
          align-items: center;
          gap: .45rem;
          padding: .65rem 1.2rem;
          background: #c0112e;
          color: white;
          font-size: .845rem;
          font-weight: 700;
          border-radius: .375rem;
          border: none;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: background .15s ease, opacity .15s ease;
        }
        .btn-destructive:hover:not(:disabled) { background: #a01028; }
        .btn-destructive:disabled { opacity: .45; cursor: not-allowed; }

        /* Modal success */
        .modal-success {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: .75rem;
          padding: 1.5rem 0 .5rem;
        }

        .modal-success-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px; height: 48px;
          border-radius: 50%;
          background: rgba(34,170,100,.12);
          color: #1a9060;
        }

        .modal-success-text {
          font-size: .875rem;
          color: var(--ink);
          margin: 0;
          line-height: 1.6;
        }

        .modal-close-btn { margin-top: .5rem; }

        /* ── Animations ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(10px) scale(.985); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(.95); }
          to   { opacity: 1; transform: scale(1); }
        }

        /* ── Dark mode ── */
        .dark .explorar-root {
          --paper:   #161b20;
          --ink:     #dde6ed;
          --ink-soft:#7a8f9c;
          --surface: #1e2830;
          --sh-card: 0 2px 8px rgba(0,0,0,.28), 0 0 0 1px rgba(255,255,255,.05);
          --sh-hover:0 12px 32px rgba(0,0,0,.38), 0 0 0 1px rgba(255,255,255,.08);
        }
        .dark .field-select,
        .dark .field-textarea { background: #1e2830; border-color: rgba(255,255,255,.12); color: #dde6ed; }
        .dark .modal-box      { background: #1e2830; }
        .dark .pcard-meta-item--cerrado { color: #c9a740; background: rgba(212,147,15,.08); border-color: rgba(212,147,15,.15); }

        /* ── Reduced motion ── */
        @media (prefers-reduced-motion: reduce) {
          .hero-copy, .search-panel, .results-pill, .pcard,
          .modal-backdrop, .modal-box { animation: none; }
          .pcard:hover, .pcard-cta--open:hover,
          .btn-primary:hover { transform: none; }
        }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .search-panel    { flex-direction: column; border-radius: .625rem .625rem 0 0; }
          .search-divider  { width: auto; height: 1px; margin: 0 1.25rem; }
          .portales-grid   { grid-template-columns: 1fr; }
          .pagination-pages .pagination-page:not(.pagination-page--active) { display: none; }
        }
      `}</style>
    </div>
  );
}