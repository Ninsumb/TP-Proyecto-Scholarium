// pages/Portal/Solicitud/SolicitudEstado.tsx
// Vista del estado de la solicitud del usuario autenticado para el portal actual.
//
// Flujo:
// 1. Llama a GET /portales/{id}/solicitudes/mi-solicitud para obtener la solicitud más reciente.
// 2. Si no hay solicitud → redirige al formulario (/solicitud).
// 3. Según el estado (PENDIENTE / RECHAZADA / ACEPTADA) muestra la vista correspondiente.

import { useState, useEffect, useContext } from "react";
import { MainContext } from "../../../types/MainContext";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock,
  X,
  CheckCircle,
  AlertTriangle,
  Loader2,
  User,
  FileText,
  Calendar,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { solicitudService } from "../../../services/SolicitudService";
import type { SolicitudResponse } from "../../../services/SolicitudService";

export function RequestStatus() {
  const { portalId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useContext(MainContext);

  const [solicitud, setSolicitud] = useState<SolicitudResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = Number(portalId);

  useEffect(() => {
    if (!id) return;
    const cargar = async () => {
      try {
        const data = await solicitudService.getMiSolicitud(id);
        if (!data) {
          navigate(`/portal/${id}/solicitud`, { replace: true });
          return;
        }
        setSolicitud(data);
      } catch (err: any) {
        if (err.response?.status === 404 || err.response?.status === 204) {
          navigate(`/portal/${id}/solicitud`, { replace: true });
        } else {
          showToast("Error al cargar el estado de tu solicitud", "error");
          setError("Error al cargar el estado de tu solicitud");
        }
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id]);

  const formatFecha = (iso: string) =>
    new Date(iso).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="sestado-root">
        <div className="sestado-loader">
          <Loader2 className="sestado-spinner" />
          <p className="sestado-loader-text">Cargando tu solicitud...</p>
        </div>
        <SolicEstadoStyles />
      </div>
    );
  }

  if (error || !solicitud) {
    return (
      <div className="sestado-root">
        <div className="sestado-error-wrap">
          <p className="sestado-error-msg">{error || "No se pudo cargar tu solicitud"}</p>
          <button
            onClick={() => navigate(`/portal/${id}/solicitud`)}
            className="sestado-cta sestado-cta--primary"
          >
            Ir al formulario
          </button>
        </div>
        <SolicEstadoStyles />
      </div>
    );
  }

  // ── Resumen de la solicitud (compartido entre estados) ───────────────────
  const ResumenSolicitud = () => (
    <div className="sestado-resumen">
      <p className="sestado-resumen-label">Tu solicitud</p>
      <div className="sestado-resumen-items">
        <div className="sestado-resumen-item">
          <Calendar className="sestado-item-icon" />
          <div>
            <span className="sestado-item-meta">Fecha de envío</span>
            <span className="sestado-item-val">{formatFecha(solicitud.fechaSolicitud)}</span>
          </div>
        </div>

        {solicitud.nombreCompleto && (
          <div className="sestado-resumen-item">
            <User className="sestado-item-icon" />
            <div>
              <span className="sestado-item-meta">Nombre completo</span>
              <span className="sestado-item-val">{solicitud.nombreCompleto}</span>
            </div>
          </div>
        )}

        <div className="sestado-resumen-item sestado-resumen-item--full">
          <FileText className="sestado-item-icon" />
          <div>
            <span className="sestado-item-meta">Tu mensaje</span>
            <span className="sestado-item-val sestado-item-val--msg">
              {solicitud.descripcion}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // ── PENDIENTE ────────────────────────────────────────────────────────────
  if (solicitud.estado === "PENDIENTE") {
    return (
      <div className="sestado-root">
        {/* Header band */}
        <div className="sestado-hero sestado-hero--pending">
          <div className="paper-grid" aria-hidden="true" />
          <div className="sestado-hero-inner">
            <div className="sestado-hero-icon sestado-hero-icon--pending">
              <Clock className="w-7 h-7" />
            </div>
            <div className="sestado-hero-copy">
              <div className="sestado-badge sestado-badge--pending">
                <Clock className="w-3.5 h-3.5" />
                Pendiente
              </div>
              <h1 className="sestado-hero-title">Solicitud en revisión</h1>
              <p className="sestado-hero-sub">
                Tu solicitud fue recibida. Los administradores del portal la están revisando.
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="sestado-body">
          <ResumenSolicitud />
          <div className="sestado-footnote">
            Recibirás una notificación cuando los administradores procesen tu solicitud.
          </div>
        </div>

        <SolicEstadoStyles />
      </div>
    );
  }

  // ── RECHAZADA ────────────────────────────────────────────────────────────
  if (solicitud.estado === "RECHAZADA") {
    return (
      <div className="sestado-root">
        {/* Header band */}
        <div className="sestado-hero sestado-hero--rejected">
          <div className="paper-grid" aria-hidden="true" />
          <div className="sestado-hero-inner">
            <div className="sestado-hero-icon sestado-hero-icon--rejected">
              <X className="w-7 h-7" />
            </div>
            <div className="sestado-hero-copy">
              <div className="sestado-badge sestado-badge--rejected">
                <X className="w-3.5 h-3.5" />
                Rechazada
              </div>
              <h1 className="sestado-hero-title">Solicitud rechazada</h1>
              <p className="sestado-hero-sub">
                Los administradores revisaron tu solicitud y no pudieron aprobarla esta vez.
                Podés intentarlo de nuevo.
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="sestado-body">

          {/* Motivo */}
          {solicitud.motivoRechazo && (
            <div className="sestado-motivo">
              <div className="sestado-motivo-header">
                <AlertTriangle className="w-4 h-4" />
                <span>Motivo del rechazo</span>
              </div>
              <p className="sestado-motivo-text">{solicitud.motivoRechazo}</p>
            </div>
          )}

          <ResumenSolicitud />

          {/* Acción */}
          <div className="sestado-action-card">
            <div className="sestado-action-copy">
              <p className="sestado-action-title">¿Querés intentarlo de nuevo?</p>
              <p className="sestado-action-sub">
                Podés enviar una nueva solicitud teniendo en cuenta el motivo del rechazo.
              </p>
            </div>
            <button
              onClick={() =>
                navigate(`/portal/${id}/solicitud`, { state: { fromRejected: true } })
              }
              className="sestado-cta sestado-cta--primary"
            >
              <RotateCcw className="w-4 h-4" />
              Enviar nueva solicitud
            </button>
          </div>
        </div>

        <SolicEstadoStyles />
      </div>
    );
  }

  // ── ACEPTADA ─────────────────────────────────────────────────────────────
  if (solicitud.estado === "ACEPTADA") {
    return (
      <div className="sestado-root">
        {/* Header band */}
        <div className="sestado-hero sestado-hero--accepted">
          <div className="paper-grid" aria-hidden="true" />
          <div className="sestado-hero-inner">
            <div className="sestado-hero-icon sestado-hero-icon--accepted">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div className="sestado-hero-copy">
              <div className="sestado-badge sestado-badge--accepted">
                <CheckCircle className="w-3.5 h-3.5" />
                Aprobada
              </div>
              <h1 className="sestado-hero-title">¡Solicitud aprobada!</h1>
              <p className="sestado-hero-sub">
                Ya sos miembro del portal. Tenés acceso a todos los contenidos y la comunidad.
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="sestado-body">
          <div className="sestado-action-card sestado-action-card--success">
            <div className="sestado-action-copy">
              <p className="sestado-action-title">Bienvenido a la comunidad</p>
              <p className="sestado-action-sub">
                El portal y todos sus recursos ya están disponibles para vos.
              </p>
            </div>
            <button
              onClick={() => navigate(`/portal/${id}`)}
              className="sestado-cta sestado-cta--primary"
            >
              Ir al portal
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <SolicEstadoStyles />
      </div>
    );
  }

  return null;
}

// ── Estilos ──────────────────────────────────────────────────────────────────
function SolicEstadoStyles() {
  return (
    <style>{`
      /* ── Tokens Scholarium ── */
      .sestado-root {
        --navy:        #2c4456;
        --navy-dim:    #1e3448;
        --navy-lite:   #3a5568;
        --amber:       #c8841a;
        --paper:       #faf7f2;
        --ink:         #1a2530;
        --ink-mid:     #4a5c68;
        --ink-soft:    #6a8090;
        --ink-ghost:   #9aabb5;
        --surface:     #ffffff;
        --surface-2:   #f5f2ed;
        --border:      rgba(44,68,86,.13);
        --border-mid:  rgba(44,68,86,.22);
        --sh-card:     0 2px 10px rgba(44,68,86,.08), 0 0 0 1px rgba(44,68,86,.07);
        --sh-lift:     0 8px 28px rgba(44,68,86,.14), 0 0 0 1px rgba(44,68,86,.09);
        --r:           .625rem;
        --r-sm:        .375rem;

        font-family: 'Inter', sans-serif;
        min-height: 100%;
        background: var(--paper);
        color: var(--ink);
      }

      /* ── Paper grid ── */
      .sestado-root .paper-grid {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
        background-size: 28px 28px;
        pointer-events: none;
      }

      /* ── Loader ── */
      .sestado-loader {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: .75rem;
        min-height: 320px;
      }
      .sestado-spinner {
        width: 32px; height: 32px;
        color: var(--navy);
        animation: sestado-spin 1s linear infinite;
      }
      @keyframes sestado-spin { to { transform: rotate(360deg); } }
      .sestado-loader-text {
        font-size: .875rem;
        color: var(--ink-soft);
        margin: 0;
      }

      /* ── Error ── */
      .sestado-error-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        min-height: 260px;
        padding: 2rem;
        text-align: center;
      }
      .sestado-error-msg {
        font-size: .9rem;
        color: #c0112e;
        margin: 0;
      }

      /* ── Hero band ── */
      .sestado-hero {
        position: relative;
        overflow: hidden;
        padding: 2.5rem 2rem 2rem;
      }
      .sestado-hero--pending  { background: var(--navy); }
      .sestado-hero--rejected { background: #3d1a20; }
      .sestado-hero--accepted { background: #14362a; }

      .sestado-hero-inner {
        position: relative;
        z-index: 1;
        max-width: 640px;
        margin: 0 auto;
        display: flex;
        align-items: flex-start;
        gap: 1.25rem;
        animation: sestado-up .4s cubic-bezier(.16,1,.3,1) both;
      }
      @keyframes sestado-up {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      .sestado-hero-icon {
        flex-shrink: 0;
        width: 52px; height: 52px;
        border-radius: var(--r-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(255,255,255,.15);
      }
      .sestado-hero-icon--pending  { background: rgba(255,255,255,.1); color: #fbbf24; }
      .sestado-hero-icon--rejected { background: rgba(255,255,255,.08); color: #f87171; }
      .sestado-hero-icon--accepted { background: rgba(255,255,255,.1); color: #4ade80; }

      /* ── Badge de estado ── */
      .sestado-badge {
        display: inline-flex;
        align-items: center;
        gap: .35rem;
        padding: .25rem .7rem;
        border-radius: 100px;
        font-size: .72rem;
        font-weight: 700;
        letter-spacing: .06em;
        text-transform: uppercase;
        margin-bottom: .5rem;
        border: 1px solid;
      }
      .sestado-badge--pending  { background: rgba(251,191,36,.15); color: #fbbf24; border-color: rgba(251,191,36,.25); }
      .sestado-badge--rejected { background: rgba(248,113,113,.12); color: #f87171; border-color: rgba(248,113,113,.22); }
      .sestado-badge--accepted { background: rgba(74,222,128,.12);  color: #4ade80; border-color: rgba(74,222,128,.22); }

      .sestado-hero-title {
        font-family: 'Work Sans', sans-serif;
        font-size: 1.35rem;
        font-weight: 700;
        color: white;
        margin: 0 0 .35rem;
        line-height: 1.2;
      }

      .sestado-hero-sub {
        font-size: .845rem;
        color: rgba(255,255,255,.6);
        margin: 0;
        line-height: 1.55;
      }

      /* ── Body ── */
      .sestado-body {
        max-width: 640px;
        margin: 0 auto;
        padding: 2rem 1.5rem 4rem;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        animation: sestado-up .45s .08s cubic-bezier(.16,1,.3,1) both;
      }

      /* ── Motivo del rechazo ── */
      .sestado-motivo {
        background: rgba(200,30,60,.06);
        border: 1px solid rgba(200,30,60,.18);
        border-radius: var(--r);
        padding: 1rem 1.15rem;
      }
      .sestado-motivo-header {
        display: flex;
        align-items: center;
        gap: .45rem;
        font-size: .78rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: .07em;
        color: #c0112e;
        margin-bottom: .5rem;
      }
      .sestado-motivo-text {
        font-size: .875rem;
        color: var(--ink-mid);
        line-height: 1.65;
        margin: 0;
      }

      /* ── Resumen ── */
      .sestado-resumen {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--r);
        box-shadow: var(--sh-card);
        overflow: hidden;
      }
      .sestado-resumen-label {
        font-size: .68rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: .09em;
        color: var(--ink-ghost);
        padding: .85rem 1.25rem .5rem;
        margin: 0;
      }
      .sestado-resumen-items {
        display: flex;
        flex-direction: column;
      }
      .sestado-resumen-item {
        display: flex;
        align-items: flex-start;
        gap: .75rem;
        padding: .8rem 1.25rem;
        border-top: 1px solid var(--border);
      }
      .sestado-item-icon {
        width: 15px; height: 15px;
        color: var(--navy);
        flex-shrink: 0;
        margin-top: .15rem;
      }
      .sestado-resumen-item div {
        display: flex;
        flex-direction: column;
        gap: .2rem;
      }
      .sestado-item-meta {
        font-size: .7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: .06em;
        color: var(--ink-ghost);
      }
      .sestado-item-val {
        font-size: .875rem;
        color: var(--ink);
        line-height: 1.5;
      }
      .sestado-item-val--msg {
        white-space: pre-line;
        line-height: 1.65;
        color: var(--ink-mid);
      }

      /* ── Action card ── */
      .sestado-action-card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--r);
        box-shadow: var(--sh-card);
        padding: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1.25rem;
        flex-wrap: wrap;
      }
      .sestado-action-card--success {
        border-color: rgba(34,160,90,.18);
        background: rgba(34,160,90,.03);
      }
      .sestado-action-copy {
        flex: 1;
        min-width: 0;
      }
      .sestado-action-title {
        font-size: .9rem;
        font-weight: 700;
        color: var(--ink);
        margin: 0 0 .25rem;
      }
      .sestado-action-sub {
        font-size: .8rem;
        color: var(--ink-soft);
        line-height: 1.55;
        margin: 0;
      }

      /* ── CTAs ── */
      .sestado-cta {
        display: inline-flex;
        align-items: center;
        gap: .45rem;
        padding: .7rem 1.5rem;
        font-size: .875rem;
        font-weight: 700;
        font-family: 'Inter', sans-serif;
        border-radius: var(--r-sm);
        border: none;
        cursor: pointer;
        text-decoration: none;
        white-space: nowrap;
        transition: background .14s, transform .14s, box-shadow .14s;
        letter-spacing: .01em;
      }
      .sestado-cta--primary {
        background: var(--navy);
        color: white;
        box-shadow: 0 2px 12px rgba(44,68,86,.26);
      }
      @media (hover: hover) and (pointer: fine) {
        .sestado-cta--primary:hover {
          background: var(--navy-dim);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(44,68,86,.3);
        }
        .sestado-cta--primary:active { transform: translateY(0); }
      }

      /* ── Footnote ── */
      .sestado-footnote {
        font-size: .78rem;
        color: var(--ink-ghost);
        text-align: center;
        line-height: 1.6;
        padding: 0 .5rem;
      }

      /* ── Dark mode ── */
      .dark .sestado-root {
        --paper:     #0d1318;
        --ink:       #dce6ed;
        --ink-mid:   #a5bbc8;
        --ink-soft:  #6a8898;
        --ink-ghost: #435e6c;
        --surface:   #16202a;
        --surface-2: #192330;
        --border:    rgba(255,255,255,.07);
        --border-mid:rgba(255,255,255,.13);
        --sh-card:   0 2px 8px rgba(0,0,0,.32), 0 0 0 1px rgba(255,255,255,.045);
        --sh-lift:   0 8px 28px rgba(0,0,0,.45), 0 0 0 1px rgba(255,255,255,.06);
      }
      .dark .sestado-cta--primary { background: #2e5070; }
      .dark .sestado-cta--primary:hover { background: #3e6888; }

      /* ── Reduced motion ── */
      @media (prefers-reduced-motion: reduce) {
        .sestado-hero-inner,
        .sestado-body,
        .sestado-cta:hover { animation: none !important; transform: none !important; }
      }

      /* ── Responsive ── */
      @media (max-width: 520px) {
        .sestado-hero { padding: 2rem 1.25rem 1.75rem; }
        .sestado-hero-inner { flex-direction: column; }
        .sestado-hero-title { font-size: 1.2rem; }
        .sestado-body { padding: 1.5rem 1rem 3rem; }
        .sestado-action-card { flex-direction: column; align-items: flex-start; }
        .sestado-cta { width: 100%; justify-content: center; }
      }
    `}</style>
  );
}