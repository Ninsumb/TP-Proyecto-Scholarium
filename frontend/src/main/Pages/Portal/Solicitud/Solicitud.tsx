// pages/Portal/Solicitud/Solicitud.tsx
import { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  GraduationCap,
  AlertCircle,
  BookOpen,
  Loader2,
  Lock,
  ShieldOff,
  CheckCircle,
  Send,
  FileText,
  User,
} from "lucide-react";
import { solicitudService } from "../../../services/SolicitudService";
import type { PlantillaSolicitudResponse } from "../../../services/SolicitudService";
import { MainContext } from "../../../types/MainContext";
import { usePortalContext } from "../../../hooks/usePortalContext";

type PreCheckState =
  | "loading"
  | "already_member"
  | "portal_closed"
  | "blocked"
  | "ready";

export function JoinPortal() {
  const navigate = useNavigate();
  const { showToast } = useContext(MainContext);

  const { isMember, isAdmin, portalId: id, loading: portalLoading } = usePortalContext();

  const [preCheck, setPreCheck] = useState<PreCheckState>("loading");
  const [plantilla, setPlantilla] = useState<PlantillaSolicitudResponse | null>(null);

  const [nombreCompleto, setNombreCompleto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const location = useLocation();
  const fromRejected = location.state?.fromRejected === true;

  useEffect(() => {
    if (portalLoading) return;
    if (!id) return;

    if (isMember || isAdmin) {
      setPreCheck("already_member");
      return;
    }

    const runPreCheck = async () => {
      try {
        const [plantillaData, puedeSolicitar] = await Promise.all([
          solicitudService.getPlantilla(id),
          solicitudService.puedeSolicitar(id),
        ]);

        setPlantilla(plantillaData);

        if (!plantillaData.abierta) {
          setPreCheck("portal_closed");
          return;
        }

        if (!puedeSolicitar.puede) {
          switch (puedeSolicitar.motivo) {
            case "BLOQUEADO":
              setPreCheck("blocked");
              return;
            case "YA_MIEMBRO":
              setPreCheck("already_member");
              return;
            case "PENDIENTE":
              navigate(`/portal/${id}/solicitud-estado`, { replace: true });
              return;
          }
        }

        if (fromRejected) {
          setPreCheck("ready");
          return;
        }

        const miSolicitud = await solicitudService.getMiSolicitud(id);
        if (miSolicitud?.estado === "RECHAZADA") {
          navigate(`/portal/${id}/solicitud-estado`, { replace: true });
          return;
        }

        setPreCheck("ready");
      } catch {
        showToast("No se pudo validar tu estado en este portal", "error");
        setPreCheck("ready");
      }
    };

    runPreCheck();
  }, [id, isMember, isAdmin, portalLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!descripcion.trim()) {
      showToast("La descripción es obligatoria", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await solicitudService.crearSolicitud(id, {
        nombreCompleto: nombreCompleto.trim() || undefined,
        descripcion: descripcion.trim(),
      });
      showToast("Solicitud enviada correctamente", "success");
      navigate(`/portal/${id}/solicitud-estado`);
    } catch (err: any) {
      const raw = err.response?.data?.message ?? err.response?.data ?? "";
      const mensaje =
        typeof raw === "string" && raw.trim() ? raw : "Error al enviar la solicitud";
      const msgLower = mensaje.toLowerCase();

      if (msgLower.includes("ya sos miembro")) {
        showToast("Ya sos parte de este portal", "info");
        navigate(`/portal/${id}`, { replace: true });
        return;
      }
      if (msgLower.includes("pendiente")) {
        showToast("Ya tenés una solicitud pendiente para este portal", "info");
        navigate(`/portal/${id}/solicitud-estado`, { replace: true });
        return;
      }
      if (msgLower.includes("bloqueado") || msgLower.includes("no podés enviar")) {
        setPreCheck("blocked");
        return;
      }
      showToast(mensaje, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (preCheck === "loading") {
    return (
      <div className="solic-root">
        <div className="solic-loader">
          <Loader2 className="solic-spinner" />
          <p className="solic-loader-text">Verificando tu acceso...</p>
        </div>
        <SolicStyles />
      </div>
    );
  }

  // ── Ya es miembro / admin ────────────────────────────────────────────────
  if (preCheck === "already_member") {
    return (
      <div className="solic-root">
        <div className="solic-gate-wrap">
          <div className="solic-gate solic-gate--success">
            <div className="paper-grid" aria-hidden="true" />
            <div className="solic-gate-inner">
              <div className="solic-gate-icon solic-gate-icon--success">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h1 className="solic-gate-title">Ya sos parte de este portal</h1>
              <p className="solic-gate-sub">
                Tenés acceso completo a todos los contenidos y el foro de la comunidad.
              </p>
              <button
                onClick={() => navigate(`/portal/${id}`)}
                className="solic-cta solic-cta--primary"
              >
                Ir al portal
              </button>
            </div>
          </div>
        </div>
        <SolicStyles />
      </div>
    );
  }

  // ── Portal cerrado ───────────────────────────────────────────────────────
  if (preCheck === "portal_closed") {
    return (
      <div className="solic-root">
        <div className="solic-gate-wrap">
          <div className="solic-gate solic-gate--neutral">
            <div className="paper-grid" aria-hidden="true" />
            <div className="solic-gate-inner">
              <div className="solic-gate-icon solic-gate-icon--neutral">
                <Lock className="w-7 h-7" />
              </div>
              <h1 className="solic-gate-title">Solicitudes cerradas</h1>
              <p className="solic-gate-sub">
                Los administradores de este portal no están aceptando nuevas solicitudes en este momento.
                Volvé a intentarlo más adelante.
              </p>
            </div>
          </div>
        </div>
        <SolicStyles />
      </div>
    );
  }

  // ── Bloqueado ────────────────────────────────────────────────────────────
  if (preCheck === "blocked") {
    return (
      <div className="solic-root">
        <div className="solic-gate-wrap">
          <div className="solic-gate solic-gate--danger">
            <div className="paper-grid" aria-hidden="true" />
            <div className="solic-gate-inner">
              <div className="solic-gate-icon solic-gate-icon--danger">
                <ShieldOff className="w-7 h-7" />
              </div>
              <h1 className="solic-gate-title">Acceso restringido</h1>
              <p className="solic-gate-sub">
                Un administrador restringió tu acceso a este portal.
                Si creés que es un error, contactate con los administradores del portal.
              </p>
            </div>
          </div>
        </div>
        <SolicStyles />
      </div>
    );
  }

  // ── Formulario ───────────────────────────────────────────────────────────
  return (
    <div className="solic-root">

      {/* Header band */}
      <div className="solic-hero">
        <div className="paper-grid" aria-hidden="true" />
        <div className="solic-hero-inner">
          <div className="solic-hero-icon">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="solic-hero-copy">
            <h1 className="solic-hero-title">Solicitar acceso al portal</h1>
            <p className="solic-hero-sub">
              Completá el formulario y un administrador revisará tu solicitud.
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="solic-body">

        {/* Requisitos */}
        {plantilla?.requisitos && (
          <div className="solic-requisitos">
            <div className="solic-req-header">
              <BookOpen className="w-4 h-4" />
              <span>Requisitos del portal</span>
            </div>
            <p className="solic-req-text">{plantilla.requisitos}</p>
          </div>
        )}

        {/* Card del formulario */}
        <div className="solic-card">

          {/* Nombre */}
          <div className="solic-field">
            <div className="solic-field-label-row">
              <User className="solic-field-icon" />
              <label className="solic-label" htmlFor="solic-nombre">
                Nombre completo
                <span className="solic-label-opt">opcional</span>
              </label>
            </div>
            <input
              id="solic-nombre"
              type="text"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              placeholder="Tu nombre y apellido real"
              maxLength={200}
              className="solic-input"
            />
            <p className="solic-field-hint">
              Algunos portales lo piden para verificar que sos alumno regular.
            </p>
          </div>

          {/* Divisor */}
          <div className="solic-divider" />

          {/* Mensaje */}
          <div className="solic-field">
            <div className="solic-field-label-row">
              <FileText className="solic-field-icon" />
              <label className="solic-label" htmlFor="solic-desc">
                Mensaje
                <span className="solic-label-req">*</span>
              </label>
            </div>
            <textarea
              id="solic-desc"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
              rows={5}
              maxLength={1000}
              placeholder={
                plantilla?.requisitos
                  ? "Respondé a los requisitos indicados arriba..."
                  : "Contanos quién sos y por qué querés unirte a este portal..."
              }
              className="solic-textarea"
            />
            <div className="solic-char-row">
              <p className="solic-field-hint" style={{ margin: 0 }}>
                Máx. 1000 caracteres.
              </p>
              <span
                className={`solic-char-count ${
                  descripcion.length > 900 ? "solic-char-count--warn" : ""
                }`}
              >
                {descripcion.length}/1000
              </span>
            </div>
          </div>

          {/* Aviso */}
          <div className="solic-notice">
            <AlertCircle className="solic-notice-icon" />
            <p className="solic-notice-text">
              Una vez enviada, tu solicitud queda en estado{" "}
              <strong>Pendiente</strong> y no podés editarla ni cancelarla.
              Los administradores te avisarán cuando la revisen.
            </p>
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit as any}
            disabled={isSubmitting || !descripcion.trim()}
            className="solic-submit"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Enviar solicitud
              </>
            )}
          </button>
        </div>
      </div>

      <SolicStyles />
    </div>
  );
}

// ── Estilos ──────────────────────────────────────────────────────────────────
function SolicStyles() {
  return (
    <style>{`
      /* ── Tokens compartidos con Scholarium ── */
      .solic-root {
        --navy:        #2c4456;
        --navy-dim:    #1e3448;
        --navy-lite:   #3a5568;
        --amber:       #c8841a;
        --amber-lite:  #d4931f;
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

      /* ── Paper grid (compartido con ExplorarPortales / MisPortales) ── */
      .solic-root .paper-grid {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(44,68,86,.045) 1px, transparent 1px),
          linear-gradient(90deg, rgba(44,68,86,.045) 1px, transparent 1px);
        background-size: 28px 28px;
        pointer-events: none;
      }

      /* ── Loading ── */
      .solic-loader {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: .75rem;
        min-height: 320px;
      }
      .solic-spinner {
        width: 32px; height: 32px;
        color: var(--navy);
        animation: spin 1s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      .solic-loader-text {
        font-size: .875rem;
        color: var(--ink-soft);
        margin: 0;
      }

      /* ── Gate (estados bloqueantes) ── */
      .solic-gate-wrap {
        min-height: calc(100vh - 64px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 3rem 1.5rem;
      }

      .solic-gate {
        position: relative;
        width: 100%;
        max-width: 480px;
        border-radius: var(--r);
        overflow: hidden;
        text-align: center;
        padding: 3.5rem 2.5rem;
        box-shadow: var(--sh-lift);
        animation: gateIn .35s cubic-bezier(.16,1,.3,1) both;
      }
      @keyframes gateIn {
        from { opacity: 0; transform: translateY(18px) scale(.97); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }

      .solic-gate--success { background: var(--surface); border: 1px solid rgba(34,160,90,.18); }
      .solic-gate--neutral { background: var(--surface); border: 1px solid var(--border-mid); }
      .solic-gate--danger  { background: var(--surface); border: 1px solid rgba(200,30,60,.15); }

      .solic-gate-inner { position: relative; z-index: 1; }

      .solic-gate-icon {
        width: 64px; height: 64px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.5rem;
      }
      .solic-gate-icon--success { background: rgba(34,160,90,.1); color: #1a9060; }
      .solic-gate-icon--neutral { background: rgba(44,68,86,.08); color: var(--navy); }
      .solic-gate-icon--danger  { background: rgba(200,30,60,.09); color: #c0112e; }

      .solic-gate-title {
        font-family: 'Work Sans', sans-serif;
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--ink);
        margin: 0 0 .75rem;
        line-height: 1.25;
      }

      .solic-gate-sub {
        font-size: .9rem;
        color: var(--ink-soft);
        line-height: 1.65;
        margin: 0 0 2rem;
      }

      .solic-cta {
        display: inline-flex;
        align-items: center;
        gap: .5rem;
        padding: .75rem 1.75rem;
        font-size: .9rem;
        font-weight: 700;
        border-radius: var(--r-sm);
        border: none;
        cursor: pointer;
        text-decoration: none;
        transition: transform .14s, box-shadow .14s, background .14s;
      }
      .solic-cta--primary {
        background: var(--navy);
        color: white;
        box-shadow: 0 2px 12px rgba(44,68,86,.28);
      }
      @media (hover: hover) and (pointer: fine) {
        .solic-cta--primary:hover {
          background: var(--navy-dim);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(44,68,86,.3);
        }
      }

      /* ── Hero band ── */
      .solic-hero {
        position: relative;
        background: var(--navy);
        overflow: hidden;
        padding: 2.5rem 2rem 2rem;
      }
      .solic-hero .paper-grid {
        background-image:
          linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
      }

      .solic-hero-inner {
        position: relative;
        z-index: 1;
        max-width: 640px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        gap: 1.25rem;
        animation: fadeUp .4s cubic-bezier(.16,1,.3,1) both;
      }
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      .solic-hero-icon {
        flex-shrink: 0;
        width: 52px; height: 52px;
        background: rgba(255,255,255,.1);
        border: 1px solid rgba(255,255,255,.15);
        border-radius: var(--r-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(255,255,255,.9);
      }

      .solic-hero-title {
        font-family: 'Work Sans', sans-serif;
        font-size: 1.35rem;
        font-weight: 700;
        color: white;
        margin: 0 0 .3rem;
        line-height: 1.2;
      }

      .solic-hero-sub {
        font-size: .845rem;
        color: rgba(255,255,255,.6);
        margin: 0;
        line-height: 1.55;
      }

      /* ── Body ── */
      .solic-body {
        max-width: 640px;
        margin: 0 auto;
        padding: 2rem 1.5rem 4rem;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        animation: fadeUp .45s .08s cubic-bezier(.16,1,.3,1) both;
      }

      /* ── Requisitos ── */
      .solic-requisitos {
        background: rgba(200,132,26,.07);
        border: 1px solid rgba(200,132,26,.22);
        border-radius: var(--r);
        padding: 1rem 1.15rem;
      }

      .solic-req-header {
        display: flex;
        align-items: center;
        gap: .45rem;
        font-size: .78rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: .07em;
        color: var(--amber);
        margin-bottom: .55rem;
      }

      .solic-req-text {
        font-size: .875rem;
        color: var(--ink-mid);
        line-height: 1.65;
        margin: 0;
        white-space: pre-line;
      }

      /* ── Card formulario ── */
      .solic-card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--r);
        box-shadow: var(--sh-card);
        padding: 2rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      /* ── Field ── */
      .solic-field {
        display: flex;
        flex-direction: column;
        gap: .55rem;
      }

      .solic-field-label-row {
        display: flex;
        align-items: center;
        gap: .45rem;
      }

      .solic-field-icon {
        width: 15px; height: 15px;
        color: var(--navy);
        flex-shrink: 0;
      }

      .solic-label {
        display: flex;
        align-items: center;
        gap: .45rem;
        font-size: .82rem;
        font-weight: 700;
        color: var(--ink);
        letter-spacing: .01em;
        cursor: pointer;
      }

      .solic-label-opt {
        font-size: .72rem;
        font-weight: 400;
        font-style: italic;
        color: var(--ink-ghost);
      }

      .solic-label-req {
        color: #c0112e;
        font-weight: 700;
      }

      .solic-input,
      .solic-textarea {
        width: 100%;
        padding: .65rem .85rem;
        font-size: .875rem;
        font-family: 'Inter', sans-serif;
        background: var(--surface-2);
        border: 1.5px solid var(--border-mid);
        border-radius: var(--r-sm);
        color: var(--ink);
        outline: none;
        transition: border-color .14s, box-shadow .14s;
        box-sizing: border-box;
      }
      .solic-input::placeholder,
      .solic-textarea::placeholder { color: var(--ink-ghost); }
      .solic-input:focus,
      .solic-textarea:focus {
        border-color: var(--navy);
        box-shadow: 0 0 0 3px rgba(44,68,86,.1);
      }
      .solic-textarea {
        resize: none;
        line-height: 1.6;
      }

      .solic-field-hint {
        font-size: .76rem;
        color: var(--ink-ghost);
        margin: 0;
        line-height: 1.5;
      }

      .solic-char-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .solic-char-count {
        font-size: .76rem;
        color: var(--ink-ghost);
        font-variant-numeric: tabular-nums;
        transition: color .14s;
      }
      .solic-char-count--warn { color: #c0112e; font-weight: 600; }

      /* ── Divisor ── */
      .solic-divider {
        height: 1px;
        background: var(--border);
      }

      /* ── Aviso ── */
      .solic-notice {
        display: flex;
        gap: .75rem;
        padding: .9rem 1rem;
        background: rgba(200,132,26,.06);
        border: 1px solid rgba(200,132,26,.2);
        border-radius: var(--r-sm);
      }

      .solic-notice-icon {
        width: 16px; height: 16px;
        color: var(--amber);
        flex-shrink: 0;
        margin-top: .1rem;
      }

      .solic-notice-text {
        font-size: .8rem;
        color: var(--ink-mid);
        line-height: 1.6;
        margin: 0;
      }

      /* ── Submit ── */
      .solic-submit {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: .5rem;
        width: 100%;
        padding: .875rem;
        font-size: .9rem;
        font-weight: 700;
        font-family: 'Inter', sans-serif;
        background: var(--navy);
        color: white;
        border: none;
        border-radius: var(--r-sm);
        cursor: pointer;
        box-shadow: 0 2px 12px rgba(44,68,86,.26);
        transition: background .14s, transform .14s, box-shadow .14s, opacity .14s;
        letter-spacing: .01em;
      }
      @media (hover: hover) and (pointer: fine) {
        .solic-submit:hover:not(:disabled) {
          background: var(--navy-dim);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(44,68,86,.3);
        }
        .solic-submit:active:not(:disabled) { transform: translateY(0); }
      }
      .solic-submit:disabled { opacity: .38; cursor: not-allowed; }

      /* ── Dark mode ── */
      .dark .solic-root {
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
      .dark .solic-input,
      .dark .solic-textarea { background: #192330; border-color: rgba(255,255,255,.1); color: #dce6ed; }
      .dark .solic-input:focus,
      .dark .solic-textarea:focus { border-color: #5d8cc7; box-shadow: 0 0 0 3px rgba(93,140,199,.12); }
      .dark .solic-submit { background: #2e5070; }
      .dark .solic-submit:hover:not(:disabled) { background: #3e6888; }

      /* ── Reduced motion ── */
      @media (prefers-reduced-motion: reduce) {
        .solic-gate,
        .solic-hero-inner,
        .solic-body,
        .solic-cta:hover,
        .solic-submit:hover { animation: none !important; transform: none !important; }
      }

      /* ── Responsive ── */
      @media (max-width: 520px) {
        .solic-hero { padding: 2rem 1.25rem 1.75rem; }
        .solic-hero-inner { flex-direction: column; text-align: center; }
        .solic-hero-title { font-size: 1.2rem; }
        .solic-card { padding: 1.5rem 1.1rem; }
        .solic-gate { padding: 3rem 1.5rem; }
      }
    `}</style>
  );
}