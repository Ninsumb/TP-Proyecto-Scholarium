import { useParams, useNavigate } from "react-router";
import { Clock, X, CheckCircle, Mail, AlertTriangle } from "lucide-react";
import { useToast } from "../../../Hooks/useToast";

type RequestStatus = 'pending' | 'rejected' | 'approved';

interface RequestData {
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  career: string;
  enrollmentYear: string;
  message: string;
  status: RequestStatus;
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export function RequestStatus() {
  const { portalId } = useParams();
  const navigate = useNavigate();

  // Obtener datos de la solicitud desde localStorage (mock)
  const requestDataStr = localStorage.getItem(`portal-request-${portalId}`);
  const requestData: RequestData = requestDataStr ? JSON.parse(requestDataStr) : null;

  if (!requestData) {
    // Si no hay solicitud, redirigir a la página de unirse
    navigate(`/portal/${portalId}/solicitud`);
    return null;
  }

  const handleCancelRequest = () => {
    if (confirm("¿Estás seguro de que deseas cancelar tu solicitud?")) {
      localStorage.removeItem(`portal-request-${portalId}`);
      useToast().showToast("Solicitud cancelada", 'success');
      navigate(`/portal/${portalId}/solicitud`);
    }
  };

  const handleNewRequest = () => {
    localStorage.removeItem(`portal-request-${portalId}`);
    navigate(`/portal/${portalId}/solicitud`);
  };

  const handleContactSupport = () => {
    window.location.href = "mailto:soporte@universidad.edu";
  };

  // Vista PENDIENTE
  if (requestData.status === 'pending') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <div
            className="w-16 h-16 bg-yellow-500/10 flex items-center justify-center mx-auto mb-4"
            style={{ borderRadius: 'var(--radius)' }}
          >
            <Clock className="w-10 h-10 text-yellow-600" />
          </div>
          <h1 className="mb-3 text-foreground">Solicitud en Revisión</h1>
          <p className="text-on-surface-variant max-w-2xl mx-auto">
            Tu solicitud está siendo revisada por un administrador
          </p>
        </div>

        <div
          className="bg-surface-container-lowest p-8 shadow-sm"
          style={{ borderRadius: 'var(--radius)' }}
        >
          {/* Badge de estado */}
          <div className="flex justify-center mb-6">
            <div
              className="px-4 py-2 bg-yellow-500/10 text-yellow-700 border border-yellow-500/20 flex items-center gap-2"
              style={{ borderRadius: 'var(--radius)' }}
            >
              <Clock className="w-5 h-5" />
              <span className="font-medium">PENDIENTE</span>
            </div>
          </div>

          {/* Detalles de la solicitud */}
          <div className="mb-6">
            <h3 className="mb-4 text-foreground">Detalles de tu solicitud</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Fecha de envío:</span>
                <span className="text-foreground font-medium">
                  {new Date(requestData.submittedAt).toLocaleDateString("es-ES", {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Número de legajo:</span>
                <span className="text-foreground font-medium">{requestData.studentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Carrera:</span>
                <span className="text-foreground font-medium">{requestData.career}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Email:</span>
                <span className="text-foreground font-medium">{requestData.email}</span>
              </div>
            </div>
          </div>

          {/* Mensaje */}
          <div
            className="flex gap-3 p-4 bg-primary/5 border border-primary/20 mb-6"
            style={{ borderRadius: 'var(--radius)' }}
          >
            <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-on-surface-variant">
              Te notificaremos por correo cuando haya novedades.
            </p>
          </div>

          {/* Botón cancelar */}
          <button
            onClick={handleCancelRequest}
            className="w-full px-6 py-2.5 border border-border hover:bg-accent transition-colors text-on-surface-variant"
            style={{ borderRadius: 'var(--radius)' }}
          >
            Cancelar Solicitud
          </button>
        </div>
      </div>
    );
  }

  // Vista RECHAZADA
  if (requestData.status === 'rejected') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <div
            className="w-16 h-16 bg-destructive/10 flex items-center justify-center mx-auto mb-4"
            style={{ borderRadius: 'var(--radius)' }}
          >
            <X className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="mb-3 text-foreground">Solicitud Rechazada</h1>
          <p className="text-on-surface-variant max-w-2xl mx-auto">
            Tu solicitud no pudo ser aprobada
          </p>
        </div>

        <div
          className="bg-surface-container-lowest p-8 shadow-sm"
          style={{ borderRadius: 'var(--radius)' }}
        >
          {/* Badge de estado */}
          <div className="flex justify-center mb-6">
            <div
              className="px-4 py-2 bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-2"
              style={{ borderRadius: 'var(--radius)' }}
            >
              <X className="w-5 h-5" />
              <span className="font-medium">RECHAZADA</span>
            </div>
          </div>

          {/* Detalles */}
          <div className="mb-6">
            <h3 className="mb-4 text-foreground">Detalles</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Fecha de revisión:</span>
                <span className="text-foreground font-medium">
                  {requestData.reviewedAt
                    ? new Date(requestData.reviewedAt).toLocaleDateString("es-ES", {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })
                    : '30/03/2026'}
                </span>
              </div>
            </div>
          </div>

          {/* Motivo del rechazo */}
          <div
            className="p-4 bg-destructive/5 border border-destructive/20 mb-6"
            style={{ borderRadius: 'var(--radius)' }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-foreground mb-1">Motivo del rechazo:</div>
                <p className="text-sm text-on-surface-variant">
                  {requestData.rejectionReason || "El número de legajo no coincide con nuestros registros"}
                </p>
              </div>
            </div>
          </div>

          {/* Mensaje */}
          <p className="text-sm text-on-surface-variant text-center mb-6">
            Si crees que hubo un error, contacta a secretaría académica.
          </p>

          {/* Botones */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleContactSupport}
              className="px-6 py-2.5 border border-border hover:bg-accent transition-colors"
              style={{ borderRadius: 'var(--radius)' }}
            >
              Contactar Soporte
            </button>
            <button
              onClick={handleNewRequest}
              className="px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors shadow-sm"
              style={{ borderRadius: 'var(--radius)' }}
            >
              Enviar Nueva Solicitud
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista APROBADA (esto normalmente no se vería porque el usuario ya sería miembro)
  if (requestData.status === 'approved') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <div
            className="w-16 h-16 bg-green-500/10 flex items-center justify-center mx-auto mb-4"
            style={{ borderRadius: 'var(--radius)' }}
          >
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="mb-3 text-foreground">¡Solicitud Aprobada!</h1>
          <p className="text-on-surface-variant max-w-2xl mx-auto">
            Tu solicitud fue aprobada exitosamente. Ya eres miembro del portal.
          </p>
        </div>

        <div
          className="bg-surface-container-lowest p-8 shadow-sm text-center"
          style={{ borderRadius: 'var(--radius)' }}
        >
          <button
            onClick={() => navigate(`/portal/${portalId}`)}
            className="px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors shadow-sm"
            style={{ borderRadius: 'var(--radius)' }}
          >
            Ir al Portal
          </button>
        </div>
      </div>
    );
  }

  return null;
}
