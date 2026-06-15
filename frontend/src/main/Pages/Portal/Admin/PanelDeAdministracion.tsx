import { useState, useEffect, useCallback } from "react";
import {
  Users, History, Vote, MoreVertical,
  ChevronUp, ChevronDown, Check, X, Clock, Loader2,
} from "lucide-react";
import { adminService } from "../../../services/AdminService";
import { authService } from "../../../services/AuthService";
import { usePortalContext } from "../../../hooks/usePortalContext";
import { useToast } from "../../../hooks/useToast";
import { Toast } from "../../../Components/common/Toast";

import type {
  MiembroResponse,
  VotacionResponse,
  RolMembresia,
  CrearVotacionRequest,
} from "../../../types/Admin/Admin";

// ─── ActionMenu (Gestión de acciones sobre miembros) ─────────────────────────

interface ActionMenuProps {
  member: MiembroResponse;
  currentUserId: number | null;
  onAction: (action: string, member: MiembroResponse) => void;
}

function ActionMenu({ member, currentUserId, onAction }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  // El admin no ve las opciones de degradar/remover/bloquear sobre sí mismo
  if (member.usuarioId === currentUserId) return null;

  const actions =
    member.rol === "ADMIN"
      ? [
          { label: "Degradar a Miembro",       value: "demote" },
          { label: "Expulsar",                 value: "kick" },
          { label: "Bloquear",                 value: "ban" },
        ]
      : [
          { label: "Ascender a Administrador", value: "promote" },
          { label: "Expulsar",                 value: "kick" },
          { label: "Bloquear",                 value: "ban" },
        ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 hover:bg-accent transition-colors"
        style={{ borderRadius: "var(--radius)" }}
      >
        <MoreVertical className="w-4 h-4 text-on-surface-variant" />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div
            className="absolute right-0 top-full mt-1 bg-surface-container-low shadow-lg border border-border z-20 min-w-[200px]"
            style={{ borderRadius: "var(--radius)" }}
          >
            {actions.map((action) => (
              <button
                key={action.value}
                onClick={() => {
                  onAction(action.value, member);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors first:rounded-t-sm last:rounded-b-sm"
              >
                {action.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Modal de confirmación de Acción Directa sobre Miembro ────────────────────

interface MemberActionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: string;
  memberName: string;
  loading?: boolean;
}

function MemberActionConfirmModal({
  isOpen, onClose, onConfirm, action, memberName, loading
}: MemberActionConfirmModalProps) {
  if (!isOpen) return null;

  // Ya solo queda Ascender como acción directa
  const info = {
    promote: { 
      title: "Ascender a Administrador", 
      text: `¿Estás seguro que deseas ascender a ${memberName} a administrador?`, 
      btnClass: "bg-primary text-primary-foreground hover:bg-primary-dim" 
    }
  }[action] || { title: "Confirmar Acción", text: "¿Estás seguro?", btnClass: "bg-primary" };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card max-w-lg w-full shadow-2xl" style={{ borderRadius: "var(--radius)" }}>
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-card-foreground">{info.title}</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-foreground mb-6">{info.text}</p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 border border-border hover:bg-accent transition-colors disabled:opacity-50"
              style={{ borderRadius: "var(--radius)" }}
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`px-5 py-2.5 transition-colors flex items-center gap-2 disabled:opacity-50 ${info.btnClass}`}
              style={{ borderRadius: "var(--radius)" }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal de propuesta de votación ──────────────────────────────────────────

interface VoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
  actionDescription: string;
  loading?: boolean;
}

function VoteModal({ isOpen, onClose, onConfirm, title, actionDescription, loading }: VoteModalProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (isOpen) setReason("");
  }, [isOpen]);

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card max-w-lg w-full shadow-2xl" style={{ borderRadius: "var(--radius)" }}>
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-card-foreground">{title}</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="p-4 bg-primary/5 border border-primary/20" style={{ borderRadius: "var(--radius)" }}>
            <p className="text-sm text-foreground">
              <span className="font-medium">Acción propuesta:</span> {actionDescription}
            </p>
          </div>
          <p className="text-sm text-on-surface-variant">
            Esta acción requiere votación de todos los administradores.
          </p>
          <div>
            <label className="block mb-2 text-sm font-medium text-foreground">
              Motivo de la propuesta <span className="text-destructive">*</span>
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none disabled:opacity-50"
              style={{ borderRadius: "var(--radius)" }}
              placeholder="Explica por qué propones esta acción. Todos los administradores verán este mensaje."
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-5 py-2.5 border border-border hover:bg-accent transition-colors disabled:opacity-50"
              style={{ borderRadius: "var(--radius)" }}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!reason.trim() || loading}
              className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{ borderRadius: "var(--radius)" }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Abrir Votación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal de confirmación de voto ────────────────────────────────────────────

interface VoteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  voteType: "approve" | "reject";
  actionDescription: string;
  loading?: boolean;
}

function VoteConfirmModal({
  isOpen, onClose, onConfirm, voteType, actionDescription, loading,
}: VoteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card max-w-lg w-full shadow-2xl" style={{ borderRadius: "var(--radius)" }}>
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-card-foreground">
            {voteType === "approve" ? "Aprobar Votación" : "Rechazar Votación"}
          </h2>
        </div>
        <div className="p-6">
          <div
            className={`p-4 border mb-4 ${
              voteType === "approve"
                ? "bg-green-600/5 border-green-600/20"
                : "bg-destructive/5 border-destructive/20"
            }`}
            style={{ borderRadius: "var(--radius)" }}
          >
            <p className="text-sm text-foreground mb-2">
              <span className="font-medium">Acción propuesta:</span> {actionDescription}
            </p>
            {voteType === "approve" ? (
              <p className="text-sm text-foreground">
                ⚠️ Si con tu voto se alcanza la mayoría necesaria,{" "}
                <span className="font-medium">la acción se ejecutará de inmediato</span> y no podrá revertirse.
              </p>
            ) : (
              <p className="text-sm text-foreground">
                ⚠️ Una vez que rechaces esta votación,{" "}
                <span className="font-medium">no podrás cambiar tu voto</span>.
              </p>
            )}
          </div>
          <p className="text-sm text-on-surface-variant mb-6">
            ¿Estás seguro de que deseas {voteType === "approve" ? "aprobar" : "rechazar"} esta votación?
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 border border-border hover:bg-accent transition-colors disabled:opacity-50"
              style={{ borderRadius: "var(--radius)" }}
            >
              Cancelar
            </button>
            <button
              onClick={() => { onConfirm(); }}
              disabled={loading}
              className={`px-5 py-2.5 transition-colors flex items-center gap-2 disabled:opacity-50 ${
                voteType === "approve"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              }`}
              style={{ borderRadius: "var(--radius)" }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirmar {voteType === "approve" ? "Aprobación" : "Rechazo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helper: etiqueta legible de TipoVotacion ────────────────────────────────

const TIPO_LABEL: Record<string, string> = {
  EXPULSION_MIEMBRO:  "Expulsión de miembro",
  BLOQUEO_MIEMBRO:    "Bloqueo de miembro",
  DEGRADAR_ADMIN:     "Degradar administrador",
  CAMBIO_TIPO_ACCESO: "Cambio de tipo de acceso",
  CAMBIO_UNIVERSIDAD: "Cambio de universidad",
  CAMBIO_CARRERA:     "Cambio de carrera",
  ELIMINAR_MATERIA:   "Eliminación de materia",
  ELIMINAR_TABLERO:   "Eliminación de tablero",
  ARCHIVAR_PORTAL:    "Archivar portal",
};

function parseMetadatosLegible(tipo: string, metadatos: string | null): string | null {
  if (!metadatos) return null;
  try {
    const parsed = JSON.parse(metadatos);
    switch (tipo) {
      case "CAMBIO_UNIVERSIDAD":
        return `Nuevo nombre: "${parsed.nuevoValor}"`;
      case "CAMBIO_CARRERA":
        return `Nuevo nombre: "${parsed.nuevoValor}"`;
      case "CAMBIO_TIPO_ACCESO":
        return `Nuevo tipo de acceso: ${parsed.nuevoTipoAcceso === "ABIERTO" ? "Abierto" : "Cerrado"}`;
      case "EXPULSION_MIEMBRO":
        return parsed.nombreMiembro ? `Miembro: ${parsed.nombreMiembro}` : null;
      case "DEGRADAR_ADMIN":
        return parsed.nombreMiembro ? `Administrador: ${parsed.nombreMiembro}` : null;
      case "BLOQUEO_MIEMBRO":
        return parsed.nombreMiembro ? `Miembro: ${parsed.nombreMiembro}` : null;
      default:
        return null;
    }
  } catch {
    return null;
  }
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function AdminPanel() {
  const { portal } = usePortalContext();
  const portalId = portal?.id as number;
  const currentUserId = authService.getUserId();

  const [activeTab, setActiveTab] = useState<"members" | "history" | "votes">("members");

  // ── Estado de miembros ────────────────────────────────────────────────────
  const [members, setMembers]         = useState<MiembroResponse[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [membersError, setMembersError]     = useState<string | null>(null);

  // ── Estado de votaciones ──────────────────────────────────────────────────
  const [votes, setVotes]               = useState<VotacionResponse[]>([]);
  const [closedVotes, setClosedVotes]   = useState<VotacionResponse[]>([]);
  const [loadingVotes, setLoadingVotes] = useState(false);
  const [votesError, setVotesError]     = useState<string | null>(null);
  const [showClosedVotes, setShowClosedVotes] = useState(false);
  const [loadingClosedVotes, setLoadingClosedVotes] = useState(false);

  // Loading al votar u operar sobre un miembro
  const [votingId, setVotingId] = useState<number | null>(null);
  const [isExecutingAction, setIsExecutingAction] = useState(false);

  const { toast, showToast } = useToast();

  const showSuccess = (msg: string) => showToast(msg, "success");
  const setError    = (msg: string | null) => { if (msg) showToast(msg, "error"); };

  // ── Modales ───────────────────────────────────────────────────────────────

  const [voteModal, setVoteModal] = useState<{
    isOpen: boolean;
    title: string;
    actionDescription: string;
    action: string;
    member: MiembroResponse | null;
  }>({ isOpen: false, title: "", actionDescription: "", action: "", member: null });

  const [voteConfirmModal, setVoteConfirmModal] = useState<{
    isOpen: boolean;
    voteType: "approve" | "reject";
    voteId: number;
    actionDescription: string;
  }>({ isOpen: false, voteType: "approve", voteId: 0, actionDescription: "" });

  const [memberActionModal, setMemberActionModal] = useState<{
    isOpen: boolean;
    action: string;
    member: MiembroResponse | null;
  }>({ isOpen: false, action: "", member: null });

  // ── Carga de miembros ─────────────────────────────────────────────────────

  const fetchMembers = useCallback(async () => {
    if (!portalId) return;
    setLoadingMembers(true);
    setMembersError(null);
    try {
      const data = await adminService.getMiembros(portalId);
      setMembers(data);
    } catch {
      setMembersError("No se pudieron cargar los miembros.");
    } finally {
      setLoadingMembers(false);
    }
  }, [portalId]);

  useEffect(() => {
    if (activeTab === "members") fetchMembers();
  }, [activeTab, fetchMembers]);

  // ── Carga de votaciones abiertas ──────────────────────────────────────────

  const fetchVotes = useCallback(async () => {
    if (!portalId) return;
    setLoadingVotes(true);
    setVotesError(null);
    try {
      const data = await adminService.getVotaciones(portalId, "ABIERTA");
      setVotes(data);
    } catch {
      setVotesError("No se pudieron cargar las votaciones.");
    } finally {
      setLoadingVotes(false);
    }
  }, [portalId]);

  useEffect(() => {
    if (activeTab === "votes") fetchVotes();
  }, [activeTab, fetchVotes]);

  // ── Carga de votaciones cerradas (lazy) ───────────────────────────────────

  const fetchClosedVotes = useCallback(async () => {
    if (!portalId || closedVotes.length > 0) return;
    setLoadingClosedVotes(true);
    try {
      const page = await adminService.getHistorialVotaciones(portalId, 0, 20);
      setClosedVotes(page.content);
    } catch {
      setError("No se pudo cargar el historial de votaciones.");
    } finally {
      setLoadingClosedVotes(false);
    }
  }, [portalId, closedVotes.length]);

  const handleToggleClosedVotes = () => {
    const next = !showClosedVotes;
    setShowClosedVotes(next);
    if (next) fetchClosedVotes();
  };

  // ── Acciones de miembro (Directas vs Votaciones) ─────────────────────────

  const handleMemberAction = (action: string, member: MiembroResponse) => {
    if (action === "promote") {
      // Ascender sigue siendo la única acción directa
      setMemberActionModal({ isOpen: true, action, member });
    } else if (action === "kick" || action === "ban" || action === "demote") {
      // Degradar, Expulsar y Bloquear ahora abren el modal de votación solicitando el motivo
      let description = "";
      let title = "";
      
      if (action === "kick") {
        description = `Expulsión del miembro: ${member.nombre}`;
        title = "Proponer Expulsión de Miembro";
      } else if (action === "ban") {
        description = `Bloqueo del miembro: ${member.nombre}`;
        title = "Proponer Bloqueo de Miembro";
      } else if (action === "demote") {
        description = `Degradar administrador a miembro: ${member.nombre}`;
        title = "Proponer Degradar Administrador";
      }
      
      setVoteModal({
        isOpen: true,
        title,
        actionDescription: description,
        action,
        member
      });
    }
  };

  // Ejecutor de acciones directas (Promover)
  const confirmMemberAction = async () => {
    if (!memberActionModal.member || !portalId) return;
    
    const { action, member } = memberActionModal;
    const uId = member.usuarioId;
    setIsExecutingAction(true);
    setError(null);

    try {
      if (action === "promote") {
        await adminService.promoverAdmin(portalId, uId);
        showSuccess(`Se ha ascendido a ${member.nombre} a Administrador.`);
      }
      await fetchMembers(); 
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const msg = axiosErr?.response?.data?.message ?? "Ocurrió un error al ejecutar la acción sobre el miembro.";
      setError(msg);
    } finally {
      setIsExecutingAction(false);
      setMemberActionModal({ isOpen: false, action: "", member: null });
    }
  };

  // Ejecutor de propuestas de votación (Degradar / Expulsar / Bloquear)
  const handleCreateVoteProposal = async (reason: string) => {
    if (!voteModal.member || !portalId) return;

    const { action, member } = voteModal;
    setIsExecutingAction(true);
    setError(null);

    let tipoVotacion: CrearVotacionRequest["tipo"] | "" = "";
    let actionLabel = "";

    if (action === "kick") {
      tipoVotacion = "EXPULSION_MIEMBRO";
      actionLabel = "expulsar";
    } else if (action === "ban") {
      tipoVotacion = "BLOQUEO_MIEMBRO";
      actionLabel = "bloquear";
    } else if (action === "demote") {
      tipoVotacion = "DEGRADAR_ADMIN";
      actionLabel = "degradar";
    }

    try {
      if (!tipoVotacion) return;

      await adminService.crearVotacion(portalId, {
        tipo: tipoVotacion,
        motivo: reason,
        entidadId: String(member.usuarioId),
        metadatos: JSON.stringify({ nombreMiembro: member.nombre }),
      });

      showSuccess(`Se ha abierto la votación para ${actionLabel} a ${member.nombre}.`);
      
      if (activeTab === "votes") {
        const data = await adminService.getVotaciones(portalId, "ABIERTA");
        setVotes(data);
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const msg = axiosErr?.response?.data?.message ?? "No se pudo iniciar la propuesta de votación.";
      setError(msg);
    } finally {
      setIsExecutingAction(false);
      setVoteModal({ isOpen: false, title: "", actionDescription: "", action: "", member: null });
    }
  };

  // ── Votaciones (Aprobar / Rechazar propuestas existentes) ──────────────────

  const handleVote = (voteId: number, voteType: "approve" | "reject") => {
    const vote = votes.find((v) => v.id === voteId);
    if (!vote) return;
    setVoteConfirmModal({
      isOpen: true,
      voteType,
      voteId,
      actionDescription: TIPO_LABEL[vote.tipo] ?? vote.tipo,
    });
  };

  const handleConfirmVoteAction = async () => {
    const { voteId, voteType } = voteConfirmModal;
    setVotingId(voteId);
    setVoteConfirmModal((prev) => ({ ...prev, isOpen: false }));
    try {
      const updated = await adminService.votar(voteId, { aprueba: voteType === "approve" });

      if (updated.estado !== "ABIERTA") {
        setVotes((prev) => prev.filter((v) => v.id !== voteId));
        setClosedVotes([]);
        showSuccess(
          updated.estado === "APROBADA"
            ? "¡Voto registrado! La votación alcanzó la mayoría y se ejecutó la acción."
            : "Voto registrado. La propuesta fue rechazada.",
        );
      } else {
        setVotes((prev) =>
          prev.map((v) => (v.id === voteId ? updated : v)),
        );
        showSuccess("Tu voto fue registrado correctamente.");
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const msg = axiosErr?.response?.data?.message ?? "No se pudo registrar el voto.";
      setError(msg);
    } finally {
      setVotingId(null);
    }
  };

  // ── Helpers de display ────────────────────────────────────────────────────

  const getTimeRemaining = (expiresAt: string) => {
    const now     = new Date();
    const expires = new Date(expiresAt);
    const diff    = expires.getTime() - now.getTime();
    if (diff <= 0) return "Expirada";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days  = Math.floor(hours / 24);
    if (days > 0)   return `${days} día${days > 1 ? "s" : ""}`;
    if (hours > 0)  return `${hours} hora${hours > 1 ? "s" : ""}`;
    return "Expira pronto";
  };

  const rolLabel = (rol: RolMembresia) =>
    rol === "ADMIN" ? "Administrador" : "Miembro";

  const getInitials = (nombre: string) =>
    nombre
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase() ?? "")
      .join("");

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-foreground mb-2">Panel de Administración</h1>
        <p className="text-on-surface-variant">
          Gestiona miembros, revisa el historial de acciones y participa en votaciones
        </p>
      </div>

      {/* Feedback global */}

      {/* Tabs */}
      <div className="mb-6 border-b border-border">
        <div className="flex gap-1">
          {[
            { key: "members", icon: Users,   label: "Miembros",    badge: null },
            { key: "history", icon: History, label: "Historial",   badge: null },
            { key: "votes",   icon: Vote,    label: "Votaciones",  badge: votes.length > 0 ? votes.length : null },
          ].map(({ key, icon: Icon, label, badge }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as typeof activeTab)}
              className={`px-6 py-3 relative transition-colors ${
                activeTab === key
                  ? "text-primary font-medium"
                  : "text-on-surface-variant hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                {badge !== null && (
                  <span
                    className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium"
                    style={{ borderRadius: "var(--radius)" }}
                  >
                    {badge}
                  </span>
                )}
              </div>
              {activeTab === key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab: Miembros ── */}
      {activeTab === "members" && (
        <div>
          {loadingMembers ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
            </div>
          ) : membersError ? (
            <div className="text-center py-12 text-destructive text-sm">{membersError}</div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.membresiaId}
                  className="bg-surface-container-lowest p-4 shadow-sm flex items-center justify-between"
                  style={{ borderRadius: "var(--radius)" }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-12 h-12 bg-primary/15 flex items-center justify-center text-primary"
                      style={{ borderRadius: "var(--radius)" }}
                    >
                      <span className="font-medium">{getInitials(member.nombre)}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-foreground font-medium">{member.nombre}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`px-2 py-0.5 text-xs font-medium ${
                            member.rol === "ADMIN"
                              ? "bg-destructive/10 text-destructive border border-destructive/20"
                              : "bg-surface-container text-on-surface-variant"
                          }`}
                          style={{ borderRadius: "var(--radius)" }}
                        >
                          {rolLabel(member.rol)}
                        </span>
                        <span className="text-xs text-on-surface-variant">
                          Miembro desde{" "}
                          {new Date(member.fechaRegistro).toLocaleDateString("es-ES")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ActionMenu 
                    member={member} 
                    currentUserId={currentUserId} 
                    onAction={handleMemberAction} 
                  />
                </div>
              ))}
              {members.length === 0 && (
                <p className="text-center py-10 text-on-surface-variant text-sm">
                  No hay miembros en este portal todavía.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Historial ── */}
      {activeTab === "history" && (
        <div className="text-center py-16">
          <div
            className="w-16 h-16 bg-surface-container-low mx-auto mb-4 flex items-center justify-center"
            style={{ borderRadius: "var(--radius)" }}
          >
            <History className="w-8 h-8 text-on-surface-variant" />
          </div>
          <h3 className="text-foreground mb-2">Historial de acciones</h3>
          <p className="text-on-surface-variant text-sm max-w-md mx-auto">
            El registro de acciones administrativas estará disponible próximamente.
          </p>
        </div>
      )}

      {/* ── Tab: Votaciones ── */}
      {activeTab === "votes" && (
        <div>
          <div className="mb-6">
            <h2 className="text-foreground font-medium mb-4">Votaciones Abiertas</h2>

            {loadingVotes ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-7 h-7 animate-spin text-primary" />
              </div>
            ) : votesError ? (
              <div className="text-center py-12 text-destructive text-sm">{votesError}</div>
            ) : votes.length === 0 ? (
              <div className="text-center py-12">
                <div
                  className="w-16 h-16 bg-surface-container-low mx-auto mb-4 flex items-center justify-center"
                  style={{ borderRadius: "var(--radius)" }}
                >
                  <Vote className="w-8 h-8 text-on-surface-variant" />
                </div>
                <h3 className="text-foreground mb-2">No hay votaciones abiertas</h3>
                <p className="text-on-surface-variant text-sm max-w-md mx-auto">
                  Cuando se propongan acciones que requieran consenso, aparecerán aquí.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {votes.map((vote) => {
                  const isVoting = votingId === vote.id;

                  return (
                    <div
                      key={vote.id}
                      className="bg-surface-container-lowest p-5 shadow-sm border-l-4 border-primary"
                      style={{ borderRadius: "var(--radius)" }}
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <h3 className="text-foreground font-medium mb-1">
                            {TIPO_LABEL[vote.tipo] ?? vote.tipo}
                          </h3>
                          <p className="text-sm text-on-surface-variant mb-2">
                            Propuesto por{" "}
                            <span className="font-medium text-foreground">
                              {vote.proponenteNombre}
                            </span>
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-on-surface-variant whitespace-nowrap">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{getTimeRemaining(vote.expiraEn)}</span>
                        </div>
                      </div>

                      <div
                        className="p-3 bg-surface-container mb-4"
                        style={{ borderRadius: "var(--radius)" }}
                      >
                        <p className="text-sm text-foreground">
                          <span className="font-medium">Motivo:</span> {vote.motivo}
                        </p>
                        {(() => {
                          const detalle = parseMetadatosLegible(vote.tipo, vote.metadatos ?? null);
                          return detalle ? (
                            <p className="text-sm text-foreground mt-1">
                              <span className="font-medium">Detalle:</span> {detalle}
                            </p>
                          ) : null;
                        })()}
                      </div>

                      {/* Barra de progreso */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm text-on-surface-variant mb-2">
                          <span>Progreso de votación</span>
                          <span className="font-medium">
                            {vote.votosAFavor + vote.votosEnContra} de {vote.totalAdmins} votos
                          </span>
                        </div>
                        <div
                          className="w-full h-2 bg-surface-container overflow-hidden"
                          style={{ borderRadius: "var(--radius)" }}
                        >
                          <div
                            className="h-full bg-primary transition-all"
                            style={{
                              width: `${
                                vote.totalAdmins > 0
                                  ? ((vote.votosAFavor + vote.votosEnContra) / vote.totalAdmins) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-on-surface-variant mt-2">
                          <span className="flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-green-600" />
                            {vote.votosAFavor} a favor
                          </span>
                          <span className="flex items-center gap-1">
                            <X className="w-3.5 h-3.5 text-destructive" />
                            {vote.votosEnContra} en contra
                          </span>
                        </div>
                      </div>

                      {/* Botones de votación */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVote(vote.id, "approve")}
                          disabled={isVoting}
                          className="flex-1 px-4 py-2.5 bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                          style={{ borderRadius: "var(--radius)" }}
                        >
                          {isVoting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          <span>Aprobar</span>
                        </button>
                        <button
                          onClick={() => handleVote(vote.id, "reject")}
                          disabled={isVoting}
                          className="flex-1 px-4 py-2.5 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                          style={{ borderRadius: "var(--radius)" }}
                        >
                          {isVoting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                          <span>Rechazar</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Votaciones Cerradas */}
          <div className="mt-8">
            <button
              onClick={handleToggleClosedVotes}
              className="flex items-center gap-2 text-foreground hover:text-primary transition-colors mb-4"
            >
              <span className="font-medium">Votaciones Cerradas</span>
              {showClosedVotes ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showClosedVotes && (
              <>
                {loadingClosedVotes ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {closedVotes.length === 0 && (
                      <p className="text-sm text-on-surface-variant text-center py-6">
                        No hay votaciones cerradas todavía.
                      </p>
                    )}
                    {closedVotes.map((vote) => {
                      const borderColor =
                        vote.estado === "APROBADA"
                          ? "border-green-600"
                          : vote.estado === "RECHAZADA"
                          ? "border-destructive"
                          : "border-yellow-600";

                      const badgeClass =
                        vote.estado === "APROBADA"
                          ? "bg-green-600/10 text-green-600 border-green-600/20"
                          : vote.estado === "RECHAZADA"
                          ? "bg-destructive/10 text-destructive border-destructive/20"
                          : "bg-yellow-600/10 text-yellow-600 border-yellow-600/20";

                      const badgeLabel =
                        vote.estado === "APROBADA"
                          ? "Aprobada"
                          : vote.estado === "RECHAZADA"
                          ? "Rechazada"
                          : "Expirada";

                      return (
                        <div
                          key={vote.id}
                          className={`bg-surface-container-lowest p-5 shadow-sm border-l-4 ${borderColor}`}
                          style={{ borderRadius: "var(--radius)" }}
                        >
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1">
                              <h3 className="text-foreground font-medium mb-1">
                                {TIPO_LABEL[vote.tipo] ?? vote.tipo}
                              </h3>
                              <p className="text-sm text-on-surface-variant">
                                Propuesto por{" "}
                                <span className="font-medium text-foreground">
                                  {vote.proponenteNombre}
                                </span>
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 text-xs font-medium border ${badgeClass}`}
                              style={{ borderRadius: "var(--radius)" }}
                            >
                              {badgeLabel}
                            </span>
                          </div>

                          <div
                            className="p-3 bg-surface-container mb-3"
                            style={{ borderRadius: "var(--radius)" }}
                          >
                            <p className="text-sm text-foreground">
                              <span className="font-medium">Motivo:</span> {vote.motivo}
                            </p>
                            {(() => {
                              const detalle = parseMetadatosLegible(vote.tipo, vote.metadatos ?? null);
                              return detalle ? (
                                <p className="text-sm text-foreground mt-1">
                                  <span className="font-medium">Detalle:</span> {detalle}
                                </p>
                              ) : null;
                            })()}
                          </div>

                          <div className="flex items-center justify-between text-xs text-on-surface-variant">
                            <span className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Check className="w-3.5 h-3.5 text-green-600" />
                                {vote.votosAFavor} a favor
                              </span>
                              <span className="flex items-center gap-1">
                                <X className="w-3.5 h-3.5 text-destructive" />
                                {vote.votosEnContra} en contra
                              </span>
                            </span>
                            {vote.resueltaEn && (
                              <span>
                                Cerrada el{" "}
                                {new Date(vote.resueltaEn).toLocaleDateString("es-ES")}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Modales del sistema ── */}
      
      {/* Modal para confirmación de acciones directas (ahora solo para Ascender) */}
      <MemberActionConfirmModal
        isOpen={memberActionModal.isOpen}
        onClose={() => setMemberActionModal({ isOpen: false, action: "", member: null })}
        onConfirm={confirmMemberAction}
        action={memberActionModal.action}
        memberName={memberActionModal.member?.nombre || ""}
        loading={isExecutingAction}
      />

      {/* Modal para apertura de votaciones (incluye Expulsar, Bloquear y Degradar) */}
      <VoteModal
        isOpen={voteModal.isOpen}
        onClose={() => setVoteModal({ isOpen: false, title: "", actionDescription: "", action: "", member: null })}
        onConfirm={handleCreateVoteProposal}
        title={voteModal.title}
        actionDescription={voteModal.actionDescription}
        loading={isExecutingAction}
      />

      {/* Modal para emitir un voto en propuestas abiertas */}
      <VoteConfirmModal
        isOpen={voteConfirmModal.isOpen}
        onClose={() => setVoteConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmVoteAction}
        voteType={voteConfirmModal.voteType}
        actionDescription={voteConfirmModal.actionDescription}
        loading={votingId !== null}
      />

      <Toast toast={toast} />   
    </div>
  );
}