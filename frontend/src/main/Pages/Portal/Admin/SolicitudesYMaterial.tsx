import { useState } from "react";
import { UserPlus, FileText, Check, X, Download, Calendar, User } from "lucide-react";

// Mock data para solicitudes
const mockRequests = [
  {
    id: 1,
    userName: "Juan García",
    profilePic: "JG",
    date: "2026-05-28",
    fullName: "Juan Manuel García Rodríguez",
    message:
      "Hola, soy estudiante de segundo año de Ingeniería Informática. Me gustaría unirme al portal para acceder a los materiales de estudio y participar en el foro. Estoy muy motivado para contribuir con material de estudio y ayudar a mis compañeros. Mi legajo es 45678 y curso activamente la carrera.",
  },
  {
    id: 2,
    userName: "María López",
    profilePic: "ML",
    date: "2026-05-27",
    fullName: "María Fernanda López",
    message:
      "Estudiante activa de la carrera, legajo 12345. Necesito acceso al material de Base de Datos II.",
  },
];

// Mock data para material pendiente
const mockMaterials = [
  {
    id: 1,
    title: "Resumen Unidad 3 - Algoritmos de Ordenamiento",
    subject: "Algoritmos y Estructuras de Datos",
    category: "Apunte",
    tags: ["QuickSort", "MergeSort", "Teoría"],
    uploader: "Carlos Méndez",
    uploadDate: "2026-05-29",
    fileSize: "2.4 MB",
  },
  {
    id: 2,
    title: "Parcial 2023 - Resuelto",
    subject: "Base de Datos I",
    category: "Parcial",
    tags: ["SQL", "Normalización"],
    uploader: "Ana Rodríguez",
    uploadDate: "2026-05-28",
    fileSize: "1.8 MB",
  },
];

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
  itemName: string;
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

interface RequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: (typeof mockRequests)[0] | null;
  onApprove: () => void;
  onReject: () => void;
}

interface MaterialDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: (typeof mockMaterials)[0] | null;
  onDownload: () => void;
  onApprove: () => void;
  onReject: () => void;
}

function ConfirmModal({ isOpen, onClose, onConfirm, title, message }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card max-w-lg w-full shadow-2xl" style={{ borderRadius: "var(--radius)" }}>
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-card-foreground">{title}</h2>
        </div>
        <div className="p-6">
          <p className="text-foreground mb-6">{message}</p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-border hover:bg-accent transition-colors"
              style={{ borderRadius: "var(--radius)" }}
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors"
              style={{ borderRadius: "var(--radius)" }}
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RejectModal({ isOpen, onClose, onConfirm, title, itemName }: RejectModalProps) {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason);
      setReason("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card max-w-lg w-full shadow-2xl" style={{ borderRadius: "var(--radius)" }}>
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
              className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              style={{ borderRadius: "var(--radius)" }}
              placeholder="Explica el motivo del rechazo. Este mensaje será visible para el usuario."
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-border hover:bg-accent transition-colors"
              style={{ borderRadius: "var(--radius)" }}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!reason.trim()}
              className="px-5 py-2.5 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderRadius: "var(--radius)" }}
            >
              Confirmar Rechazo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RequestDetailModal({
  isOpen,
  onClose,
  request,
  onApprove,
  onReject,
}: RequestDetailModalProps) {
  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card max-w-2xl w-full shadow-2xl" style={{ borderRadius: "var(--radius)" }}>
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-card-foreground">Solicitud de Membresía</h2>
        </div>
        <div className="p-6">
          <div className="flex gap-4 mb-5">
            <div
              className="w-16 h-16 bg-primary/15 flex items-center justify-center text-primary flex-shrink-0 text-xl font-medium"
              style={{ borderRadius: "var(--radius)" }}
            >
              {request.profilePic}
            </div>
            <div className="flex-1">
              <h3 className="text-foreground font-medium text-lg">{request.userName}</h3>
              <p className="text-sm text-on-surface-variant mb-1">{request.fullName}</p>
              <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(request.date).toLocaleDateString("es-ES")}</span>
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
                {request.message}
              </p>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-border hover:bg-accent transition-colors"
              style={{ borderRadius: "var(--radius)" }}
            >
              Cerrar
            </button>
            <button
              onClick={() => {
                onReject();
                onClose();
              }}
              className="px-5 py-2.5 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors flex items-center gap-2"
              style={{ borderRadius: "var(--radius)" }}
            >
              <X className="w-4 h-4" />
              <span>Rechazar</span>
            </button>
            <button
              onClick={() => {
                onApprove();
                onClose();
              }}
              className="px-5 py-2.5 bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-2"
              style={{ borderRadius: "var(--radius)" }}
            >
              <Check className="w-4 h-4" />
              <span>Aprobar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MaterialDetailModal({
  isOpen,
  onClose,
  material,
  onDownload,
  onApprove,
  onReject,
}: MaterialDetailModalProps) {
  if (!isOpen || !material) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card max-w-2xl w-full shadow-2xl" style={{ borderRadius: "var(--radius)" }}>
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-card-foreground">Detalle del Material</h2>
        </div>
        <div className="p-6">
          <div className="mb-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h3 className="text-foreground font-medium text-lg">{material.title}</h3>
              <div
                className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium whitespace-nowrap"
                style={{ borderRadius: "var(--radius)" }}
              >
                {material.category}
              </div>
            </div>
            <p className="text-sm text-on-surface-variant mb-3">{material.subject}</p>

            {material.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {material.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-surface-container text-on-surface-variant text-xs"
                    style={{ borderRadius: "var(--radius)" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div
              className="grid grid-cols-2 gap-4 p-4 bg-surface-container"
              style={{ borderRadius: "var(--radius)" }}
            >
              <div>
                <div className="text-xs text-on-surface-variant mb-1">Subido por</div>
                <div className="text-sm text-foreground font-medium">{material.uploader}</div>
              </div>
              <div>
                <div className="text-xs text-on-surface-variant mb-1">Fecha de subida</div>
                <div className="text-sm text-foreground font-medium">
                  {new Date(material.uploadDate).toLocaleDateString("es-ES")}
                </div>
              </div>
              <div>
                <div className="text-xs text-on-surface-variant mb-1">Tamaño del archivo</div>
                <div className="text-sm text-foreground font-medium">{material.fileSize}</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-border hover:bg-accent transition-colors"
              style={{ borderRadius: "var(--radius)" }}
            >
              Cerrar
            </button>
            <button
              onClick={() => {
                onDownload();
                onClose();
              }}
              className="px-5 py-2.5 border border-border hover:bg-accent transition-colors flex items-center gap-2"
              style={{ borderRadius: "var(--radius)" }}
            >
              <Download className="w-4 h-4" />
              <span>Descargar</span>
            </button>
            <button
              onClick={() => {
                onReject();
                onClose();
              }}
              className="px-5 py-2.5 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors flex items-center gap-2"
              style={{ borderRadius: "var(--radius)" }}
            >
              <X className="w-4 h-4" />
              <span>Rechazar</span>
            </button>
            <button
              onClick={() => {
                onApprove();
                onClose();
              }}
              className="px-5 py-2.5 bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-2"
              style={{ borderRadius: "var(--radius)" }}
            >
              <Check className="w-4 h-4" />
              <span>Aprobar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RequestsAndMaterial() {
  const [activeTab, setActiveTab] = useState<"requests" | "material">("requests");
  const [requests, setRequests] = useState(mockRequests);
  const [materials, setMaterials] = useState(mockMaterials);

  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    type: "request" | "material";
    id: number;
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
    request: (typeof mockRequests)[0] | null;
  }>({ isOpen: false, request: null });

  const [materialDetailModal, setMaterialDetailModal] = useState<{
    isOpen: boolean;
    material: (typeof mockMaterials)[0] | null;
  }>({ isOpen: false, material: null });

  const handleApproveRequest = (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Aprobar Solicitud",
      message:
        "¿Estás seguro de que deseas aprobar esta solicitud de membresía? El usuario obtendrá acceso completo al portal.",
      onConfirm: () => {
        setRequests(requests.filter((r) => r.id !== id));
      },
    });
  };

  const handleRejectRequest = (id: number, name: string) => {
    setRejectModal({ isOpen: true, type: "request", id, name });
  };

  const handleApproveMaterial = (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Aprobar Material",
      message:
        "¿Estás seguro de que deseas aprobar este material? Será visible para todos los miembros del portal.",
      onConfirm: () => {
        setMaterials(materials.filter((m) => m.id !== id));
      },
    });
  };

  const handleRejectMaterial = (id: number, name: string) => {
    setRejectModal({ isOpen: true, type: "material", id, name });
  };

  const handleConfirmReject = (reason: string) => {
    if (rejectModal.type === "request") {
      setRequests(requests.filter((r) => r.id !== rejectModal.id));
    } else {
      setMaterials(materials.filter((m) => m.id !== rejectModal.id));
    }
    console.log("Rejection reason:", reason);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-foreground mb-2">Solicitudes y Material</h1>
        <p className="text-on-surface-variant">
          Gestiona las solicitudes de membresía y modera el material de estudio subido por los
          miembros
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-border">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-6 py-3 relative transition-colors ${
              activeTab === "requests"
                ? "text-primary font-medium"
                : "text-on-surface-variant hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              <span>Solicitudes</span>
              {requests.length > 0 && (
                <span
                  className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium"
                  style={{ borderRadius: "var(--radius)" }}
                >
                  {requests.length}
                </span>
              )}
            </div>
            {activeTab === "requests" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("material")}
            className={`px-6 py-3 relative transition-colors ${
              activeTab === "material"
                ? "text-primary font-medium"
                : "text-on-surface-variant hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Material</span>
              {materials.length > 0 && (
                <span
                  className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium"
                  style={{ borderRadius: "var(--radius)" }}
                >
                  {materials.length}
                </span>
              )}
            </div>
            {activeTab === "material" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content: Solicitudes */}
      {activeTab === "requests" && (
        <div>
          {requests.length === 0 ? (
            <div className="text-center py-16">
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
              {requests.map((request) => (
                <div
                  key={request.id}
                  onClick={() => setRequestDetailModal({ isOpen: true, request })}
                  className="bg-surface-container-lowest p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  style={{ borderRadius: "var(--radius)" }}
                >
                  <div className="flex gap-4">
                    <div
                      className="w-14 h-14 bg-primary/15 flex items-center justify-center text-primary flex-shrink-0"
                      style={{ borderRadius: "var(--radius)" }}
                    >
                      <span className="font-medium">{request.profilePic}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="text-foreground font-medium">{request.userName}</h3>
                          <p className="text-sm text-on-surface-variant">{request.fullName}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-on-surface-variant flex-shrink-0">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(request.date).toLocaleDateString("es-ES")}</span>
                        </div>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed mb-4 line-clamp-2">
                        {request.message}
                      </p>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleApproveRequest(request.id)}
                          className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-2"
                          style={{ borderRadius: "var(--radius)" }}
                        >
                          <Check className="w-4 h-4" />
                          <span>Aprobar</span>
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id, request.userName)}
                          className="px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors flex items-center gap-2"
                          style={{ borderRadius: "var(--radius)" }}
                        >
                          <X className="w-4 h-4" />
                          <span>Rechazar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Material */}
      {activeTab === "material" && (
        <div>
          {materials.length === 0 ? (
            <div className="text-center py-16">
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
              {materials.map((material) => (
                <div
                  key={material.id}
                  onClick={() => setMaterialDetailModal({ isOpen: true, material })}
                  className="bg-surface-container-lowest p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  style={{ borderRadius: "var(--radius)" }}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="text-foreground font-medium mb-1">{material.title}</h3>
                      <p className="text-sm text-on-surface-variant">{material.subject}</p>
                    </div>
                    <div
                      className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium whitespace-nowrap"
                      style={{ borderRadius: "var(--radius)" }}
                    >
                      {material.category}
                    </div>
                  </div>

                  {material.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {material.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-surface-container text-on-surface-variant text-xs"
                          style={{ borderRadius: "var(--radius)" }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-on-surface-variant mb-4">
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      <span>{material.uploader}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(material.uploadDate).toLocaleDateString("es-ES")}</span>
                    </div>
                    <div>
                      <span className="font-medium">{material.fileSize}</span>
                    </div>
                  </div>

                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => alert("Descargando material...")}
                      className="px-4 py-2 border border-border hover:bg-accent transition-colors flex items-center gap-2"
                      style={{ borderRadius: "var(--radius)" }}
                    >
                      <Download className="w-4 h-4" />
                      <span>Descargar</span>
                    </button>
                    <button
                      onClick={() => handleApproveMaterial(material.id)}
                      className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-2"
                      style={{ borderRadius: "var(--radius)" }}
                    >
                      <Check className="w-4 h-4" />
                      <span>Aprobar</span>
                    </button>
                    <button
                      onClick={() => handleRejectMaterial(material.id, material.title)}
                      className="px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors flex items-center gap-2"
                      style={{ borderRadius: "var(--radius)" }}
                    >
                      <X className="w-4 h-4" />
                      <span>Rechazar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
      />

      <RejectModal
        isOpen={rejectModal.isOpen}
        onClose={() => setRejectModal({ ...rejectModal, isOpen: false })}
        onConfirm={handleConfirmReject}
        title={rejectModal.type === "request" ? "Rechazar Solicitud" : "Rechazar Material"}
        itemName={rejectModal.name}
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
            requestDetailModal.request.userName
          )
        }
      />

      <MaterialDetailModal
        isOpen={materialDetailModal.isOpen}
        onClose={() => setMaterialDetailModal({ isOpen: false, material: null })}
        material={materialDetailModal.material}
        onDownload={() => alert("Descargando material...")}
        onApprove={() =>
          materialDetailModal.material && handleApproveMaterial(materialDetailModal.material.id)
        }
        onReject={() =>
          materialDetailModal.material &&
          handleRejectMaterial(
            materialDetailModal.material.id,
            materialDetailModal.material.title
          )
        }
      />
    </div>
  );
}