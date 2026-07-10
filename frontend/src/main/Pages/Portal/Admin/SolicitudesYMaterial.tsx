import { useState, useEffect, useCallback } from "react";
import {
  UserPlus, FileText, Check, X, Download, Calendar, User, Loader2,
  Inbox, CheckCircle2, AlertCircle,
} from "lucide-react";
import { adminService } from "../../../services/AdminService";
import { usePortalContext } from "../../../hooks/usePortalContext";
import type { SolicitudResponse, MaterialPendienteDTO } from "../../../types/Admin/Admin";
import { Modal } from "../../../Components/common/Modal";
import { Pagination } from "../../../Components/common/Pagination";
import { getTipoColor } from "../../../Utils/tagColors";
import { getExtensionIcon, getFileExtension } from "../../../Utils/materialIcons";

// ─── Modales ──────────────────────────────────────────────────────────────────

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
  itemName: string;
  loading?: boolean;
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  loading?: boolean;
}

interface RequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: SolicitudResponse | null;
  onApprove: () => void;
  onReject: () => void;
  loading?: boolean;
}

interface MaterialDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: MaterialPendienteDTO | null;
  onDownload: () => void;
  onApprove: () => void;
  onReject: () => void;
  loading?: boolean;
}

function ConfirmModal({ isOpen, onClose, onConfirm, title, message, loading }: ConfirmModalProps) {
  if (!isOpen) return null;
  return (
    <Modal onClose={onClose} maxWidth="32rem">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-card-foreground">{title}</h2>
        </div>
        <div className="p-6">
          <p className="text-foreground mb-6">{message}</p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 border border-border hover:bg-accent transition-colors disabled:opacity-50 portal-hoverable"
              style={{ borderRadius: "var(--radius)" }}
            >
              Cancelar
            </button>
            <button
              onClick={() => { onConfirm(); }}
              disabled={loading}
              className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors flex items-center gap-2 disabled:opacity-50 portal-hoverable"
              style={{ borderRadius: "var(--radius)" }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirmar
            </button>
          </div>
        </div>
    </Modal>
  );
}

function RejectModal({ isOpen, onClose, onConfirm, title, itemName, loading }: RejectModalProps) {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason);
    }
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Modal onClose={handleClose} maxWidth="32rem">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-card-foreground">{title}</h2>
        </div>
        <div className="p-6 space-y-4">
          <div
            className="p-4 bg-destructive/5 border border-destructive/20"
            style={{ borderRadius: "var(--radius)" }}
          >
            <p className="text-sm text-foreground">
              Estás rechazando: <span className="font-medium">{itemName}</span>
            </p>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-foreground">
              Motivo del rechazo <span className="text-destructive">*</span>
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none disabled:opacity-50"
              style={{ borderRadius: "var(--radius)" }}
              placeholder="Explica el motivo del rechazo. Este mensaje será visible para el usuario."
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-5 py-2.5 border border-border hover:bg-accent transition-colors disabled:opacity-50 portal-hoverable"
              style={{ borderRadius: "var(--radius)" }}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!reason.trim() || loading}
              className="px-5 py-2.5 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 portal-hoverable"
              style={{ borderRadius: "var(--radius)" }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirmar Rechazo
            </button>
          </div>
        </div>
    </Modal>
  );
}

function RequestDetailModal({
  isOpen, onClose, request, onApprove, onReject, loading,
}: RequestDetailModalProps) {
  if (!isOpen || !request) return null;

  const displayName = request.nombreCompleto ?? request.usuario.nombre;
  const initials    = displayName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <Modal onClose={onClose} maxWidth="42rem">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-card-foreground">Solicitud de Membresía</h2>
        </div>
        <div className="p-6">
          <div className="flex gap-4 mb-5">
            <div
              className="w-16 h-16 bg-primary/15 flex items-center justify-center text-primary flex-shrink-0 text-xl font-medium"
              style={{ borderRadius: "var(--radius)" }}
            >
              {initials}
            </div>
            <div className="flex-1">
              <h3 className="text-foreground font-medium text-lg">{request.usuario.nombre}</h3>
              {request.nombreCompleto && (
                <p className="text-sm text-on-surface-variant mb-1">{request.nombreCompleto}</p>
              )}
              <p className="text-xs text-on-surface-variant mb-1">{request.usuario.email}</p>
              <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(request.fechaSolicitud).toLocaleDateString("es-ES")}</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-foreground">Mensaje</label>
            <div
              className="p-4 bg-surface-container border border-border max-h-64 overflow-y-auto"
              style={{ borderRadius: "var(--radius)" }}
            >
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {request.descripcion}
              </p>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 border border-border hover:bg-accent transition-colors disabled:opacity-50 portal-hoverable"
              style={{ borderRadius: "var(--radius)" }}
            >
              Cerrar
            </button>
            <button
              onClick={() => { onReject(); onClose(); }}
              disabled={loading}
              className="px-5 py-2.5 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors flex items-center gap-2 disabled:opacity-50 portal-hoverable"
              style={{ borderRadius: "var(--radius)" }}
            >
              <X className="w-4 h-4" />
              <span>Rechazar</span>
            </button>
            <button
              onClick={() => { onApprove(); onClose(); }}
              disabled={loading}
              className="px-5 py-2.5 text-white hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 portal-hoverable"
              style={{ borderRadius: "var(--radius)", background: "var(--portal-teal)" }}
            >
              <Check className="w-4 h-4" />
              <span>Aprobar</span>
            </button>
          </div>
        </div>
    </Modal>
  );
}

// ─── Helper: tamaño legible ───────────────────────────────────────────────────

const formatSize = (bytes: number): string => {
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const TIPO_LABEL: Record<string, string> = {
  APUNTE:          "Apunte",
  PARCIAL:         "Parcial",
  FINAL:           "Final",
  GUIA_EJERCICIOS: "Guía de ejercicios",
  OTRO:            "Otro",
};

function MaterialDetailModal({
  isOpen, onClose, material, onDownload, onApprove, onReject, loading,
}: MaterialDetailModalProps) {
  if (!isOpen || !material) return null;

  const tipoColor = getTipoColor(material.tipo);
  const extension = getFileExtension(material.tipoArchivo);
  const ExtIcon = getExtensionIcon(extension);

  return (
    <Modal onClose={onClose} maxWidth="42rem">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-card-foreground">Detalle del Material</h2>
        </div>
        <div className="p-6">
          <div className="mb-5">
            <div className="flex items-start gap-4 mb-3">
              <div
                className="w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--muted)" }}
              >
                <ExtIcon className="w-6 h-6" style={{ color: "var(--muted-foreground)" }} />
              </div>
              <div className="flex-1 flex items-start justify-between gap-4">
                <h3 className="text-foreground font-medium text-lg">{material.nombre}</h3>
                <span
                  className="px-3 py-1 text-xs font-medium whitespace-nowrap"
                  style={{ borderRadius: "var(--radius)", background: tipoColor.bg, color: tipoColor.text }}
                >
                  {TIPO_LABEL[material.tipo] ?? material.tipo}
                </span>
              </div>
            </div>
            <p className="text-sm text-on-surface-variant mb-3">
              {material.materia.nombre} — {material.materia.carpeta}
            </p>
            {material.descripcion && (
              <p className="text-sm text-foreground mb-3">{material.descripcion}</p>
            )}

            <div
              className="grid grid-cols-2 gap-4 p-4 bg-surface-container"
              style={{ borderRadius: "var(--radius)" }}
            >
              <div>
                <div className="text-xs text-on-surface-variant mb-1">Subido por</div>
                <div className="text-sm text-foreground font-medium">{material.uploadedByEmail}</div>
              </div>
              <div>
                <div className="text-xs text-on-surface-variant mb-1">Fecha de subida</div>
                <div className="text-sm text-foreground font-medium">
                  {new Date(material.createdAt).toLocaleDateString("es-ES")}
                </div>
              </div>
              <div>
                <div className="text-xs text-on-surface-variant mb-1">Tamaño</div>
                <div className="text-sm text-foreground font-medium">{formatSize(material.tamanio)}</div>
              </div>
              <div>
                <div className="text-xs text-on-surface-variant mb-1">Tipo de archivo</div>
                <div className="text-sm text-foreground font-medium uppercase">{extension}</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 border border-border hover:bg-accent transition-colors disabled:opacity-50 portal-hoverable"
              style={{ borderRadius: "var(--radius)" }}
            >
              Cerrar
            </button>
            <button
              onClick={() => { onDownload(); onClose(); }}
              disabled={loading}
              className="px-5 py-2.5 border border-border hover:bg-accent transition-colors flex items-center gap-2 disabled:opacity-50 portal-hoverable"
              style={{ borderRadius: "var(--radius)" }}
            >
              <Download className="w-4 h-4" />
              <span>Descargar</span>
            </button>
            <button
              onClick={() => { onReject(); onClose(); }}
              disabled={loading}
              className="px-5 py-2.5 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors flex items-center gap-2 disabled:opacity-50 portal-hoverable"
              style={{ borderRadius: "var(--radius)" }}
            >
              <X className="w-4 h-4" />
              <span>Rechazar</span>
            </button>
            <button
              onClick={() => { onApprove(); onClose(); }}
              disabled={loading}
              className="px-5 py-2.5 text-white hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 portal-hoverable"
              style={{ borderRadius: "var(--radius)", background: "var(--portal-teal)" }}
            >
              <Check className="w-4 h-4" />
              <span>Aprobar</span>
            </button>
          </div>
        </div>
    </Modal>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function RequestsAndMaterial() {
  const { portal } = usePortalContext();
  const portalId = portal?.id as number;

  const [activeTab, setActiveTab] = useState<"requests" | "material">("requests");
  const PAGE_SIZE = 6;
  const [requestsPage, setRequestsPage] = useState(1);
  const [materialsPage, setMaterialsPage] = useState(1);

  // ── Estado de solicitudes ─────────────────────────────────────────────────
  const [requests, setRequests]             = useState<SolicitudResponse[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [requestsError, setRequestsError]   = useState<string | null>(null);

  // ── Estado de material ────────────────────────────────────────────────────
  const [materials, setMaterials]           = useState<MaterialPendienteDTO[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [materialsError, setMaterialsError] = useState<string | null>(null);

  // Acción en curso (para deshabilitar botones mientras se procesa)
  const [processingId, setProcessingId]     = useState<number | string | null>(null);

  const [error,      setError]              = useState<string | null>(null);
  const [successMsg, setSuccessMsg]         = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // ── Modales ───────────────────────────────────────────────────────────────

  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    type: "request" | "material";
    id: number | string;
    name: string;
  }>({ isOpen: false, type: "request", id: 0, name: "" });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

  const [requestDetailModal, setRequestDetailModal] = useState<{
    isOpen: boolean;
    request: SolicitudResponse | null;
  }>({ isOpen: false, request: null });

  const [materialDetailModal, setMaterialDetailModal] = useState<{
    isOpen: boolean;
    material: MaterialPendienteDTO | null;
  }>({ isOpen: false, material: null });

  // ── Carga de datos ────────────────────────────────────────────────────────

  const fetchRequests = useCallback(async () => {
    if (!portalId) return;
    setLoadingRequests(true);
    setRequestsError(null);
    try {
      const data = await adminService.getSolicitudesPendientes(portalId);
      setRequests(data);
    } catch {
      setRequestsError("No se pudieron cargar las solicitudes.");
    } finally {
      setLoadingRequests(false);
    }
  }, [portalId]);

  const fetchMaterials = useCallback(async () => {
    if (!portalId) return;
    setLoadingMaterials(true);
    setMaterialsError(null);
    try {
      const data = await adminService.getMaterialPendiente(portalId);
      setMaterials(data);
    } catch {
      setMaterialsError("No se pudo cargar el material pendiente.");
    } finally {
      setLoadingMaterials(false);
    }
  }, [portalId]);

  useEffect(() => {
    if (activeTab === "requests") fetchRequests();
    if (activeTab === "material") fetchMaterials();
  }, [activeTab, fetchRequests, fetchMaterials]);

  useEffect(() => {
    setRequestsPage(1);
  }, [requests.length]);

  useEffect(() => {
    setMaterialsPage(1);
  }, [materials.length]);

  // ── Acciones sobre solicitudes ────────────────────────────────────────────

  const handleApproveRequest = (id: number) => {
    setConfirmModal({
      isOpen:  true,
      title:   "Aprobar Solicitud",
      message: "¿Estás seguro de que deseas aprobar esta solicitud de membresía? El usuario obtendrá acceso completo al portal.",
      onConfirm: async () => {
        setProcessingId(id);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await adminService.aprobarSolicitud(portalId, id);
          setRequests((prev) => prev.filter((r) => r.id !== id));
          showSuccess("Solicitud aprobada. El usuario ya es miembro del portal.");
        } catch (err: unknown) {
          const axiosErr = err as { response?: { data?: { message?: string } } };
          setError(axiosErr?.response?.data?.message ?? "No se pudo aprobar la solicitud.");
        } finally {
          setProcessingId(null);
        }
      },
    });
  };

  const handleRejectRequest = (id: number, name: string) => {
    setRejectModal({ isOpen: true, type: "request", id, name });
  };

  // ── Acciones sobre material ───────────────────────────────────────────────

  const handleApproveMaterial = (id: string) => {
    setConfirmModal({
      isOpen:  true,
      title:   "Aprobar Material",
      message: "¿Estás seguro de que deseas aprobar este material? Será visible para todos los miembros del portal.",
      onConfirm: async () => {
        setProcessingId(id);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await adminService.aprobarMaterial(id);
          setMaterials((prev) => prev.filter((m) => m.id !== id));
          showSuccess("Material aprobado y publicado correctamente.");
        } catch (err: unknown) {
          const axiosErr = err as { response?: { data?: { message?: string } } };
          setError(axiosErr?.response?.data?.message ?? "No se pudo aprobar el material.");
        } finally {
          setProcessingId(null);
        }
      },
    });
  };

  const handleRejectMaterial = (id: string, name: string) => {
    setRejectModal({ isOpen: true, type: "material", id, name });
  };

  const handleDownloadMaterial = (material: MaterialPendienteDTO) => {
    // Para material pendiente la URL viene directamente en el DTO
    window.open(material.url, "_blank", "noopener,noreferrer");
  };

  // ── Confirmar rechazo (solicitud o material) ──────────────────────────────

  const handleConfirmReject = async (reason: string) => {
    const { type, id } = rejectModal;
    setProcessingId(id);
    setRejectModal((prev) => ({ ...prev, isOpen: false }));
    try {
      if (type === "request") {
        await adminService.rechazarSolicitud(portalId, id as number, {
          motivoRechazo: reason,
        });
        setRequests((prev) => prev.filter((r) => r.id !== id));
        showSuccess("Solicitud rechazada.");
      } else {
        await adminService.rechazarMaterial(id as string, { motivoRechazo: reason });
        setMaterials((prev) => prev.filter((m) => m.id !== id));
        showSuccess("Material rechazado.");
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message ?? "No se pudo completar el rechazo.");
    } finally {
      setProcessingId(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 portal-scope portal-fade-up">
      <div className="mb-10 flex items-start sm:items-center gap-4">
        <div
          className="w-12 h-12 flex items-center justify-center flex-shrink-0"
          style={{
            borderRadius: "var(--radius-md)",
            background: "var(--primary)",
            color: "var(--primary-foreground)",
          }}
        >
          <Inbox className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-foreground mb-1.5">Solicitudes y Material</h1>
          <p className="text-on-surface-variant">
            Gestiona las solicitudes de membresía y modera el material de estudio subido por los miembros
          </p>
        </div>
      </div>

      {/* Feedback global */}
      {error && (
        <div
          className="mb-4 p-4 bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-center gap-2"
          style={{ borderRadius: "var(--radius)" }}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button className="ml-2 underline" onClick={() => setError(null)}>Cerrar</button>
        </div>
      )}
      {successMsg && (
        <div
          className="mb-4 p-4 text-sm flex items-center gap-2"
          style={{
            borderRadius: "var(--radius)",
            background: "var(--portal-teal-soft)",
            border: "1px solid var(--portal-teal-border)",
            color: "var(--portal-teal-dim)",
          }}
        >
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-8 border-b border-border">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-6 py-3 relative transition-colors rounded-t-sm ${
              activeTab === "requests"
                ? "text-primary font-medium"
                : "text-on-surface-variant hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              <span>Solicitudes</span>
              {requests.length > 0 && (
                <span
                  className="min-w-[1.25rem] px-1.5 py-0.5 rounded-full text-xs font-medium text-center tabular-nums"
                  style={{
                    background: "var(--portal-amber)",
                    color: "#ffffff",
                  }}
                >
                  {requests.length}
                </span>
              )}
            </div>
            {activeTab === "requests" && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("material")}
            className={`px-6 py-3 relative transition-colors rounded-t-sm ${
              activeTab === "material"
                ? "text-primary font-medium"
                : "text-on-surface-variant hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Material</span>
              {materials.length > 0 && (
                <span
                  className="min-w-[1.25rem] px-1.5 py-0.5 rounded-full text-xs font-medium text-center tabular-nums"
                  style={{
                    background: "var(--portal-amber)",
                    color: "#ffffff",
                  }}
                >
                  {materials.length}
                </span>
              )}
            </div>
            {activeTab === "material" && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* ── Tab: Solicitudes ── */}
      {activeTab === "requests" && (
        <div>
          {loadingRequests ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
            </div>
          ) : requestsError ? (
            <div className="text-center py-12 text-destructive text-sm">{requestsError}</div>
          ) : requests.length === 0 ? (
            <div
              className="text-center py-16 px-8"
              style={{
                borderRadius: "var(--radius-lg)",
                border: "1px dashed var(--border)",
                background: "var(--muted)",
              }}
            >
              <div
                className="w-16 h-16 bg-surface-container-low mx-auto mb-4 flex items-center justify-center"
                style={{ borderRadius: "var(--radius)" }}
              >
                <UserPlus className="w-8 h-8 text-on-surface-variant" />
              </div>
              <h3 className="text-foreground mb-2">No hay solicitudes pendientes</h3>
              <p className="text-on-surface-variant text-sm max-w-md mx-auto">
                Cuando los usuarios soliciten unirse al portal, aparecerán aquí para que puedas
                aprobarlas o rechazarlas.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.slice((requestsPage - 1) * PAGE_SIZE, requestsPage * PAGE_SIZE).map((request) => {
                const isProcessing = processingId === request.id;
                const displayName  = request.nombreCompleto ?? request.usuario.nombre;
                const initials     = displayName
                  .split(" ")
                  .slice(0, 2)
                  .map((n) => n[0]?.toUpperCase() ?? "")
                  .join("");

                return (
                  <div
                    key={request.id}
                    onClick={() => setRequestDetailModal({ isOpen: true, request })}
                    className="bg-card p-5 border border-border cursor-pointer portal-hoverable"
                    style={{
                      borderRadius: "var(--radius-lg)",
                      boxShadow: "var(--portal-shadow-card)",
                    }}
                  >
                    <div className="flex gap-4">
                      <div
                        className="w-14 h-14 bg-primary/15 flex items-center justify-center text-primary flex-shrink-0"
                        style={{ borderRadius: "var(--radius)" }}
                      >
                        <span className="font-medium">{initials}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="text-foreground font-medium">{request.usuario.nombre}</h3>
                            {request.nombreCompleto && (
                              <p className="text-sm text-on-surface-variant">{request.nombreCompleto}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-on-surface-variant flex-shrink-0">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date(request.fechaSolicitud).toLocaleDateString("es-ES")}</span>
                          </div>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed mb-4 line-clamp-2">
                          {request.descripcion}
                        </p>
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleApproveRequest(request.id)}
                            disabled={isProcessing}
                            className="px-4 py-2 text-white hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 portal-hoverable"
                            style={{ borderRadius: "var(--radius)", background: "var(--portal-teal)" }}
                          >
                            {isProcessing ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            <span>Aprobar</span>
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id, request.usuario.nombre)}
                            disabled={isProcessing}
                            className="px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors flex items-center gap-2 disabled:opacity-50 portal-hoverable"
                            style={{ borderRadius: "var(--radius)" }}
                          >
                            <X className="w-4 h-4" />
                            <span>Rechazar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <Pagination
                page={requestsPage}
                totalPages={Math.max(1, Math.ceil(requests.length / PAGE_SIZE))}
                onPageChange={setRequestsPage}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Material ── */}
      {activeTab === "material" && (
        <div>
          {loadingMaterials ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
            </div>
          ) : materialsError ? (
            <div className="text-center py-12 text-destructive text-sm">{materialsError}</div>
          ) : materials.length === 0 ? (
            <div
              className="text-center py-16 px-8"
              style={{
                borderRadius: "var(--radius-lg)",
                border: "1px dashed var(--border)",
                background: "var(--muted)",
              }}
            >
              <div
                className="w-16 h-16 bg-surface-container-low mx-auto mb-4 flex items-center justify-center"
                style={{ borderRadius: "var(--radius)" }}
              >
                <FileText className="w-8 h-8 text-on-surface-variant" />
              </div>
              <h3 className="text-foreground mb-2">No hay material pendiente de moderación</h3>
              <p className="text-on-surface-variant text-sm max-w-md mx-auto">
                Cuando los miembros suban nuevo material de estudio, aparecerá aquí para que lo
                revises antes de publicarlo.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {materials.slice((materialsPage - 1) * PAGE_SIZE, materialsPage * PAGE_SIZE).map((material) => {
                const isProcessing = processingId === material.id;
                const tipoColor = getTipoColor(material.tipo);
                const extension = getFileExtension(material.tipoArchivo);
                const ExtIcon = getExtensionIcon(extension);
                return (
                  <div
                    key={material.id}
                    onClick={() => setMaterialDetailModal({ isOpen: true, material })}
                    className="bg-card p-5 border border-border cursor-pointer portal-hoverable"
                    style={{
                      borderRadius: "var(--radius-lg)",
                      boxShadow: "var(--portal-shadow-card)",
                    }}
                  >
                    <div className="flex items-start gap-4 mb-3">
                      <div
                        className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0"
                        style={{ background: "var(--muted)" }}
                      >
                        <ExtIcon className="w-5 h-5" style={{ color: "var(--muted-foreground)" }} />
                      </div>
                      <div className="flex-1 flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-foreground font-medium mb-1">{material.nombre}</h3>
                          <p className="text-sm text-on-surface-variant">
                            {material.materia.nombre} — {material.materia.carpeta}
                          </p>
                        </div>
                        <span
                          className="px-3 py-1 text-xs font-medium whitespace-nowrap"
                          style={{ borderRadius: "var(--radius)", background: tipoColor.bg, color: tipoColor.text }}
                        >
                          {TIPO_LABEL[material.tipo] ?? material.tipo}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-on-surface-variant mb-4">
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        <span>{material.uploadedByEmail}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(material.createdAt).toLocaleDateString("es-ES")}</span>
                      </div>
                      <span className="font-medium">{formatSize(material.tamanio)}</span>
                    </div>

                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDownloadMaterial(material)}
                        disabled={isProcessing}
                        className="px-4 py-2 border border-border hover:bg-accent transition-colors flex items-center gap-2 disabled:opacity-50 portal-hoverable"
                        style={{ borderRadius: "var(--radius)" }}
                      >
                        <Download className="w-4 h-4" />
                        <span>Descargar</span>
                      </button>
                      <button
                        onClick={() => handleApproveMaterial(material.id)}
                        disabled={isProcessing}
                        className="px-4 py-2 text-white hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 portal-hoverable"
                        style={{ borderRadius: "var(--radius)", background: "var(--portal-teal)" }}
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        <span>Aprobar</span>
                      </button>
                      <button
                        onClick={() => handleRejectMaterial(material.id, material.nombre)}
                        disabled={isProcessing}
                        className="px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors flex items-center gap-2 disabled:opacity-50 portal-hoverable"
                        style={{ borderRadius: "var(--radius)" }}
                      >
                        <X className="w-4 h-4" />
                        <span>Rechazar</span>
                      </button>
                    </div>
                  </div>
                );
              })}
              <Pagination
                page={materialsPage}
                totalPages={Math.max(1, Math.ceil(materials.length / PAGE_SIZE))}
                onPageChange={setMaterialsPage}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Modales ── */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        loading={processingId !== null}
      />

      <RejectModal
        isOpen={rejectModal.isOpen}
        onClose={() => setRejectModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmReject}
        title={rejectModal.type === "request" ? "Rechazar Solicitud" : "Rechazar Material"}
        itemName={rejectModal.name}
        loading={processingId !== null}
      />

      <RequestDetailModal
        isOpen={requestDetailModal.isOpen}
        onClose={() => setRequestDetailModal({ isOpen: false, request: null })}
        request={requestDetailModal.request}
        onApprove={() =>
          requestDetailModal.request && handleApproveRequest(requestDetailModal.request.id)
        }
        onReject={() =>
          requestDetailModal.request &&
          handleRejectRequest(
            requestDetailModal.request.id,
            requestDetailModal.request.usuario.nombre,
          )
        }
        loading={processingId !== null}
      />

      <MaterialDetailModal
        isOpen={materialDetailModal.isOpen}
        onClose={() => setMaterialDetailModal({ isOpen: false, material: null })}
        material={materialDetailModal.material}
        onDownload={() =>
          materialDetailModal.material && handleDownloadMaterial(materialDetailModal.material)
        }
        onApprove={() =>
          materialDetailModal.material && handleApproveMaterial(materialDetailModal.material.id)
        }
        onReject={() =>
          materialDetailModal.material &&
          handleRejectMaterial(
            materialDetailModal.material.id,
            materialDetailModal.material.nombre,
          )
        }
        loading={processingId !== null}
      />
    </div>
  );
}