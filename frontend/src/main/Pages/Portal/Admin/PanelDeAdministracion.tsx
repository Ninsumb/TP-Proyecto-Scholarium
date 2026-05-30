import { useState } from "react";
import {
  Users,
  History,
  Vote,
  MoreVertical,
  ChevronUp,
  ChevronDown,
  Check,
  X,
  Clock,
} from "lucide-react";

// Mock data
const mockMembers = [
  {
    id: 1,
    fullName: "Juan García",
    profilePic: "JG",
    role: "Administrador" as const,
    joinDate: "2026-01-15",
  },
  {
    id: 2,
    fullName: "María López",
    profilePic: "ML",
    role: "Miembro" as const,
    joinDate: "2026-02-20",
  },
  {
    id: 3,
    fullName: "Carlos Méndez",
    profilePic: "CM",
    role: "Miembro" as const,
    joinDate: "2026-03-10",
  },
];

const mockActions = [
  {
    id: 1,
    adminName: "Juan García",
    action: "Aprobó solicitud de membresía",
    target: "María López",
    date: "2026-05-29T14:30:00",
    details: null,
  },
  {
    id: 2,
    adminName: "Juan García",
    action: "Rechazó material",
    target: "Guía de Ejercicios - Unidad 2",
    date: "2026-05-28T10:15:00",
    details: "El material contiene errores en los ejercicios 3 y 5",
  },
  {
    id: 3,
    adminName: "María López",
    action: "Aprobó material",
    target: "Resumen Final - Algoritmos",
    date: "2026-05-27T16:45:00",
    details: null,
  },
];

const mockVotes = [
  {
    id: 1,
    proposerName: "Juan García",
    action: "Expulsar a Pedro Ramírez del portal",
    reason:
      "Comportamiento inapropiado y falta de respeto hacia otros miembros en el foro",
    votesFor: 2,
    votesAgainst: 0,
    totalAdmins: 4,
    expiresAt: "2026-06-02T23:59:59",
    status: "open" as const,
    userVote: null as "approve" | "reject" | null,
  },
  {
    id: 2,
    proposerName: "María López",
    action: "Degradar a Luis Fernández a Miembro",
    reason:
      "Falta de participación y ausencia prolongada en las responsabilidades de administración",
    votesFor: 1,
    votesAgainst: 1,
    totalAdmins: 4,
    expiresAt: "2026-06-01T18:00:00",
    status: "open" as const,
    userVote: "approve" as "approve" | "reject" | null,
  },
];

const mockClosedVotes = [
  {
    id: 3,
    proposerName: "Juan García",
    action: "Cambiar nombre de universidad a 'Universidad Nacional del Sur'",
    reason: "Actualización del nombre oficial de la institución",
    votesFor: 3,
    votesAgainst: 0,
    totalAdmins: 3,
    closedAt: "2026-05-25T12:00:00",
    result: "approved" as const,
  },
  {
    id: 4,
    proposerName: "Carlos Méndez",
    action: "Archivar portal",
    reason: "Baja actividad en el portal durante los últimos 6 meses",
    votesFor: 1,
    votesAgainst: 2,
    totalAdmins: 3,
    closedAt: "2026-05-20T09:30:00",
    result: "rejected" as const,
  },
];

interface VoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
  actionDescription: string;
}

interface VoteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  voteType: "approve" | "reject";
  actionDescription: string;
}

interface ActionMenuProps {
  member: (typeof mockMembers)[0];
  onAction: (action: string, needsVote: boolean) => void;
}

function VoteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  voteType,
  actionDescription,
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
                <span className="font-medium">la acción se ejecutará de inmediato</span> y no podrá
                revertirse.
              </p>
            ) : (
              <p className="text-sm text-foreground">
                ⚠️ Una vez que rechaces esta votación,{" "}
                <span className="font-medium">no podrás cambiar tu voto</span>.
              </p>
            )}
          </div>
          <p className="text-sm text-on-surface-variant mb-6">
            ¿Estás seguro de que deseas{" "}
            {voteType === "approve" ? "aprobar" : "rechazar"} esta votación?
          </p>
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
              className={`px-5 py-2.5 transition-colors ${
                voteType === "approve"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              }`}
              style={{ borderRadius: "var(--radius)" }}
            >
              Confirmar {voteType === "approve" ? "Aprobación" : "Rechazo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function VoteModal({ isOpen, onClose, onConfirm, title, actionDescription }: VoteModalProps) {
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
              className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              style={{ borderRadius: "var(--radius)" }}
              placeholder="Explica por qué propones esta acción. Todos los administradores verán este mensaje."
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
              className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderRadius: "var(--radius)" }}
            >
              Abrir Votación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionMenu({ member, onAction }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions =
    member.role === "Administrador"
      ? [
          { label: "Degradar a Miembro", value: "demote", needsVote: true },
          { label: "Expulsar", value: "kick", needsVote: true },
          { label: "Bloquear", value: "ban", needsVote: true },
        ]
      : [
          { label: "Ascender a Administrador", value: "promote", needsVote: false },
          { label: "Expulsar", value: "kick", needsVote: true },
          { label: "Bloquear", value: "ban", needsVote: true },
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
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div
            className="absolute right-0 top-full mt-1 bg-surface-container-low shadow-lg border border-border z-20 min-w-[200px]"
            style={{ borderRadius: "var(--radius)" }}
          >
            {actions.map((action) => (
              <button
                key={action.value}
                onClick={() => {
                  onAction(action.value, action.needsVote);
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

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<"members" | "history" | "votes">("members");
  const [members] = useState(mockMembers);
  const [actions] = useState(mockActions);
  const [votes, setVotes] = useState(mockVotes);
  const [closedVotes] = useState(mockClosedVotes);
  const [showClosedVotes, setShowClosedVotes] = useState(false);

  const [voteModal, setVoteModal] = useState<{
    isOpen: boolean;
    title: string;
    actionDescription: string;
  }>({ isOpen: false, title: "", actionDescription: "" });

  const [voteConfirmModal, setVoteConfirmModal] = useState<{
    isOpen: boolean;
    voteType: "approve" | "reject";
    voteId: number;
    actionDescription: string;
  }>({ isOpen: false, voteType: "approve", voteId: 0, actionDescription: "" });

  const handleMemberAction = (action: string, needsVote: boolean) => {
    const actionLabels: Record<string, string> = {
      promote: "Ascender a Administrador",
      demote: "Degradar a Miembro",
      kick: "Expulsar del portal",
      ban: "Bloquear del portal",
    };

    if (needsVote) {
      setVoteModal({
        isOpen: true,
        title: `Proponer: ${actionLabels[action]}`,
        actionDescription: actionLabels[action],
      });
    } else {
      if (confirm(`¿Estás seguro de que deseas ${actionLabels[action].toLowerCase()}?`)) {
        alert(`Acción ejecutada: ${actionLabels[action]}`);
      }
    }
  };

  const handleConfirmVote = (reason: string) => {
    console.log("Vote created:", reason);
    alert("Votación abierta correctamente");
  };

  const handleVote = (voteId: number, voteType: "approve" | "reject") => {
    const vote = votes.find((v) => v.id === voteId);
    if (!vote) return;

    setVoteConfirmModal({
      isOpen: true,
      voteType,
      voteId,
      actionDescription: vote.action,
    });
  };

  const handleConfirmVoteAction = () => {
    const { voteId, voteType } = voteConfirmModal;
    setVotes(
      votes.map((v) => {
        if (v.id === voteId) {
          return {
            ...v,
            userVote: voteType,
            votesFor: voteType === "approve" ? v.votesFor + 1 : v.votesFor,
            votesAgainst: voteType === "reject" ? v.votesAgainst + 1 : v.votesAgainst,
          };
        }
        return v;
      })
    );
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} día${days > 1 ? "s" : ""}`;
    if (hours > 0) return `${hours} hora${hours > 1 ? "s" : ""}`;
    return "Expira pronto";
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-foreground mb-2">Panel de Administración</h1>
        <p className="text-on-surface-variant">
          Gestiona miembros, revisa el historial de acciones y participa en votaciones
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-border">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("members")}
            className={`px-6 py-3 relative transition-colors ${
              activeTab === "members"
                ? "text-primary font-medium"
                : "text-on-surface-variant hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Miembros</span>
            </div>
            {activeTab === "members" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-3 relative transition-colors ${
              activeTab === "history"
                ? "text-primary font-medium"
                : "text-on-surface-variant hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4" />
              <span>Historial</span>
            </div>
            {activeTab === "history" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("votes")}
            className={`px-6 py-3 relative transition-colors ${
              activeTab === "votes"
                ? "text-primary font-medium"
                : "text-on-surface-variant hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <Vote className="w-4 h-4" />
              <span>Votaciones</span>
              {votes.length > 0 && (
                <span
                  className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium"
                  style={{ borderRadius: "var(--radius)" }}
                >
                  {votes.length}
                </span>
              )}
            </div>
            {activeTab === "votes" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content: Miembros */}
      {activeTab === "members" && (
        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-surface-container-lowest p-4 shadow-sm flex items-center justify-between"
              style={{ borderRadius: "var(--radius)" }}
            >
              <div className="flex items-center gap-3 flex-1">
                <div
                  className="w-12 h-12 bg-primary/15 flex items-center justify-center text-primary"
                  style={{ borderRadius: "var(--radius)" }}
                >
                  <span className="font-medium">{member.profilePic}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-foreground font-medium">{member.fullName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-2 py-0.5 text-xs font-medium ${
                        member.role === "Administrador"
                          ? "bg-destructive/10 text-destructive border border-destructive/20"
                          : "bg-surface-container text-on-surface-variant"
                      }`}
                      style={{ borderRadius: "var(--radius)" }}
                    >
                      {member.role}
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      Miembro desde {new Date(member.joinDate).toLocaleDateString("es-ES")}
                    </span>
                  </div>
                </div>
              </div>
              <ActionMenu member={member} onAction={handleMemberAction} />
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: Historial */}
      {activeTab === "history" && (
        <div className="space-y-3">
          {actions.map((action) => (
            <div
              key={action.id}
              className="bg-surface-container-lowest p-4 shadow-sm"
              style={{ borderRadius: "var(--radius)" }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 bg-primary/10 flex items-center justify-center flex-shrink-0"
                  style={{ borderRadius: "var(--radius)" }}
                >
                  <History className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{action.adminName}</span>{" "}
                    {action.action.toLowerCase()}:{" "}
                    <span className="font-medium">{action.target}</span>
                  </p>
                  {action.details && (
                    <div
                      className="mt-2 p-2 bg-surface-container text-sm text-on-surface-variant"
                      style={{ borderRadius: "var(--radius)" }}
                    >
                      {action.details}
                    </div>
                  )}
                  <p className="text-xs text-on-surface-variant mt-2">
                    {new Date(action.date).toLocaleString("es-ES")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: Votaciones */}
      {activeTab === "votes" && (
        <div>
          <div className="mb-6">
            <h2 className="text-foreground font-medium mb-4">Votaciones Abiertas</h2>
            {votes.length === 0 ? (
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
                {votes.map((vote) => (
                  <div
                    key={vote.id}
                    className="bg-surface-container-lowest p-5 shadow-sm border-l-4 border-primary"
                    style={{ borderRadius: "var(--radius)" }}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <h3 className="text-foreground font-medium mb-1">{vote.action}</h3>
                        <p className="text-sm text-on-surface-variant mb-2">
                          Propuesto por{" "}
                          <span className="font-medium text-foreground">{vote.proposerName}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-on-surface-variant whitespace-nowrap">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{getTimeRemaining(vote.expiresAt)}</span>
                      </div>
                    </div>

                    <div
                      className="p-3 bg-surface-container mb-4"
                      style={{ borderRadius: "var(--radius)" }}
                    >
                      <p className="text-sm text-foreground">
                        <span className="font-medium">Motivo:</span> {vote.reason}
                      </p>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm text-on-surface-variant mb-2">
                        <span>Progreso de votación</span>
                        <span className="font-medium">
                          {vote.votesFor + vote.votesAgainst} de {vote.totalAdmins} votos
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
                              ((vote.votesFor + vote.votesAgainst) / vote.totalAdmins) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-on-surface-variant mt-2">
                        <span className="flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-green-600" />
                          {vote.votesFor} a favor
                        </span>
                        <span className="flex items-center gap-1">
                          <X className="w-3.5 h-3.5 text-destructive" />
                          {vote.votesAgainst} en contra
                        </span>
                      </div>
                    </div>

                    {vote.userVote ? (
                      <div
                        className={`p-3 flex items-center gap-2 ${
                          vote.userVote === "approve"
                            ? "bg-green-600/10 text-green-600"
                            : "bg-destructive/10 text-destructive"
                        }`}
                        style={{ borderRadius: "var(--radius)" }}
                      >
                        {vote.userVote === "approve" ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium">
                          Ya votaste {vote.userVote === "approve" ? "a favor" : "en contra"}
                        </span>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVote(vote.id, "approve")}
                          className="flex-1 px-4 py-2.5 bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                          style={{ borderRadius: "var(--radius)" }}
                        >
                          <Check className="w-4 h-4" />
                          <span>Aprobar</span>
                        </button>
                        <button
                          onClick={() => handleVote(vote.id, "reject")}
                          className="flex-1 px-4 py-2.5 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors flex items-center justify-center gap-2"
                          style={{ borderRadius: "var(--radius)" }}
                        >
                          <X className="w-4 h-4" />
                          <span>Rechazar</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Votaciones Cerradas */}
          <div className="mt-8">
            <button
              onClick={() => setShowClosedVotes(!showClosedVotes)}
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
              <div className="space-y-3">
                {closedVotes.map((vote) => (
                  <div
                    key={vote.id}
                    className={`bg-surface-container-lowest p-5 shadow-sm border-l-4 ${
                      vote.result === "approved"
                        ? "border-green-600"
                        : vote.result === "rejected"
                        ? "border-destructive"
                        : "border-yellow-600"
                    }`}
                    style={{ borderRadius: "var(--radius)" }}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <h3 className="text-foreground font-medium mb-1">{vote.action}</h3>
                        <p className="text-sm text-on-surface-variant">
                          Propuesto por{" "}
                          <span className="font-medium text-foreground">{vote.proposerName}</span>
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-medium ${
                          vote.result === "approved"
                            ? "bg-green-600/10 text-green-600 border border-green-600/20"
                            : vote.result === "rejected"
                            ? "bg-destructive/10 text-destructive border border-destructive/20"
                            : "bg-yellow-600/10 text-yellow-600 border border-yellow-600/20"
                        }`}
                        style={{ borderRadius: "var(--radius)" }}
                      >
                        {vote.result === "approved"
                          ? "Aprobada"
                          : vote.result === "rejected"
                          ? "Rechazada"
                          : "Expirada"}
                      </span>
                    </div>

                    <div
                      className="p-3 bg-surface-container mb-3"
                      style={{ borderRadius: "var(--radius)" }}
                    >
                      <p className="text-sm text-foreground">
                        <span className="font-medium">Motivo:</span> {vote.reason}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-on-surface-variant">
                      <span className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-green-600" />
                          {vote.votesFor} a favor
                        </span>
                        <span className="flex items-center gap-1">
                          <X className="w-3.5 h-3.5 text-destructive" />
                          {vote.votesAgainst} en contra
                        </span>
                      </span>
                      <span>
                        Cerrada el {new Date(vote.closedAt).toLocaleDateString("es-ES")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <VoteModal
        isOpen={voteModal.isOpen}
        onClose={() => setVoteModal({ ...voteModal, isOpen: false })}
        onConfirm={handleConfirmVote}
        title={voteModal.title}
        actionDescription={voteModal.actionDescription}
      />

      <VoteConfirmModal
        isOpen={voteConfirmModal.isOpen}
        onClose={() => setVoteConfirmModal({ ...voteConfirmModal, isOpen: false })}
        onConfirm={handleConfirmVoteAction}
        voteType={voteConfirmModal.voteType}
        actionDescription={voteConfirmModal.actionDescription}
      />
    </div>
  );
}