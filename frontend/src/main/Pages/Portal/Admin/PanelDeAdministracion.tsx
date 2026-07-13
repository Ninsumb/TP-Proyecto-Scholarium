import { useState, useEffect, useCallback } from "react";
import {
  Users, History, Vote,
  ChevronUp, ChevronDown, Check, X, Clock, Loader2,
  Lock,
  Unlock,
  UserMinus,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { adminService } from "../../../services/AdminService";
import { authService } from "../../../services/AuthService";
import { usePortalContext } from "../../../hooks/usePortalContext";
import { useToast } from "../../../hooks/useToast";
import { Toast } from "../../../Components/common/Toast";
import { Modal } from "../../../Components/common/Modal";
import { ContextMenu } from "../../../Components/common/ContextMenu";
import { Pagination } from "../../../Components/common/Pagination";
import type { AccionAdminResponse } from "../../../types/Admin/Admin";

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
  bloqueado: Boolean
}

function ActionMenu({ member, currentUserId, onAction, bloqueado}: ActionMenuProps) {
  // El admin no ve las opciones de degradar/remover/bloquear sobre sí mismo
  if (member.usuarioId === currentUserId) return null;

  const actions =
      bloqueado ? [
          { label: "Desbloquear",              value: "unblock"}
      ] : member.rol === "ADMIN"
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

  const actionIcon: Record<string, React.ReactNode> = {
    promote: <ChevronUp className="w-4 h-4 text-primary" />,
    demote: <ChevronDown className="w-4 h-4" />,
    kick: <UserMinus className="w-4 h-4" />,
    ban: <Lock className="w-4 h-4" />,
    unblock: <Unlock className="w-4 h-4 text-primary" />,
  };

  return (
    <ContextMenu
      items={actions.map((action) => ({
        label: action.label,
        icon: actionIcon[action.value],
        onClick: () => onAction(action.value, member),
        danger: action.value === "kick" || action.value === "ban",
      }))}
    />
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
    <Modal onClose={onClose} maxWidth="32rem">
        <div className="border-b border-border px-6 py-4 flex items-center gap-3">
          <div
            className="w-9 h-9 flex items-center justify-center shrink-0 bg-primary/10 text-primary"
            style={{ borderRadius: "var(--radius-sm)" }}
          >
            <ShieldCheck className="w-4.5 h-4.5" />
          </div>
          <h2 className="text-card-foreground font-medium">{info.title}</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-foreground mb-6 leading-relaxed">{info.text}</p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 border border-border hover:bg-accent transition-colors disabled:opacity-50"
              style={{ borderRadius: "var(--radius-sm)" }}
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`px-5 py-2.5 transition-colors flex items-center gap-2 disabled:opacity-50 ${info.btnClass}`}
              style={{ borderRadius: "var(--radius-sm)", boxShadow: "var(--portal-shadow-card)" }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirmar
            </button>
          </div>
        </div>
    </Modal>
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
    <Modal onClose={handleClose} maxWidth="32rem">
        <div className="border-b border-border px-6 py-4 flex items-center gap-3">
          <div
            className="w-9 h-9 flex items-center justify-center shrink-0 bg-primary/10 text-primary"
            style={{ borderRadius: "var(--radius-sm)" }}
          >
            <Vote className="w-4.5 h-4.5" />
          </div>
          <h2 className="text-card-foreground font-medium">{title}</h2>
        </div>
        <div className="p-6 space-y-4">
          <div
            className="p-4 bg-primary/5 border border-primary/20"
            style={{ borderRadius: "var(--radius)" }}
          >
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
              className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none disabled:opacity-50 transition-shadow"
              style={{ borderRadius: "var(--radius-sm)" }}
              placeholder="Explica por qué propones esta acción. Todos los administradores verán este mensaje."
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-5 py-2.5 border border-border hover:bg-accent transition-colors disabled:opacity-50"
              style={{ borderRadius: "var(--radius-sm)" }}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!reason.trim() || loading}
              className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{ borderRadius: "var(--radius-sm)", boxShadow: "var(--portal-shadow-card)" }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Abrir Votación
            </button>
          </div>
        </div>
    </Modal>
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
    <Modal onClose={onClose} maxWidth="32rem">
        <div className="border-b border-border px-6 py-4 flex items-center gap-3">
          <div
            className="w-9 h-9 flex items-center justify-center shrink-0"
            style={{
              borderRadius: "var(--radius-sm)",
              background: voteType === "approve" ? "var(--portal-teal-soft)" : undefined,
              color: voteType === "approve" ? "var(--portal-teal-dim)" : undefined,
            }}
          >
            {voteType === "approve" ? (
              <Check className="w-4.5 h-4.5" />
            ) : (
              <X className="w-4.5 h-4.5 text-destructive" />
            )}
          </div>
          <h2 className="text-card-foreground font-medium">
            {voteType === "approve" ? "Aprobar Votación" : "Rechazar Votación"}
          </h2>
        </div>
        <div className="p-6">
          <div
            className={`p-4 border mb-4 ${voteType === "approve" ? "" : "bg-destructive/5 border-destructive/20"}`}
            style={
              voteType === "approve"
                ? { background: "var(--portal-teal-soft)", borderColor: "var(--portal-teal-border)" }
                : undefined
            }
          >
            <p className="text-sm text-foreground mb-2">
              <span className="font-medium">Acción propuesta:</span> {actionDescription}
            </p>
            {voteType === "approve" ? (
              <p className="text-sm text-foreground flex items-start gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--portal-amber)" }} />
                <span>
                  Si con tu voto se alcanza la mayoría necesaria,{" "}
                  <span className="font-medium">la acción se ejecutará de inmediato</span> y no podrá revertirse.
                </span>
              </p>
            ) : (
              <p className="text-sm text-foreground flex items-start gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--portal-amber)" }} />
                <span>
                  Una vez que rechaces esta votación,{" "}
                  <span className="font-medium">no podrás cambiar tu voto</span>.
                </span>
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
              style={{ borderRadius: "var(--radius-sm)" }}
            >
              Cancelar
            </button>
            <button
              onClick={() => { onConfirm(); }}
              disabled={loading}
              className={`px-5 py-2.5 transition-colors flex items-center gap-2 disabled:opacity-50 ${
                voteType === "approve"
                  ? "text-white hover:opacity-90"
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              }`}
              style={{
                borderRadius: "var(--radius-sm)",
                boxShadow: "var(--portal-shadow-card)",
                background: voteType === "approve" ? "var(--portal-teal)" : undefined,
              }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirmar {voteType === "approve" ? "Aprobación" : "Rechazo"}
            </button>
          </div>
        </div>
    </Modal>
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

// ─── Helpers de display del historial ────────────────────────────────────────

// ─── Configuración del historial ──────────────────────────────────────────────

// ─── AuditIcon ────────────────────────────────────────────────────────────────
// Íconos Lucide outline en SVG inline, 16x16, currentColor.

function AuditIcon({ tipo }: { tipo: string }) {
  const icons: Record<string, string> = {
    SOLICITUD_APROBADA:              'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM16 11l2 2 4-4',
    SOLICITUD_RECHAZADA:             'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM18 8l4 4M22 8l-4 4',
    SOLICITUDES_ESTADO_CAMBIADO:     'M5 12H3a9 9 0 1 0 9-9',
    PLANTILLA_SOLICITUD_ACTUALIZADA: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z',
    MATERIAL_APROBADO:               'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8ZM14 2v6h6M9 15l2 2 4-4',
    MATERIAL_RECHAZADO:              'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8ZM14 2v6h6M9.5 12.5 15 18M15 12.5l-5.5 5.5',
    MATERIAL_ELIMINADO:              'M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2',
    MIEMBRO_ASCENDIDO:               'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 16v6M9 19l3-3 3 3',
    MIEMBRO_DEGRADADO:               'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 16v6M9 22l3-3 3 3',
    MIEMBRO_EXPULSADO:               'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 11l-4 4M19 11l4 4',
    MIEMBRO_BLOQUEADO:               'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10ZM4.93 4.93l14.14 14.14',
    BLOQUEO_LEVANTADO:               'M8 11V7a4 4 0 0 1 8 0v1M5 11h14a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a1 1 0 0 1 1-1Z',
    PORTAL_ACTUALIZADO:              'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41',
    PORTAL_TIPO_ACCESO_CAMBIADO:     'M19 11H5m14 0a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2m14 0V9a2 2 0 0 0-2-2M5 11V9a2 2 0 0 1 2-2m0 0V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2M7 7h10',
    PORTAL_UNIVERSIDAD_CAMBIADA:     'M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4ZM5 21V10.85M19 21V10.85M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4',
    PORTAL_CARRERA_CAMBIADA:         'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15Z',
    PORTAL_ARCHIVADO:                'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16ZM12 22V12M3.27 6.96 12 12.01l8.73-5.05',
    CARPETA_CREADA:                  'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2ZM12 11v6M9 14h6',
    CARPETA_RENOMBRADA:              'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2ZM16 13l-3.5 3.5L11 18l.5-1.5L15 13l1 1ZM15 12l1.5 1.5',
    MATERIA_CREADA:                  'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 8v8M8 12h8',
    MATERIA_ACTUALIZADA:             'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z',
    MATERIA_MOVIDA:                  'M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20',
    MATERIA_ELIMINADA:               'M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6',
    TABLERO_CREADO:                  'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3zM12 8v8M8 12h8',
    TABLERO_ELIMINADO:               'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3zM10 10 14 14M10 14 14 10',
    POST_ELIMINADO:                  'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2ZM9.5 7.5 14.5 12.5M9.5 12.5 14.5 7.5',
    HOME_ACTUALIZADA:                'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2ZM9 22V12h6v10M16 13l-3.5 3.5L11 18l.5-1.5 3.5-3.5 1 1Z',
    VOTACION_CREADA:                 'M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3Z',
    VOTACION_APROBADA:               'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3',
    VOTACION_RECHAZADA:              'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10ZM15 9l-6 6M9 9l6 6',
  };

  const d = icons[tipo] ?? 'M12 5v14M5 12h14';

  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      {d.split('M').filter(Boolean).map((seg, i) => (
        <path key={i} d={'M' + seg} />
      ))}
    </svg>
  );
}

const ACCION_CFG: Record<string, {
  label: string;
  pillClass: string;
  icon: string;
  grupo: 'solicitudes' | 'material' | 'miembros' | 'portal' | 'votaciones';
}> = {
  SOLICITUD_APROBADA:              { label: 'Solicitud aprobada',            pillClass: 'success', icon: 'user-check',     grupo: 'solicitudes'  },
  SOLICITUD_RECHAZADA:             { label: 'Solicitud rechazada',           pillClass: 'danger',  icon: 'user-x',         grupo: 'solicitudes'  },
  SOLICITUDES_ESTADO_CAMBIADO:     { label: 'Solicitudes: estado cambiado',  pillClass: 'warning', icon: 'toggle-right',   grupo: 'solicitudes'  },
  PLANTILLA_SOLICITUD_ACTUALIZADA: { label: 'Plantilla de solicitudes',      pillClass: 'info',    icon: 'file-pencil',    grupo: 'solicitudes'  },
  MATERIAL_APROBADO:               { label: 'Material aprobado',             pillClass: 'success', icon: 'file-check',     grupo: 'material'     },
  MATERIAL_RECHAZADO:              { label: 'Material rechazado',            pillClass: 'danger',  icon: 'file-x',         grupo: 'material'     },
  MATERIAL_ELIMINADO:              { label: 'Material eliminado',            pillClass: 'danger',  icon: 'trash',          grupo: 'material'     },
  MIEMBRO_ASCENDIDO:               { label: 'Miembro ascendido',             pillClass: 'info',    icon: 'arrow-up',       grupo: 'miembros'     },
  MIEMBRO_DEGRADADO:               { label: 'Admin degradado',               pillClass: 'warning', icon: 'arrow-down',     grupo: 'miembros'     },
  MIEMBRO_EXPULSADO:               { label: 'Miembro expulsado',             pillClass: 'danger',  icon: 'user-minus',     grupo: 'miembros'     },
  MIEMBRO_BLOQUEADO:               { label: 'Miembro bloqueado',             pillClass: 'danger',  icon: 'ban',            grupo: 'miembros'     },
  BLOQUEO_LEVANTADO:               { label: 'Bloqueo levantado',             pillClass: 'success', icon: 'lock-open',      grupo: 'miembros'     },
  PORTAL_ACTUALIZADO:              { label: 'Portal actualizado',            pillClass: 'info',    icon: 'settings',       grupo: 'portal'       },
  PORTAL_TIPO_ACCESO_CAMBIADO:     { label: 'Tipo de acceso',                pillClass: 'warning', icon: 'lock',           grupo: 'portal'       },
  PORTAL_UNIVERSIDAD_CAMBIADA:     { label: 'Universidad cambiada',          pillClass: 'info',    icon: 'building',       grupo: 'portal'       },
  PORTAL_CARRERA_CAMBIADA:         { label: 'Carrera cambiada',              pillClass: 'info',    icon: 'book',           grupo: 'portal'       },
  PORTAL_ARCHIVADO:                { label: 'Portal archivado',              pillClass: 'danger',  icon: 'archive',        grupo: 'portal'       },
  CARPETA_CREADA:                  { label: 'Carpeta creada',                pillClass: 'success', icon: 'folder-plus',    grupo: 'portal'       },
  CARPETA_RENOMBRADA:              { label: 'Carpeta renombrada',            pillClass: 'info',    icon: 'folder',         grupo: 'portal'       },
  MATERIA_CREADA:                  { label: 'Materia creada',                pillClass: 'success', icon: 'book-2',         grupo: 'portal'       },
  MATERIA_ACTUALIZADA:             { label: 'Materia actualizada',           pillClass: 'info',    icon: 'pencil',         grupo: 'portal'       },
  MATERIA_MOVIDA:                  { label: 'Materia movida',                pillClass: 'info',    icon: 'arrows-move',    grupo: 'portal'       },
  MATERIA_ELIMINADA:               { label: 'Materia eliminada',             pillClass: 'danger',  icon: 'trash',          grupo: 'portal'       },
  TABLERO_CREADO:                  { label: 'Tablero creado',                pillClass: 'success', icon: 'layout-board',   grupo: 'portal'       },
  TABLERO_ELIMINADO:               { label: 'Tablero eliminado',             pillClass: 'danger',  icon: 'trash',          grupo: 'portal'       },
  POST_ELIMINADO:                  { label: 'Post eliminado',                pillClass: 'danger',  icon: 'message-off',    grupo: 'portal'       },
  HOME_ACTUALIZADA:                { label: 'Inicio actualizado',            pillClass: 'info',    icon: 'home-edit',      grupo: 'portal'       },
  VOTACION_CREADA:                 { label: 'Votación abierta',              pillClass: 'neutral', icon: 'vote',           grupo: 'votaciones'   },
  VOTACION_APROBADA:               { label: 'Votación aprobada',             pillClass: 'success', icon: 'circle-check',   grupo: 'votaciones'   },
  VOTACION_RECHAZADA:              { label: 'Votación rechazada',            pillClass: 'danger',  icon: 'circle-x',       grupo: 'votaciones'   },
  VOTACION_CERRADA:                { label: 'Votación cerrada',              pillClass: 'neutral', icon: 'neutral',        grupo: 'votaciones'   }
};

const ACCION_GRUPOS = [
  { key: 'all',        label: 'Todas'       },
  { key: 'miembros',   label: 'Miembros'    },
  { key: 'material',   label: 'Material'    },
  { key: 'solicitudes',label: 'Solicitudes' },
  { key: 'portal',     label: 'Portal'      },
  { key: 'votaciones', label: 'Votaciones'  },
] as const;

function relTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const m = Math.floor(diff / 60_000);
  const h = Math.floor(diff / 3_600_000);
  const d = Math.floor(diff / 86_400_000);
  if (m < 1)  return 'ahora';
  if (m < 60) return `${m} min`;
  if (h < 24) return `${h} h`;
  if (d < 7)  return `${d}d`;
  return new Date(isoString).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

// ─── AccionCard ───────────────────────────────────────────────────────────────

interface AccionCardProps {
  accion: AccionAdminResponse;
  cfg: { label: string; pillClass: string; icon?: string; grupo: string };
  initials: string;
}

function absTimeStr(isoString: string): string {
  return new Date(isoString).toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

// Color del icono container según pillClass — success/warning usan los acentos
// teal/amber del sistema, así que van como estilo inline (no son utilities de Tailwind).
const ICON_CONTAINER_CLS: Record<string, string> = {
  success: '',
  danger:  'bg-destructive/10 text-destructive',
  warning: '',
  info:    'bg-primary/10 text-primary',
  neutral: 'bg-surface-container text-on-surface-variant',
};

const ICON_CONTAINER_STYLE: Partial<Record<string, React.CSSProperties>> = {
  success: { background: "var(--portal-teal-soft)", color: "var(--portal-teal-dim)" },
  warning: { background: "var(--portal-amber-soft)", color: "var(--portal-amber-dim)" },
};

function AccionCard({ accion, cfg, initials }: AccionCardProps) {
  const [open, setOpen] = useState(false);
  const iconContainerCls = ICON_CONTAINER_CLS[cfg.pillClass] ?? ICON_CONTAINER_CLS.neutral;
  const iconContainerStyle = ICON_CONTAINER_STYLE[cfg.pillClass];
 
  // Detectar hex de color en entidadDescripcion (para cambios de color de portal)
  const hexColors = accion.entidadDescripcion
    ? extractHexColors(accion.entidadDescripcion)
    : [];
 
  return (
    <div
      className="portal-hoverable border border-border bg-card overflow-hidden"
      style={{ borderRadius: "var(--radius-sm)", boxShadow: "var(--portal-shadow-card)" }}
    >
      {/* Header — siempre visible, clickeable */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-3.5 py-3 text-left hover:bg-accent transition-colors"
      >
        {/* Ícono de acción */}
        <div
          className={`w-8 h-8 flex items-center justify-center shrink-0 ${iconContainerCls}`}
          style={{ borderRadius: "var(--radius-sm)", ...iconContainerStyle }}
        >
          <AuditIcon tipo={accion.tipo} />
        </div>
 
        {/* Texto principal */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground leading-tight truncate">
            {cfg.label}
          </p>
          <p className="text-xs text-on-surface-variant mt-0.5 truncate">
            {accion.entidadDescripcion ?? "—"}
          </p>
        </div>
 
        {/* Timestamp + chevron */}
        <div className="flex items-center gap-2 shrink-0">
          <time
            className="text-xs text-on-surface-variant tabular-nums"
            dateTime={accion.createdAt}
            title={absTimeStr(accion.createdAt)}
          >
            {relTime(accion.createdAt)}
          </time>
          <ChevronDown
            className={`w-3.5 h-3.5 text-on-surface-variant transition-transform duration-150 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>
 
      {/* Cuerpo expandible */}
      {open && (
        <div className="border-t border-border px-3.5 py-3 space-y-2.5">
 
          {/* ── Detalle ── */}
          {accion.entidadDescripcion && (
            <div className="flex items-start gap-2 text-xs">
              {/* Label con ancho fijo para alinear columna de valor */}
              <span className="text-on-surface-variant shrink-0 w-14 pt-px">Detalle</span>
              <span className="text-foreground flex items-center gap-1.5 flex-wrap">
                {accion.entidadDescripcion}
                <ColorDots colors={hexColors} />
              </span>
            </div>
          )}
 
          {/* ── Motivo (destacado) ── */}
          {accion.motivo && (
            <div className="flex items-start gap-2 text-xs">
              <span className="text-on-surface-variant shrink-0 w-14 pt-px">Motivo</span>
              {/* Recuadro destacado para el motivo */}
              <div
                className="flex-1 px-2.5 py-1.5 bg-surface-container border border-border text-foreground italic leading-relaxed"
                style={{ borderRadius: "var(--radius-sm)" }}
              >
                {accion.motivo}
              </div>
            </div>
          )}
 
          {/* ── Admin que ejecutó la acción ── */}
          <div className="flex items-center gap-2 pt-0.5">
            {/* Avatar con foto o iniciales */}
            <AdminAvatar
              nombre={accion.adminNombre}
              fotoPerfil={accion.adminFotoPerfil}
              initials={initials}
              size="sm"
            />
            {/* Fallback oculto inicialmente — se activa por JS si la img falla */}
            {accion.adminFotoPerfil && (
              <div
                className="w-6 h-6 bg-primary/10 text-primary items-center justify-center text-[10px] font-medium shrink-0 hidden"
                style={{ borderRadius: "50%" }}
              >
                {initials}
              </div>
            )}
            <span className="text-xs text-on-surface-variant">{accion.adminNombre}</span>
            <span className="text-xs text-on-surface-variant ml-auto tabular-nums">
              {absTimeStr(accion.createdAt)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helper: detectar hex color en un string ─────────────────────────────────
// Retorna el primer #RRGGBB o #RGB que encuentre, o null si no hay ninguno.
// ─── Helper: detectar hex colors en un string ────────────────────────────────
// Retorna todos los #RRGGBB / #RGB encontrados en orden de aparición.
function extractHexColors(text: string): string[] {
  return [...text.matchAll(/#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b/g)].map((m) => m[0]);
}

// ─── ColorDots ────────────────────────────────────────────────────────────────
// Muestra uno o dos dots de color inline. Si hay dos, los separa con una flecha.

function ColorDots({ colors }: { colors: string[] }) {
  if (colors.length === 0) return null;

  return (
    <span className="inline-flex items-center gap-1 shrink-0">
      {colors.length === 1 ? (
        <span
          className="inline-block w-2.5 h-2.5 rounded-full border border-black/10"
          style={{ backgroundColor: colors[0] }}
          title={colors[0]}
        />
      ) : (
        <>
          <span
            className="inline-block w-2.5 h-2.5 rounded-full border border-black/10"
            style={{ backgroundColor: colors[0] }}
            title={colors[0]}
          />
          <span className="text-on-surface-variant">→</span>
          <span
            className="inline-block w-2.5 h-2.5 rounded-full border border-black/10"
            style={{ backgroundColor: colors[1] }}
            title={colors[1]}
          />
        </>
      )}
    </span>
  );
}
 
// ─── AdminAvatar ─────────────────────────────────────────────────────────────
// Muestra la foto de perfil del admin si existe, o sus iniciales como fallback.
 
interface AdminAvatarProps {
  nombre: string;
  fotoPerfil: string | null;
  initials: string;
  size?: "sm" | "md" | "lg";
}
 
function AdminAvatar({ nombre, fotoPerfil, initials, size = "sm" }: AdminAvatarProps) {
  const dims = size === "sm" ? "w-6 h-6 text-[10px]" : size === "md" ? "w-8 h-8 text-xs" : "w-12 h-12 text-base"; 

  if (fotoPerfil) {
    return (
      <img
        src={fotoPerfil}
        alt={nombre}
        className={`${dims} rounded-full object-cover shrink-0`}
        onError={(e) => {
          // Si la imagen falla, ocultamos y mostramos fallback
          (e.currentTarget as HTMLImageElement).style.display = "none";
          (e.currentTarget.nextElementSibling as HTMLElement | null)?.style.setProperty("display", "flex");
        }}
      />
    );
  }
 
  return (
    <div
      className={`${dims} bg-primary/10 text-primary flex items-center justify-center font-medium shrink-0`}
      style={{ borderRadius: "50%" }}
    >
      {initials}
    </div>
  );
}


// ─── Componente principal ─────────────────────────────────────────────────────

export function AdminPanel() {
  const { portal } = usePortalContext();
  const portalId = portal?.id as number;
  const currentUserId = authService.getUserId();

  const [activeTab, setActiveTab] = useState<"members" | "history" | "votes" | "blocks">("members");
  const PAGE_SIZE = 6;
  const [membersPage, setMembersPage] = useState(1);
  const [blockedPage, setBlockedPage] = useState(1);
  const [votesPage, setVotesPage] = useState(1);
  const [closedVotesPage, setClosedVotesPage] = useState(1);

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

  // ── Estado de historial ──────────────────────────────────────────────────
  const [historialAcciones, setHistorialAcciones] = useState<AccionAdminResponse[]>([]);
  const [loadingHistorial, setLoadingHistorial]   = useState(false);
  const [historialError, setHistorialError]       = useState<string | null>(null);
  const [historialPage, setHistorialPage]         = useState(0);
  const [historialTotalPages, setHistorialTotalPages] = useState(0);
  const [historialFiltro, setHistorialFiltro] = useState<string>('all');

  // ── Estado de bloqueos ──────────────────────────────────────────────────
  const [blockedMembers, setBlockedMembers] = useState<MiembroResponse[]>([]);
  const [loadingBlockedMembers, setLoadingBlockedMembers] = useState(false);
  const [blockedMembersError, setBlockedMembersError] = useState<string | null>(null);

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

  useEffect(() => {
    setMembersPage(1);
  }, [members.length]);

  // ── Carga de miembros bloqueados ──────────────────────────────────────────

  const fetchBlockedMembers = useCallback(async () => {
    if (!portalId) return;
    setLoadingBlockedMembers(true);
    setBlockedMembersError(null);

    try{
      const data = await adminService.getMiembrosBloqueados(portalId);
      setBlockedMembers(data);
    } catch {
      setBlockedMembersError("No se pudieron cargar los miembros bloqueados.");
    } finally {
      setLoadingBlockedMembers(false);
    }

  }, [portalId])

  useEffect(() => {
    if (activeTab === "blocks") fetchBlockedMembers();
  }, [activeTab, fetchBlockedMembers])

  useEffect(() => {
    setBlockedPage(1);
  }, [blockedMembers.length]);

  // ── Carga de historial ────────────────────────────────────────────────────────

  const fetchHistorial = useCallback(async (page = 0) => {
    if (!portalId) return;
    setLoadingHistorial(true);
    setHistorialError(null);
    try {
      const data = await adminService.getHistorialAcciones(portalId, page, 30);
      if (page === 0) {
        setHistorialAcciones(data.content);
      } else {
        setHistorialAcciones(prev => [...prev, ...data.content]);
      }
      setHistorialPage(data.number);
      setHistorialTotalPages(data.totalPages);
    } catch {
      setHistorialError("No se pudo cargar el historial de acciones.");
    } finally {
      setLoadingHistorial(false);
    }
  }, [portalId]);

  useEffect(() => {
    if (activeTab === "history") fetchHistorial(0);
  }, [activeTab, fetchHistorial]);

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

  useEffect(() => {
    setVotesPage(1);
  }, [votes.length]);

  useEffect(() => {
    setClosedVotesPage(1);
  }, [closedVotes.length]);

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
            : updated.votosAFavor === updated.votosEnContra
              ? "Voto registrado. La votación terminó en empate."
              : "Voto registrado. La propuesta fue rechazada."
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 portal-fade-up">
      <div className="mb-8 flex items-center gap-4">
        <div
          className="w-11 h-11 flex items-center justify-center shrink-0 bg-primary/10 text-primary"
          style={{ borderRadius: "var(--radius-sm)" }}
        >
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-foreground mb-1.5">
            Panel de Administración
          </h1>
          <p className="text-on-surface-variant text-sm">
            Gestiona miembros, revisa el historial de acciones y participa en votaciones
          </p>
        </div>
      </div>

      {/* Feedback global */}

      {/* Tabs */}
      <div className="mb-6 border-b border-border">
        <div className="flex gap-1 flex-wrap">
          {[
            { key: "members", icon: Users,   label: "Miembros",            badge: null },
            { key: "history", icon: History, label: "Historial",           badge: null },
            { key: "votes",   icon: Vote,    label: "Votaciones",          badge: votes.length > 0 ? votes.length : null },
            { key: "blocks",  icon: Lock,    label: "Miembros bloqueados", badge: null},
          ].map(({ key, icon: Icon, label, badge }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as typeof activeTab)}
              className={`px-5 py-3 relative transition-colors duration-150 ${
                activeTab === key
                  ? "text-primary font-medium"
                  : "text-on-surface-variant hover:text-foreground hover:bg-accent/40"
              }`}
              style={{ borderRadius: "var(--radius-sm) var(--radius-sm) 0 0" }}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                {badge !== null && (
                  <span
                    className="min-w-[1.25rem] px-1.5 py-0.5 rounded-full text-xs font-medium text-center tabular-nums"
                    style={{ background: "var(--portal-amber)", color: "#ffffff" }}
                  >
                    {badge}
                  </span>
                )}
              </div>
              {activeTab === key && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-full" />
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
              {listaMiembros(members.slice((membersPage - 1) * PAGE_SIZE, membersPage * PAGE_SIZE), false)}
              {members.length === 0 && (
                <p className="text-center py-10 text-on-surface-variant text-sm">
                  No hay miembros en este portal todavía.
                </p>
              )}
              <Pagination
                page={membersPage}
                totalPages={Math.max(1, Math.ceil(members.length / PAGE_SIZE))}
                onPageChange={setMembersPage}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Historial ── */}
      {activeTab === "history" && (
  <div>
    {/* Filtros */}
    <div className="flex items-center gap-2 flex-wrap mb-5">
      {ACCION_GRUPOS.map(({ key, label }) => {
        const count = key === 'all'
          ? historialAcciones.length
          : historialAcciones.filter(a => ACCION_CFG[a.tipo]?.grupo === key).length;
        return (
          <button
            key={key}
            onClick={() => setHistorialFiltro(key)}
            className={`text-xs px-3 py-1.5 transition-colors duration-150 ${
              historialFiltro === key
                ? 'bg-primary/10 text-primary border border-primary/25 font-medium'
                : 'text-on-surface-variant hover:text-foreground hover:bg-accent/50 border border-transparent'
            }`}
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            {label}
            {count > 0 && (
              <span className={`ml-1.5 tabular-nums ${
                historialFiltro === key ? 'text-foreground' : 'text-on-surface-variant'
              }`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
      <span className="ml-auto text-xs text-on-surface-variant tabular-nums">
        {(() => {
          const t = historialFiltro === 'all'
            ? historialAcciones.length
            : historialAcciones.filter(a => ACCION_CFG[a.tipo]?.grupo === historialFiltro).length;
          return `${t} acción${t !== 1 ? 'es' : ''}`;
        })()}
      </span>
    </div>

    {/* Contenido */}
    {loadingHistorial && historialAcciones.length === 0 ? (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    ) : historialError ? (
      <p className="text-center py-10 text-destructive text-sm">{historialError}</p>
    ) : (() => {
      const filtered = historialFiltro === 'all'
        ? historialAcciones
        : historialAcciones.filter(a => ACCION_CFG[a.tipo]?.grupo === historialFiltro);

      if (filtered.length === 0) return (
        <div className="flex flex-col items-center py-14 gap-2">
          <History className="w-7 h-7 text-on-surface-variant" />
          <p className="text-sm text-on-surface-variant">
            {historialAcciones.length === 0
              ? 'Las acciones administrativas aparecerán aquí a medida que se realicen.'
              : 'Sin acciones en esta categoría.'}
          </p>
        </div>
      );

      return (
        <div className="flex flex-col gap-1.5">
          {filtered.map((accion) => {
            const cfg = ACCION_CFG[accion.tipo] ?? {
              label: accion.tipo,
              pillClass: 'neutral',
              icon: 'dots',
              grupo: 'portal' as const,
            };
            const initials = accion.adminNombre
              .split(' ')
              .slice(0, 2)
              .map((n: string) => n[0]?.toUpperCase() ?? '')
              .join('');

            return (
              <AccionCard
                key={accion.id}
                accion={accion}
                cfg={cfg}
                initials={initials}
              />
            );
          })}
        </div>
      );
    })()}
    {/* Cargar más */}
        {historialPage + 1 < historialTotalPages && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => fetchHistorial(historialPage + 1)}
              disabled={loadingHistorial}
              className="px-5 py-2 border border-border text-sm text-on-surface-variant hover:text-foreground hover:bg-accent transition-colors flex items-center gap-2 disabled:opacity-50"
              style={{ borderRadius: 'var(--radius-sm)', boxShadow: 'var(--portal-shadow-card)' }}
            >
              {loadingHistorial
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <ChevronDown className="w-3.5 h-3.5" />
              }
              Cargar más
            </button>
          </div>
        )}
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
                  style={{ borderRadius: "var(--radius-lg)" }}
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
                {votes.slice((votesPage - 1) * PAGE_SIZE, votesPage * PAGE_SIZE).map((vote) => {
                  const isVoting = votingId === vote.id;
                  const hasVoted = vote.usuarioYaVoto;

                  return (
                    <div
                      key={vote.id}
                      className="bg-card border border-border p-5"
                      style={{
                        borderRadius: "var(--radius-md)",
                        boxShadow: "var(--portal-shadow-card)",
                        borderLeft: "3px solid var(--primary)",
                      }}
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
                        style={{ borderRadius: "var(--radius-sm)" }}
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
                          style={{ borderRadius: "var(--radius-sm)" }}
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
                            <Check className="w-3.5 h-3.5" style={{ color: "var(--portal-teal)" }} />
                            {vote.votosAFavor} a favor
                          </span>
                          <span className="flex items-center gap-1">
                            <X className="w-3.5 h-3.5 text-destructive" />
                            {vote.votosEnContra} en contra
                          </span>
                        </div>
                      </div>

                      {hasVoted ? (
                        <div className="text-sm text-on-surface-variant text-center py-2">
                          Ya votaste
                      </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVote(vote.id, "approve")}
                            disabled={isVoting}
                            className="flex-1 px-4 py-2.5 text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                            style={{ borderRadius: "var(--radius-sm)", boxShadow: "var(--portal-shadow-card)", background: "var(--portal-teal)" }}
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
                            style={{ borderRadius: "var(--radius-sm)", boxShadow: "var(--portal-shadow-card)" }}
                          >
                            {isVoting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                            <span>Rechazar</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <Pagination
              page={votesPage}
              totalPages={Math.max(1, Math.ceil(votes.length / PAGE_SIZE))}
              onPageChange={setVotesPage}
            />
          </div>

          {/* Votaciones Cerradas */}
          <div className="mt-8">
            <button
              onClick={handleToggleClosedVotes}
              className="flex items-center gap-2 text-foreground hover:text-primary transition-colors mb-4"
            >
              <History className="w-4 h-4 text-on-surface-variant" />
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
                    {closedVotes.slice((closedVotesPage - 1) * PAGE_SIZE, closedVotesPage * PAGE_SIZE).map((vote) => {
                      const borderColor =
                        vote.estado === "APROBADA"
                          ? "var(--portal-teal)"
                          : vote.estado === "RECHAZADA"
                          ? "var(--destructive)"
                          : "var(--portal-amber)";

                      const badgeStyle =
                        vote.estado === "APROBADA"
                          ? { background: "var(--portal-teal-soft)", color: "var(--portal-teal-dim)", borderColor: "var(--portal-teal-border)" }
                          : vote.estado === "RECHAZADA"
                          ? undefined
                          : { background: "var(--portal-amber-soft)", color: "var(--portal-amber-dim)", borderColor: "var(--portal-amber-border)" };

                      const badgeLabel =
                        vote.estado === "APROBADA"
                          ? "Aprobada"
                          : vote.estado === "RECHAZADA"
                          ? "Rechazada"
                          : "Expirada";

                      return (
                        <div
                          key={vote.id}
                          className="bg-card p-5 border-l-4"
                          style={{
                            borderRadius: "var(--radius-md)",
                            boxShadow: "var(--portal-shadow-card)",
                            borderLeftColor: borderColor,
                          }}
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
                              className={`px-3 py-1 text-xs font-medium border ${badgeStyle ? "" : "bg-destructive/10 text-destructive border-destructive/20"}`}
                              style={{ borderRadius: "var(--radius-sm)", ...badgeStyle }}
                            >
                              {badgeLabel}
                            </span>
                          </div>

                          <div
                            className="p-3 bg-surface-container mb-3"
                            style={{ borderRadius: "var(--radius-sm)" }}
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
                                <Check className="w-3.5 h-3.5" style={{ color: "var(--portal-teal)" }} />
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
                    <Pagination
                      page={closedVotesPage}
                      totalPages={Math.max(1, Math.ceil(closedVotes.length / PAGE_SIZE))}
                      onPageChange={setClosedVotesPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Miembros bloqueados ── */}
      
      {activeTab === "blocks" && (
        <div>
          {/* -- Si esta vacio -- */}
          { loadingBlockedMembers ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-7 h-7 animate-spin text-primary" />
              </div>
            ) : blockedMembersError ? (
              <div className="text-center py-12 text-destructive text-sm">{votesError}</div>
            ) : blockedMembers.length == 0 ? (
            <div className="text-center py-12">
              <div
                className="w-16 h-16 bg-surface-container-low mx-auto mb-4 flex items-center justify-center"
                style={{ borderRadius: "var(--radius-lg)" }}
              >
                <Lock className="w-8 h-8 text-on-surface-variant" />
              </div>
              <h3 className="text-foreground mb-2">No hay miembros bloqueados</h3>
              <p className="text-on-surface-variant text-sm max-w-md mx-auto">
                Cuando bloquees usuarios, apareceran aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {listaMiembros(blockedMembers.slice((blockedPage - 1) * PAGE_SIZE, blockedPage * PAGE_SIZE), true)}
              <Pagination
                page={blockedPage}
                totalPages={Math.max(1, Math.ceil(blockedMembers.length / PAGE_SIZE))}
                onPageChange={setBlockedPage}
              />
            </div>
          )
          }
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

  function listaMiembros(members: MiembroResponse[], bloqueados: Boolean): import("react").ReactNode {
    return members.map((member) => (
      <div
        key={member.membresiaId}
        className="bg-card border border-border p-4 flex items-center justify-between transition-shadow"
        style={{ borderRadius: "var(--radius)", boxShadow: "var(--portal-shadow-card)" }}
      >
        <div className="flex items-center gap-3 flex-1">
          <AdminAvatar
            nombre={member.nombre}
            fotoPerfil={member.fotoPerfil}
            initials={getInitials(member.nombre)}
            size="lg" />
          <div className="flex-1">
            <h3 className="text-foreground font-medium">{member.nombre}</h3>
            <div className="flex items-center gap-2 mt-1">
              { bloqueados ? (
                <>
                <span
                className={`px-2 py-0.5 text-xs font-medium bg-surface-container text-on-surface-variant border border-border`}
                style={{ borderRadius: "var(--radius-sm)" }}
              >
                Bloqueado
              </span>

              <span className="text-xs text-on-surface-variant">
                Bloqueado desde{" "}
                {new Date(member.fechaRegistro).toLocaleDateString("es-ES")}
              </span>
              </>
              ): (
                <>
                <span
                className={`px-2 py-0.5 text-xs font-medium ${member.rol === "ADMIN"
                    ? "bg-destructive/10 text-destructive border border-destructive/20"
                    : "bg-surface-container text-on-surface-variant"}`}
                style={{ borderRadius: "var(--radius-sm)" }}
              >
                {rolLabel(member.rol)}
              </span>
              
              <span className="text-xs text-on-surface-variant">
                Miembro desde{" "}
                {new Date(member.fechaRegistro).toLocaleDateString("es-ES")}
              </span>
              </>
              )}
              
              
            </div>
          </div>
        </div>
        {

        }
        <ActionMenu
          member={member}
          currentUserId={currentUserId}
          onAction={handleMemberAction}
          bloqueado={bloqueados} />
      </div>
    ));
  }
}