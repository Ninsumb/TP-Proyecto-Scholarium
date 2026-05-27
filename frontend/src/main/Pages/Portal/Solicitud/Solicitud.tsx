// pages/Portal/Solicitud/Solicitud.tsx
// Vista del formulario para solicitar acceso a un portal.
//
// Flujo:
// 1. Carga la PlantillaSolicitud del portal (requisitos + estado de apertura).
// 2. Si el portal no acepta solicitudes → muestra mensaje de cierre.
// 3. Si hay requisitos → los muestra antes del formulario.
// 4. El usuario completa nombre completo (opcional) y descripción (obligatorio).
// 5. Al enviar → POST a /portales/{id}/solicitudes → redirige a /solicitud-estado.
//
// Importante: se informa al usuario que una vez enviada, la solicitud no puede
// ser editada ni cancelada y la verán los admins.

import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GraduationCap, AlertCircle, BookOpen, Loader2, Lock } from "lucide-react";
import { solicitudService } from "../../../services/SolicitudService.ts";
import type { PlantillaSolicitudResponse } from "../../../services/SolicitudService";
import { MainContext } from "../../../types/MainContext";

export function JoinPortal() {
  const { portalId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useContext(MainContext);

  const [plantilla, setPlantilla] = useState<PlantillaSolicitudResponse | null>(null);
  const [loadingPlantilla, setLoadingPlantilla] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [nombreCompleto, setNombreCompleto] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const id = Number(portalId);

  // Cargar los requisitos del portal
  useEffect(() => {
    if (!id) return;
    const cargarPlantilla = async () => {
      try {
        const data = await solicitudService.getPlantilla(id);
        setPlantilla(data);
      } catch (err) {
        console.error("Error al cargar plantilla:", err);
        // Si falla, dejamos plantilla como null y permitimos el envío igual
        setPlantilla({ requisitos: null, abierta: true });
      } finally {
        setLoadingPlantilla(false);
      }
    };
    cargarPlantilla();
  }, [id]);

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
      const mensaje =
        err.response?.data?.message ||
        err.response?.data ||
        "Error al enviar la solicitud";
      showToast(typeof mensaje === "string" ? mensaje : "Error al enviar la solicitud", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loadingPlantilla) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // ── Portal cerrado ───────────────────────────────────────────────────────
  if (plantilla && !plantilla.abierta) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div
            className="w-16 h-16 bg-muted flex items-center justify-center mx-auto mb-6"
            style={{ borderRadius: "var(--radius)" }}
          >
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Portal cerrado</h1>
          <p className="text-muted-foreground">
            Los administradores de este portal no están aceptando solicitudes en este momento.
            Intentalo más adelante.
          </p>
        </div>
      </div>
    );
  }

  // ── Formulario ───────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div
          className="w-14 h-14 bg-primary/10 flex items-center justify-center mx-auto mb-4"
          style={{ borderRadius: "var(--radius)" }}
        >
          <GraduationCap className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Solicitar acceso al portal</h1>
        <p className="text-muted-foreground text-sm">
          Completá el formulario y un administrador revisará tu solicitud.
        </p>
      </div>

      {/* Requisitos del portal (si existen) */}
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

      {/* Formulario */}
      <div
        className="bg-surface-container-lowest p-8 shadow-sm"
        style={{ borderRadius: "var(--radius)" }}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre completo */}
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
              Algunos portales necesitan saber quién sos más allá de tu nombre de usuario.
            </p>
          </div>

          {/* Descripción / mensaje */}
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
              <p className="text-xs text-muted-foreground">
                {plantilla?.requisitos ? "Seguí las instrucciones de los requisitos." : "Máx. 1000 caracteres."}
              </p>
              <p
                className={`text-xs ${
                  descripcion.length > 900 ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                {descripcion.length}/1000
              </p>
            </div>
          </div>

          {/* Aviso de no cancelación */}
          <div
            className="flex gap-3 p-4 bg-yellow-500/5 border border-yellow-500/20"
            style={{ borderRadius: "var(--radius)" }}
          >
            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Una vez enviada, tu solicitud quedará en estado <strong>Pendiente</strong> y no podrás
              editarla ni cancelarla. Los administradores del portal la verán y te notificarán.
            </p>
          </div>

          {/* Botón */}
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