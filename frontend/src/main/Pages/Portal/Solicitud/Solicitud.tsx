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
} from "lucide-react";
import { solicitudService } from "../../../services/SolicitudService";
import type { PlantillaSolicitudResponse } from "../../../services/SolicitudService";
import { MainContext } from "../../../types/MainContext";
import { usePortalContext } from "../../../Hooks/usePortalContext";

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
    // Esperar a que el portal context termine de cargar.
    // Sin esto, isMember e isAdmin son false en el primer render (portal aún null)
    // y el preCheck corre innecesariamente, mostrando el form antes de que se
    // detecte que el usuario ya es miembro.
    if (portalLoading) return;
    if (!id) return;

    // Miembro/Admin detectado desde el portal context — no necesitamos ir al backend.
    if (isMember || isAdmin) {
      setPreCheck("already_member");
      return;
    }

    const runPreCheck = async () => {
      try {
        // Las dos llamadas son independientes, van en paralelo.
        const [plantillaData, puedeSolicitar] = await Promise.all([
          solicitudService.getPlantilla(id),
          solicitudService.puedeSolicitar(id),
        ]);

        setPlantilla(plantillaData);

        // 1. Portal cerrado a nuevas solicitudes (viene de plantilla, no de puedeSolicitar)
        if (!plantillaData.abierta) {
          setPreCheck("portal_closed");
          return;
        }

        // 2. Motivos que bloquean el acceso al form
        if (!puedeSolicitar.puede) {
          switch (puedeSolicitar.motivo) {
            case "BLOQUEADO":
              setPreCheck("blocked");
              return;

            case "YA_MIEMBRO":
              // Esto no debería ocurrir si el portal context funciona bien,
              // pero lo manejamos como fallback defensivo.
              setPreCheck("already_member");
              return;

            case "PENDIENTE":
              // Ya tiene solicitud pendiente → redirigir a solicitud-estado
              navigate(`/portal/${id}/solicitud-estado`, { replace: true });
              return;
          }
        }

        // 3. Puede solicitar (incluyendo el caso RECHAZADA — puede reenviar)
        setPreCheck("ready");
      } catch {
        showToast("No se pudo validar tu estado en este portal", "error");
        // Fallback: mostrar el form de todas formas.
        // El backend rechazará el submit si corresponde.
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
      const raw =
        err.response?.data?.message ??
        err.response?.data ??
        "";

      const mensaje =
        typeof raw === "string" && raw.trim()
          ? raw
          : "Error al enviar la solicitud";

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
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // ── Ya es miembro / admin ────────────────────────────────────────────────
  if (preCheck === "already_member") {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div
            className="w-14 h-14 bg-primary/10 flex items-center justify-center mx-auto mb-5"
            style={{ borderRadius: "var(--radius)" }}
          >
            <CheckCircle className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Ya sos parte de este portal
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            Tenés acceso completo a todos los contenidos.
          </p>
          <button
            onClick={() => navigate(`/portal/${id}`)}
            className="px-6 py-2.5 font-medium shadow-sm transition-colors"
            style={{
              background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 100%)",
              color: "var(--primary-foreground)",
              borderRadius: "var(--radius)",
            }}
          >
            Ir al portal
          </button>
        </div>
      </div>
    );
  }

  // ── Portal cerrado ───────────────────────────────────────────────────────
  if (preCheck === "portal_closed") {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div
            className="w-14 h-14 bg-muted flex items-center justify-center mx-auto mb-5"
            style={{ borderRadius: "var(--radius)" }}
          >
            <Lock className="w-7 h-7 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Solicitudes cerradas temporalmente
          </h1>
          <p className="text-muted-foreground text-sm">
            Los administradores de este portal no están aceptando solicitudes en este momento.
            Intentalo más adelante.
          </p>
        </div>
      </div>
    );
  }

  // ── Bloqueado ────────────────────────────────────────────────────────────
  if (preCheck === "blocked") {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div
            className="w-14 h-14 bg-destructive/10 flex items-center justify-center mx-auto mb-5"
            style={{ borderRadius: "var(--radius)" }}
          >
            <ShieldOff className="w-7 h-7 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">
            No podés enviar solicitudes a este portal
          </h1>
          <p className="text-muted-foreground text-sm">
            Un administrador restringió tu acceso a este portal.
            Si creés que es un error, ponete en contacto con los administradores.
          </p>
        </div>
      </div>
    );
  }

  // ── Formulario ───────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <div
          className="w-14 h-14 bg-primary/10 flex items-center justify-center mx-auto mb-4"
          style={{ borderRadius: "var(--radius)" }}
        >
          <GraduationCap className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Solicitar acceso al portal
        </h1>
        <p className="text-muted-foreground text-sm">
          Completá el formulario y un administrador revisará tu solicitud.
        </p>
      </div>

      {plantilla?.requisitos && (
        <div
          className="flex gap-3 p-4 mb-6 bg-primary/5 border border-primary/20"
          style={{ borderRadius: "var(--radius)" }}
        >
          <BookOpen className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Requisitos del portal</p>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {plantilla.requisitos}
            </p>
          </div>
        </div>
      )}

      <div
        className="bg-surface-container-lowest p-8 shadow-sm"
        style={{ borderRadius: "var(--radius)" }}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Nombre completo{" "}
              <span className="text-muted-foreground font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              placeholder="Tu nombre y apellido real"
              maxLength={200}
              className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              style={{ borderRadius: "var(--radius)" }}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Algunos portales lo piden para verificar que sos alumno regular.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Mensaje <span className="text-destructive">*</span>
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
              rows={5}
              maxLength={1000}
              placeholder={
                plantilla?.requisitos
                  ? "Respondé a los requisitos del portal indicados arriba..."
                  : "Contanos quién sos y por qué querés unirte a este portal..."
              }
              className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-all"
              style={{ borderRadius: "var(--radius)" }}
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-muted-foreground">Máx. 1000 caracteres.</p>
              <p className={`text-xs ${descripcion.length > 900 ? "text-destructive" : "text-muted-foreground"}`}>
                {descripcion.length}/1000
              </p>
            </div>
          </div>

          <div
            className="flex gap-3 p-4 bg-yellow-500/5 border border-yellow-500/20"
            style={{ borderRadius: "var(--radius)" }}
          >
            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Una vez enviada, tu solicitud quedará en estado{" "}
              <strong>Pendiente</strong> y no podrás editarla ni cancelarla. Los
              administradores del portal la verán y te avisarán.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !descripcion.trim()}
            className="w-full px-6 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-medium"
            style={{
              background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 100%)",
              color: "var(--primary-foreground)",
              borderRadius: "var(--radius)",
            }}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </span>
            ) : (
              "Enviar solicitud"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}