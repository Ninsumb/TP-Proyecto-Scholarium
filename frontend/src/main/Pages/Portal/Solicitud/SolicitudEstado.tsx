// pages/Portal/Solicitud/SolicitudEstado.tsx
// Vista del estado de la solicitud del usuario autenticado para el portal actual.
//
// Flujo:
// 1. Llama a GET /portales/{id}/solicitudes/mi-solicitud para obtener la solicitud más reciente.
// 2. Si no hay solicitud → redirige al formulario (/solicitud).
// 3. Según el estado (PENDIENTE / RECHAZADA / ACEPTADA) muestra la vista correspondiente.
//
// Estado PENDIENTE: muestra resumen de la solicitud enviada.
// Estado RECHAZADA: muestra el motivo del rechazo y opción de reenviar.
// Estado ACEPTADA: no debería llegar acá (el usuario ya sería miembro), pero se maneja igual.
//
// Sin localStorage. Todo viene del backend.

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { solicitudService } from "../../../services/SolicitudService";
import type { SolicitudResponse } from "../../../services/SolicitudService";

export function RequestStatus() {
  const { portalId } = useParams();
  const navigate = useNavigate();

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
          // No hay solicitud → ir al formulario
          navigate(`/portal/${id}/solicitud`, { replace: true });
          return;
        }
        setSolicitud(data);
      } catch (err: any) {
        if (err.response?.status === 404 || err.response?.status === 204) {
          navigate(`/portal/${id}/solicitud`, { replace: true });
        } else {
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
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !solicitud) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-destructive">{error || "No se pudo cargar tu solicitud"}</p>
        <button
          onClick={() => navigate(`/portal/${id}/solicitud`)}
          className="mt-4 px-6 py-2.5 text-sm rounded-sm bg-primary text-primary-foreground"
          style={{ borderRadius: "var(--radius)" }}
        >
          Ir al formulario
        </button>
      </div>
    );
  }

  // ── Shared: resumen de la solicitud ─────────────────────────────────────
  const ResumenSolicitud = () => (
    <div className="space-y-3 mb-6">
      <div
        className="p-4 bg-surface-container space-y-3"
        style={{ borderRadius: "var(--radius)" }}
      >
        <div className="flex items-start gap-2.5">
          <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
              Fecha de envío
            </p>
            <p className="text-sm text-foreground">{formatFecha(solicitud.fechaSolicitud)}</p>
          </div>
        </div>

        {solicitud.nombreCompleto && (
          <div className="flex items-start gap-2.5">
            <User className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
                Nombre completo
              </p>
              <p className="text-sm text-foreground">{solicitud.nombreCompleto}</p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2.5">
          <FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
              Tu mensaje
            </p>
            <p className="text-sm text-foreground whitespace-pre-line">{solicitud.descripcion}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // ── PENDIENTE ────────────────────────────────────────────────────────────
  if (solicitud.estado === "PENDIENTE") {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <div
            className="w-14 h-14 bg-yellow-500/10 flex items-center justify-center mx-auto mb-4"
            style={{ borderRadius: "var(--radius)" }}
          >
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Solicitud en revisión</h1>
          <p className="text-muted-foreground text-sm">
            Tu solicitud fue enviada y está siendo revisada por los administradores del portal.
          </p>
        </div>

        <div
          className="bg-surface-container-lowest p-8 shadow-sm"
          style={{ borderRadius: "var(--radius)" }}
        >
          {/* Badge de estado */}
          <div className="flex justify-center mb-6">
            <div
              className="px-4 py-1.5 bg-yellow-500/10 text-yellow-700 border border-yellow-500/20 flex items-center gap-2 text-sm font-medium"
              style={{ borderRadius: "var(--radius)" }}
            >
              <Clock className="w-4 h-4" />
              Pendiente
            </div>
          </div>

          <ResumenSolicitud />

          <p className="text-xs text-muted-foreground text-center">
            Una vez que los administradores procesen tu solicitud, tu estado en el portal se actualizará.
          </p>
        </div>
      </div>
    );
  }

  // ── RECHAZADA ────────────────────────────────────────────────────────────
  if (solicitud.estado === "RECHAZADA") {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <div
            className="w-14 h-14 bg-destructive/10 flex items-center justify-center mx-auto mb-4"
            style={{ borderRadius: "var(--radius)" }}
          >
            <X className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Solicitud rechazada</h1>
          <p className="text-muted-foreground text-sm">
            Los administradores revisaron tu solicitud y no pudieron aprobarla en esta oportunidad.
          </p>
        </div>

        <div
          className="bg-surface-container-lowest p-8 shadow-sm"
          style={{ borderRadius: "var(--radius)" }}
        >
          {/* Badge de estado */}
          <div className="flex justify-center mb-6">
            <div
              className="px-4 py-1.5 bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-2 text-sm font-medium"
              style={{ borderRadius: "var(--radius)" }}
            >
              <X className="w-4 h-4" />
              Rechazada
            </div>
          </div>

          {/* Motivo del rechazo */}
          {solicitud.motivoRechazo && (
            <div
              className="flex gap-3 p-4 bg-destructive/5 border border-destructive/20 mb-6"
              style={{ borderRadius: "var(--radius)" }}
            >
              <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-foreground mb-1 uppercase tracking-wide">
                  Motivo del rechazo
                </p>
                <p className="text-sm text-foreground">{solicitud.motivoRechazo}</p>
              </div>
            </div>
          )}

          <ResumenSolicitud />

          <p className="text-xs text-muted-foreground text-center mb-6">
            Podés enviar una nueva solicitud teniendo en cuenta el motivo indicado.
          </p>

          {/* Botón para reenviar */}
          <button
            onClick={() => navigate(`/portal/${id}/solicitud`)}
            className="w-full px-6 py-2.5 font-medium transition-colors shadow-sm"
            style={{
              background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 100%)",
              color: "var(--primary-foreground)",
              borderRadius: "var(--radius)",
            }}
          >
            Enviar nueva solicitud
          </button>
        </div>
      </div>
    );
  }

  // ── ACEPTADA (caso borde: el usuario fue aprobado pero aún está en esta ruta) ──
  if (solicitud.estado === "ACEPTADA") {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <div
            className="w-14 h-14 bg-green-500/10 flex items-center justify-center mx-auto mb-4"
            style={{ borderRadius: "var(--radius)" }}
          >
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">¡Solicitud aprobada!</h1>
          <p className="text-muted-foreground text-sm">
            Ya sos miembro del portal. Podés acceder a todos los contenidos.
          </p>
        </div>

        <div
          className="bg-surface-container-lowest p-8 shadow-sm text-center"
          style={{ borderRadius: "var(--radius)" }}
        >
          <button
            onClick={() => navigate(`/portal/${id}`)}
            className="px-8 py-2.5 font-medium transition-colors shadow-sm"
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

  return null;
}