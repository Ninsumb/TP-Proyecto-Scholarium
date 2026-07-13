// ForumBoardView.tsx
import { useState, useEffect, useRef } from "react";
import { Avatar } from "../../../Components/Avatar";
import { Link, useParams } from "react-router";
import { usePortalContext } from "../../../hooks/usePortalContext";
import {
  ChevronRight,
  Plus,
  MessageCircle,
  Loader2,
  AlertCircle,
  Pencil,
  Trash2,
  Flag,
  ShieldAlert,
  X,
  Check,
  CornerDownRight,
  UserPlus,
  Lock,
  Search,
  Eye,
} from "lucide-react";
import { foroService } from "../../../services/Portal/ForoService";
import { usuarioService } from "../../../services/UsuarioService";
import { authService } from "../../../services/AuthService";
import { adminService } from "../../../services/AdminService";
import { CategoryBadge } from "../../../Components/common/CategoryBadge";
import { Modal } from "../../../Components/common/Modal";
import { ContextMenu } from "../../../Components/common/ContextMenu";
import { Pagination } from "../../../Components/common/Pagination";
import type {
  PostResponse,
  CrearPostRequest,
  TableroResponse,
} from "../../../types/Portal/Foro";

// Genera variantes simples de un token para tolerar typos de 1 carácter
function expandirToken(token: string): string[] {
  const variantes = new Set<string>([token]);
  for (let i = 0; i < token.length; i++) {
    variantes.add(token.slice(0, i) + token.slice(i + 1));
  }
  for (let i = 0; i < token.length - 1; i++) {
    const chars = token.split("");
    [chars[i], chars[i + 1]] = [chars[i + 1], chars[i]];
    variantes.add(chars.join(""));
  }
  return Array.from(variantes).filter((v) => v.length >= 2);
}

// ── Highlight de palabras clave ───────────────────────────────────────────────

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const tokens = query
    .trim()
    .split(/\s+/)
    .filter((t) => t.length >= 2)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (tokens.length === 0) return text;
  const regex = new RegExp(`(${tokens.join("|")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark
        key={i}
        className="bg-yellow-200 dark:bg-yellow-800 text-foreground rounded-sm px-0.5"
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}

// ── Acceso denegado ───────────────────────────────────────────────────────────

function AccesoDenegado({ portalId }: { portalId: string | undefined }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="max-w-md portal-fade-up">
        <div
          className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-6"
          style={{ boxShadow: "var(--portal-shadow-card)" }}
        >
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground mb-3">
          Portal privado
        </h2>
        <p className="text-on-surface-variant mb-8">
          Este portal es privado. Solo sus miembros pueden acceder a esta sección.
          Si querés ver el contenido, enviá una solicitud para unirte.
        </p>
        <Link
          to={`/portal/${portalId}/solicitud`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors portal-hoverable"
          style={{ borderRadius: "var(--radius)", boxShadow: "var(--portal-shadow-card)" }}
        >
          <UserPlus className="w-5 h-5" />
          Enviar Solicitud
        </Link>
      </div>
    </div>
  );
}

// ── Hook: rol del usuario en el portal actual ─────────────────────────────────

function useRolEnPortal(portalId: number): "ADMIN" | "MIEMBRO" | null {
  const [rol, setRol] = useState<"ADMIN" | "MIEMBRO" | null>(null);
  useEffect(() => {
    usuarioService.getMisPortales().then((portales) => {
      const portal = portales.find((p) => p.id === portalId);
      setRol(portal?.rol ?? null);
    });
  }, [portalId]);
  return rol;
}

// ── Menú de tres puntos ───────────────────────────────────────────────────────

interface PostMenuProps {
  esPropio: boolean;
  rolUsuario: "ADMIN" | "MIEMBRO" | null;
  ocultado: boolean;
  onEditar: () => void;
  onEliminar: () => void;
  onOcultar: () => void;
  onDevelar: () => void;
}

function PostMenu({
  esPropio,
  rolUsuario,
  ocultado,
  onEditar,
  onEliminar,
  onOcultar,
  onDevelar,
}: PostMenuProps) {
  const items = esPropio
    ? [
        { label: "Editar", icon: <Pencil className="w-4 h-4 text-primary" />, onClick: onEditar },
        { label: "Eliminar", icon: <Trash2 className="w-4 h-4" />, onClick: onEliminar, danger: true },
      ]
    : rolUsuario === "ADMIN"
      ? !ocultado
        ? [
            {
              label: "Marcar como inapropiado",
              icon: <ShieldAlert className="w-4 h-4" />,
              onClick: onOcultar,
              danger: true,
            },
          ]
        : [
            {
              label: "Develar post",
              icon: <Eye className="w-4 h-4 text-primary" />,
              onClick: onDevelar,
            },
          ]
      : [{ label: "Denunciar", icon: <Flag className="w-4 h-4" />, onClick: () => {} }];

  return <ContextMenu items={items} />;
}

// ── Modal de confirmación de eliminación ──────────────────────────────────────

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  esRespuesta: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

function ConfirmDeleteModal({ isOpen, esRespuesta, onConfirmar, onCancelar }: ConfirmDeleteModalProps) {
  if (!isOpen) return null;
  return (
    <Modal onClose={onCancelar} maxWidth="24rem" className="p-6">
        <h3 className="text-foreground mb-2">
          Eliminar {esRespuesta ? "respuesta" : "publicación"}
        </h3>
        <p className="text-sm text-on-surface-variant mb-6">
          {esRespuesta
            ? "¿Estás seguro de que querés eliminar esta respuesta? Esta acción no se puede deshacer."
            : "¿Estás seguro de que querés eliminar esta publicación? Esta acción no se puede deshacer."}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancelar}
            className="px-4 py-2 border border-border hover:bg-accent transition-colors text-sm"
            style={{ borderRadius: "var(--radius)" }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className="px-4 py-2 bg-destructive text-white hover:bg-destructive/90 transition-colors text-sm flex items-center gap-2 portal-hoverable"
            style={{ borderRadius: "var(--radius)" }}
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </button>
        </div>
    </Modal>
  );
}

// ── Modal de confirmación para ocultar un post ────────────────────────────────

interface OcultarPostModalProps {
  isOpen: boolean;
  onConfirmar: (motivo: string) => void;
  onCancelar: () => void;
}

function OcultarPostModal({ isOpen, onConfirmar, onCancelar }: OcultarPostModalProps) {
  const [motivo, setMotivo] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivo.trim()) return;
    onConfirmar(motivo.trim());
    setMotivo("");
  };

  return (
    <Modal onClose={onCancelar} maxWidth="24rem" className="p-6">
        <h3 className="text-foreground mb-2">Marcar como inapropiado</h3>
        <p className="text-sm text-on-surface-variant mb-4">
          Este contenido quedará oculto para los miembros. Escribí el motivo para
          que quede registrado en el historial de administración.
        </p>
        <form onSubmit={handleSubmit}>
          <textarea
            rows={3}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Motivo..."
            className="w-full px-3 py-2 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none text-sm mb-4"
            style={{ borderRadius: "var(--radius)" }}
            autoFocus
          />
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => { onCancelar(); setMotivo(""); }}
              className="px-4 py-2 border border-border hover:bg-accent transition-colors text-sm"
              style={{ borderRadius: "var(--radius)" }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!motivo.trim()}
              className="px-4 py-2 bg-destructive text-white hover:bg-destructive/90 transition-colors text-sm flex items-center gap-2 disabled:opacity-60 portal-hoverable"
              style={{ borderRadius: "var(--radius)" }}
            >
              <ShieldAlert className="w-4 h-4" />
              Ocultar
            </button>
          </div>
        </form>
    </Modal>
  );
}

// ── Respuesta individual ──────────────────────────────────────────────────────

interface ReplyItemProps {
  reply: PostResponse;
  postRaizId: string;
  autorPadreNombre: string | null;
  usuarioActualId: number | null;
  rolUsuario: "ADMIN" | "MIEMBRO" | null;
  canInteract: boolean;
  searchQuery?: string;
  onEliminada: (id: string) => void;
  onEditada: (updated: PostResponse) => void;
  onNuevaRespuesta: (nueva: PostResponse) => void;
}

function ReplyItem({
  reply,
  postRaizId,
  autorPadreNombre,
  usuarioActualId,
  rolUsuario,
  canInteract,
  onEliminada,
  onEditada,
  onNuevaRespuesta,
  searchQuery,
}: ReplyItemProps) {
  const [editando, setEditando] = useState(false);
  const [contenidoEdit, setContenidoEdit] = useState(reply.contenido ?? "");
  const [guardando, setGuardando] = useState(false);
  const [errorEdit, setErrorEdit] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [ocultarModal, setOcultarModal] = useState(false);

  const [showReplyForm, setShowReplyForm] = useState(false);
  const [contenidoRespuesta, setContenidoRespuesta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorRespuesta, setErrorRespuesta] = useState<string | null>(null);
  const [revelado, setRevelado] = useState(false);

  const esPropio = reply.autor !== null && reply.autor.id === usuarioActualId;
  const fuiEditado =
    !reply.eliminado &&
    new Date(reply.updatedAt).getTime() - new Date(reply.createdAt).getTime() > 1000;
  const esRespuestaDeRespuesta = reply.postPadreId !== postRaizId;

  const handleScrollAlPadre = () => {
    const el = document.getElementById(`reply-${reply.postPadreId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("ring-2", "ring-primary/30");
    setTimeout(() => el.classList.remove("ring-2", "ring-primary/30"), 1200);
  };

  const handleGuardar = async () => {
    if (!contenidoEdit.trim()) return;
    try {
      setGuardando(true);
      setErrorEdit(null);
      const updated = await foroService.editarPost(reply.id, { contenido: contenidoEdit.trim() });
      onEditada(updated);
      setEditando(false);
    } catch (err: any) {
      setErrorEdit(err?.response?.data?.message || "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async () => {
    try {
      await foroService.eliminarPost(reply.id);
      onEliminada(reply.id);
      setConfirmDelete(false);
    } catch {
      setConfirmDelete(false);
    }
  };

  const handleOcultar = async (motivo: string) => {
    try {
      const updated = await foroService.ocultarPost(reply.id, { motivo });
      onEditada(updated);
      setOcultarModal(false);
    } catch {
      setOcultarModal(false);
    }
  };

  const handleDevelar = async () => {
    try {
      const updated = await foroService.develarPost(reply.id);
      onEditada(updated);
    } catch { /* silencioso */ }
  };

  const handleResponder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contenidoRespuesta.trim()) return;
    try {
      setEnviando(true);
      setErrorRespuesta(null);
      const nueva = await foroService.responderPost(reply.id, {
        contenido: contenidoRespuesta.trim(),
      });
      onNuevaRespuesta(nueva);
      setContenidoRespuesta("");
      setShowReplyForm(false);
    } catch (err: any) {
      setErrorRespuesta(err?.response?.data?.message || "No se pudo enviar la respuesta.");
    } finally {
      setEnviando(false);
    }
  };

  // ── Caso: eliminado ───────────────────────────────────────────────────────
  if (reply.eliminado) {
    return (
      <div
        id={`reply-${reply.id}`}
        className="flex gap-3 py-4 pl-4 pr-2 relative transition-all border-b border-border last:border-b-0"
      >
        <p className="text-sm text-on-surface-variant italic">
          Respuesta eliminada por el usuario.
        </p>
      </div>
    );
  }

  // ── Caso: oculto para no-admins ───────────────────────────────────────────
  if (reply.ocultado && rolUsuario !== "ADMIN") {
    return (
      <div
        id={`reply-${reply.id}`}
        className="flex gap-3 py-4 pl-4 pr-2 relative transition-all border-b border-border last:border-b-0"
      >
        <p className="text-sm text-on-surface-variant italic">
          Esta respuesta fue ocultada por un administrador.
        </p>
      </div>
    );
  }

  // ── Caso: oculto, visible para admins con barrera de spoiler ──────────────
  if (reply.ocultado && rolUsuario === "ADMIN" && !revelado) {
    return (
      <div
        id={`reply-${reply.id}`}
        className="py-4 pl-4 pr-2 border-b border-border last:border-b-0"
      >
        <div
          className="flex flex-col items-center justify-center gap-2 py-4 px-4 border border-dashed border-destructive/40 bg-destructive/5 text-center"
          style={{ borderRadius: "var(--radius-md)" }}
        >
          <ShieldAlert className="w-5 h-5 text-destructive/60" />
          <div>
            <p className="text-xs font-medium text-destructive/80">
              Esta respuesta fue ocultada por considerarse inapropiada
            </p>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Solo vos la ves porque sos administrador
            </p>
          </div>
          <button
            onClick={() => setRevelado(true)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs border border-destructive/30 text-destructive/70 hover:bg-destructive/10 transition-colors"
            style={{ borderRadius: "var(--radius-sm)" }}
          >
            <Eye className="w-3 h-3" />
            Ver respuesta
          </button>
        </div>
      </div>
    );
  }

  // ── Caso normal (incluye oculto visible para admins) ─────────────────────
  return (
    <>
      <ConfirmDeleteModal
        isOpen={confirmDelete}
        esRespuesta={true}
        onConfirmar={handleEliminar}
        onCancelar={() => setConfirmDelete(false)}
      />
      <OcultarPostModal
        isOpen={ocultarModal}
        onConfirmar={handleOcultar}
        onCancelar={() => setOcultarModal(false)}
      />

      <div
        id={`reply-${reply.id}`}
        className="flex gap-3 py-4 pl-4 pr-2 relative transition-all rounded-sm border-b border-border last:border-b-0"
      >
        <Avatar nombre={reply.autor!.nombre} fotoPerfil={reply.autor!.fotoPerfil} size="sm" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-foreground text-sm">{reply.autor!.nombre}</span>

              {/* Badge "Oculto" visible solo para admins */}
              {reply.ocultado && rolUsuario === "ADMIN" && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-destructive/10 text-destructive"
                  style={{ borderRadius: "var(--radius)" }}
                >
                  <ShieldAlert className="w-3 h-3" />
                  Oculto
                </span>
              )}

              {esRespuestaDeRespuesta && autorPadreNombre && (
                <button
                  onClick={handleScrollAlPadre}
                  className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary transition-colors group"
                >
                  <CornerDownRight className="w-3 h-3 flex-shrink-0" />
                  <span>respondiendo a </span>
                  <span className="text-primary/70 group-hover:text-primary transition-colors font-medium underline underline-offset-2 decoration-primary/40">
                    {autorPadreNombre}
                  </span>
                </button>
              )}

              <span className="text-xs text-on-surface-variant">
                {new Date(reply.createdAt).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              {fuiEditado && (
                <span className="text-xs text-on-surface-variant italic">(editado)</span>
              )}
            </div>

            <PostMenu
              esPropio={esPropio}
              rolUsuario={rolUsuario}
              ocultado={reply.ocultado}
              onEditar={() => { setContenidoEdit(reply.contenido ?? ""); setEditando(true); }}
              onEliminar={() => setConfirmDelete(true)}
              onOcultar={() => setOcultarModal(true)}
              onDevelar={handleDevelar}
            />
          </div>

          {editando ? (
            <div className="mt-1">
              {errorEdit && (
                <p className="text-xs text-destructive mb-2">{errorEdit}</p>
              )}
              <textarea
                rows={3}
                value={contenidoEdit}
                onChange={(e) => setContenidoEdit(e.target.value)}
                className="w-full px-3 py-2 border border-ring bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none text-sm"
                style={{ borderRadius: "var(--radius)" }}
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => { setEditando(false); setErrorEdit(null); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-border hover:bg-accent transition-colors text-xs"
                  style={{ borderRadius: "var(--radius)" }}
                >
                  <X className="w-3.5 h-3.5" />
                  Cancelar
                </button>
                <button
                  onClick={handleGuardar}
                  disabled={guardando || !contenidoEdit.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors text-xs disabled:opacity-60"
                  style={{ borderRadius: "var(--radius)" }}
                >
                  {guardando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Guardar
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-foreground leading-relaxed">
                {searchQuery && reply.contenido
                  ? highlightText(reply.contenido, searchQuery)
                  : reply.contenido}
              </p>

              {!editando && canInteract && !reply.ocultado && (
                <button
                  onClick={() => setShowReplyForm((v) => !v)}
                  className="mt-1.5 text-xs text-on-surface-variant hover:text-primary transition-colors"
                >
                  Responder
                </button>
              )}

              {showReplyForm && canInteract && (
                <form onSubmit={handleResponder} className="mt-3">
                  {errorRespuesta && (
                    <p className="text-xs text-destructive mb-2">{errorRespuesta}</p>
                  )}
                  <textarea
                    rows={2}
                    value={contenidoRespuesta}
                    onChange={(e) => setContenidoRespuesta(e.target.value)}
                    placeholder={`Respondiendo a ${reply.autor!.nombre}...`}
                    className="w-full px-3 py-2 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none text-sm"
                    style={{ borderRadius: "var(--radius)" }}
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowReplyForm(false);
                        setErrorRespuesta(null);
                        setContenidoRespuesta("");
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-border hover:bg-accent transition-colors text-xs"
                      style={{ borderRadius: "var(--radius)" }}
                    >
                      <X className="w-3.5 h-3.5" />
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={enviando || !contenidoRespuesta.trim()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors text-xs disabled:opacity-60"
                      style={{ borderRadius: "var(--radius)" }}
                    >
                      {enviando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Responder
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ── Post con respuestas ───────────────────────────────────────────────────────

interface PostItemProps {
  post: PostResponse;
  isLast: boolean;
  usuarioActualId: number | null;
  rolUsuario: "ADMIN" | "MIEMBRO" | null;
  canInteract: boolean;
  searchQuery?: string;
  onEliminado: (id: string) => void;
  onEditado: (updated: PostResponse) => void;
}

function PostItem({
  post,
  isLast,
  usuarioActualId,
  rolUsuario,
  canInteract,
  searchQuery,
  onEliminado,
  onEditado,
}: PostItemProps) {
  const [expandido, setExpandido] = useState(false);
  const [respuestas, setRespuestas] = useState<PostResponse[]>([]);
  const [cargandoRespuestas, setCargandoRespuestas] = useState(false);
  const [errorRespuestas, setErrorRespuestas] = useState<string | null>(null);
  const [respuestasPage, setRespuestasPage] = useState(1);
  const REPLIES_PAGE_SIZE = 5;

  const [showReplyForm, setShowReplyForm] = useState(false);
  const [contenidoRespuesta, setContenidoRespuesta] = useState("");
  const [enviandoRespuesta, setEnviandoRespuesta] = useState(false);
  const [errorRespuesta, setErrorRespuesta] = useState<string | null>(null);

  const [editando, setEditando] = useState(false);
  const [tituloEdit, setTituloEdit] = useState(post.titulo ?? "");
  const [contenidoEdit, setContenidoEdit] = useState(post.contenido ?? "");
  const [guardando, setGuardando] = useState(false);
  const [errorEdit, setErrorEdit] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [ocultarModal, setOcultarModal] = useState(false);
  const [revelado, setRevelado] = useState(false);

  const esPropio = post.autor !== null && post.autor.id === usuarioActualId;
  const fuiEditado =
    !post.eliminado &&
    new Date(post.updatedAt).getTime() - new Date(post.createdAt).getTime() > 1000;

  const handleExpandir = async () => {
    if (expandido) { setExpandido(false); return; }
    setExpandido(true);
    if (respuestas.length === 0 && post.cantidadRespuestas > 0) {
      try {
        setCargandoRespuestas(true);
        setErrorRespuestas(null);
        const data = await foroService.listarRespuestas(post.id);
        setRespuestas(data);
      } catch {
        setErrorRespuestas("No se pudieron cargar las respuestas.");
      } finally {
        setCargandoRespuestas(false);
      }
    }
  };

  const handleResponder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contenidoRespuesta.trim()) return;
    try {
      setEnviandoRespuesta(true);
      setErrorRespuesta(null);
      const nueva = await foroService.responderPost(post.id, { contenido: contenidoRespuesta.trim() });
      setRespuestas((prev) => [...prev, nueva]);
      setRespuestasPage(Math.max(1, Math.ceil((respuestas.length + 1) / REPLIES_PAGE_SIZE)));
      setContenidoRespuesta("");
      setShowReplyForm(false);
      setExpandido(true);
    } catch (err: any) {
      setErrorRespuesta(err?.response?.data?.message || "No se pudo enviar la respuesta.");
    } finally {
      setEnviandoRespuesta(false);
    }
  };

  const handleGuardarEdicion = async () => {
    if (!contenidoEdit.trim()) return;
    try {
      setGuardando(true);
      setErrorEdit(null);
      const updated = await foroService.editarPost(post.id, {
        contenido: contenidoEdit.trim(),
        ...(tituloEdit.trim() ? { titulo: tituloEdit.trim() } : {}),
      });
      onEditado(updated);
      setEditando(false);
    } catch (err: any) {
      setErrorEdit(err?.response?.data?.message || "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async () => {
    try {
      await foroService.eliminarPost(post.id);
      onEliminado(post.id);
      setConfirmDelete(false);
    } catch {
      setConfirmDelete(false);
    }
  };

  const handleOcultar = async (motivo: string) => {
    try {
      const updated = await foroService.ocultarPost(post.id, { motivo });
      onEditado(updated);
      setOcultarModal(false);
    } catch {
      setOcultarModal(false);
    }
  };

  const handleDevelar = async () => {
    try {
      const updated = await foroService.develarPost(post.id);
      onEditado(updated);
    } catch { /* silencioso */ }
  };

  const cantidadMostrada =
    respuestas.length > 0 ? respuestas.length : post.cantidadRespuestas;

  // ── Caso: eliminado ───────────────────────────────────────────────────────
  if (post.eliminado) return null;

  /// ── Caso: oculto para no-admins ───────────────────────────────────────────
  if (post.ocultado && rolUsuario !== "ADMIN") {
    return (
      <>
        <div className="py-5 px-5 text-sm text-on-surface-variant italic">
          Este contenido fue ocultado por un administrador.
        </div>
        {!isLast && <div className="border-t border-border" />}
      </>
    );
  }

  // ── Caso: oculto, visible para admins con barrera de spoiler ──────────────
  if (post.ocultado && rolUsuario === "ADMIN" && !revelado) {
    return (
      <>
        <ConfirmDeleteModal
          isOpen={confirmDelete}
          esRespuesta={false}
          onConfirmar={handleEliminar}
          onCancelar={() => setConfirmDelete(false)}
        />
        <OcultarPostModal
          isOpen={ocultarModal}
          onConfirmar={handleOcultar}
          onCancelar={() => setOcultarModal(false)}
        />
        <div className="py-5 px-5">
          <div
            className="flex flex-col items-center justify-center gap-3 py-6 px-4 border border-dashed border-destructive/40 bg-destructive/5 text-center"
            style={{ borderRadius: "var(--radius-md)" }}
          >
            <ShieldAlert className="w-6 h-6 text-destructive/60" />
            <div>
              <p className="text-sm font-medium text-destructive/80">
                Este post fue ocultado por considerarse inapropiado
              </p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Solo vos lo ves porque sos administrador
              </p>
            </div>
            <button
              onClick={() => setRevelado(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs border border-destructive/30 text-destructive/70 hover:bg-destructive/10 transition-colors"
              style={{ borderRadius: "var(--radius-sm)" }}
            >
              <Eye className="w-3.5 h-3.5" />
              Ver post
            </button>
          </div>
        </div>
        {!isLast && <div className="border-t border-border" />}
      </>
    );
  }

  // ── Caso normal (incluye oculto visible para admins) ─────────────────────
  return (
    <>
      <ConfirmDeleteModal
        isOpen={confirmDelete}
        esRespuesta={false}
        onConfirmar={handleEliminar}
        onCancelar={() => setConfirmDelete(false)}
      />
      <OcultarPostModal
        isOpen={ocultarModal}
        onConfirmar={handleOcultar}
        onCancelar={() => setOcultarModal(false)}
      />

      <div className="py-5 px-5">
        <div className="flex gap-4">
          <Avatar nombre={post.autor!.nombre} fotoPerfil={post.autor!.fotoPerfil} size="md" />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-medium text-foreground">{post.autor!.nombre}</span>

                {/* Badge "Oculto" visible solo para admins */}
                {post.ocultado && rolUsuario === "ADMIN" && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-destructive/10 text-destructive"
                    style={{ borderRadius: "var(--radius)" }}
                  >
                    <ShieldAlert className="w-3 h-3" />
                    Oculto
                  </span>
                )}

                <span className="text-sm text-on-surface-variant">
                  {new Date(post.createdAt).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {fuiEditado && (
                  <span className="text-xs text-on-surface-variant italic">(editado)</span>
                )}
              </div>

              <PostMenu
                esPropio={esPropio}
                rolUsuario={rolUsuario}
                ocultado={post.ocultado}
                onEditar={() => {
                  setTituloEdit(post.titulo ?? "");
                  setContenidoEdit(post.contenido ?? "");
                  setEditando(true);
                }}
                onEliminar={() => setConfirmDelete(true)}
                onOcultar={() => setOcultarModal(true)}
                onDevelar={handleDevelar}
              />
            </div>

            {editando ? (
              <div className="mt-1">
                {errorEdit && (
                  <div className="flex items-center gap-2 mb-2 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errorEdit}
                  </div>
                )}
                {post.titulo !== null && (
                  <input
                    type="text"
                    value={tituloEdit}
                    onChange={(e) => setTituloEdit(e.target.value)}
                    placeholder="Título (opcional)"
                    className="w-full px-3 py-2 border border-ring bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring mb-2 text-sm font-medium"
                    style={{ borderRadius: "var(--radius)" }}
                  />
                )}
                <textarea
                  rows={4}
                  value={contenidoEdit}
                  onChange={(e) => setContenidoEdit(e.target.value)}
                  className="w-full px-3 py-2 border border-ring bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none text-sm"
                  style={{ borderRadius: "var(--radius)" }}
                  autoFocus={post.titulo === null}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => { setEditando(false); setErrorEdit(null); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-border hover:bg-accent transition-colors text-sm"
                    style={{ borderRadius: "var(--radius)" }}
                  >
                    <X className="w-3.5 h-3.5" />
                    Cancelar
                  </button>
                  <button
                    onClick={handleGuardarEdicion}
                    disabled={guardando || !contenidoEdit.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors text-sm disabled:opacity-60"
                    style={{ borderRadius: "var(--radius)" }}
                  >
                    {guardando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Guardar
                  </button>
                </div>
              </div>
            ) : (
              <>
                {post.titulo && (
                  <h3 className="text-foreground mb-2">
                    {searchQuery ? highlightText(post.titulo, searchQuery) : post.titulo}
                  </h3>
                )}
                <p className="text-foreground leading-relaxed mb-3">
                  {searchQuery && post.contenido
                    ? highlightText(post.contenido, searchQuery)
                    : post.contenido}
                </p>
              </>
            )}

            {!editando && (
              <div className="flex items-center gap-4">
                <button
                  onClick={handleExpandir}
                  className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>
                    {cantidadMostrada}{" "}
                    {cantidadMostrada === 1 ? "respuesta" : "respuestas"}
                  </span>
                </button>
                {canInteract && !post.ocultado && (
                  <button
                    onClick={() => setShowReplyForm((v) => !v)}
                    className="text-sm text-on-surface-variant hover:text-primary transition-colors"
                  >
                    Responder
                  </button>
                )}
              </div>
            )}

            {showReplyForm && !editando && canInteract && (
              <form onSubmit={handleResponder} className="mt-4 pt-4 border-t border-border">
                {errorRespuesta && (
                  <div className="flex items-center gap-2 mb-3 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errorRespuesta}
                  </div>
                )}
                <textarea
                  rows={3}
                  value={contenidoRespuesta}
                  onChange={(e) => setContenidoRespuesta(e.target.value)}
                  placeholder="Escribí tu respuesta..."
                  className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  style={{ borderRadius: "var(--radius)" }}
                />
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => { setShowReplyForm(false); setErrorRespuesta(null); setContenidoRespuesta(""); }}
                    className="px-4 py-2 border border-border hover:bg-accent transition-colors"
                    style={{ borderRadius: "var(--radius)" }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={enviandoRespuesta || !contenidoRespuesta.trim()}
                    className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors flex items-center gap-2 disabled:opacity-60"
                    style={{ borderRadius: "var(--radius)" }}
                  >
                    {enviandoRespuesta && <Loader2 className="w-4 h-4 animate-spin" />}
                    Responder
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Respuestas expandidas */}
        {expandido && (
          <div className="mt-3 ml-11">
            {cargandoRespuestas && (
              <div className="flex items-center gap-2 py-3 text-sm text-on-surface-variant">
                <Loader2 className="w-4 h-4 animate-spin" />
                Cargando respuestas...
              </div>
            )}
            {errorRespuestas && (
              <div className="flex items-center gap-2 py-3 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                {errorRespuestas}
              </div>
            )}
            {!cargandoRespuestas &&
              respuestas
                .slice((respuestasPage - 1) * REPLIES_PAGE_SIZE, respuestasPage * REPLIES_PAGE_SIZE)
                .map((r) => {
                const autorPadreNombre =
                  r.postPadreId !== post.id
                    ? (respuestas.find((x) => x.id === r.postPadreId)?.autor?.nombre ?? null)
                    : null;
                return (
                  <ReplyItem
                    key={r.id}
                    reply={r}
                    postRaizId={post.id}
                    autorPadreNombre={autorPadreNombre}
                    usuarioActualId={usuarioActualId}
                    rolUsuario={rolUsuario}
                    canInteract={canInteract}
                    searchQuery={searchQuery}
                    onEliminada={(id) =>
                      setRespuestas((prev) =>
                        prev.map((x) =>
                          x.id === id
                            ? { ...x, eliminado: true, contenido: null, autor: null }
                            : x
                        )
                      )
                    }
                    onEditada={(updated) =>
                      setRespuestas((prev) =>
                        prev.map((x) => (x.id === updated.id ? updated : x))
                      )
                    }
                    onNuevaRespuesta={(nueva) => {
                      setRespuestas((prev) => [...prev, nueva]);
                      setRespuestasPage(Math.max(1, Math.ceil((respuestas.length + 1) / REPLIES_PAGE_SIZE)));
                      setExpandido(true);
                    }}
                  />
                );
              })}
            {!cargandoRespuestas &&
              respuestas.length === 0 &&
              post.cantidadRespuestas === 0 && (
                <p className="text-sm text-on-surface-variant py-3">
                  Todavía no hay respuestas. ¡Sé el primero!
                </p>
              )}
            {!cargandoRespuestas && respuestas.length > REPLIES_PAGE_SIZE && (
              <Pagination
                variant="compact"
                page={respuestasPage}
                totalPages={Math.max(1, Math.ceil(respuestas.length / REPLIES_PAGE_SIZE))}
                onPageChange={setRespuestasPage}
                totalItems={respuestas.length}
                pageSize={REPLIES_PAGE_SIZE}
              />
            )}
          </div>
        )}
      </div>

      {!isLast && <div className="border-t border-border" />}
    </>
  );
}

// ── Modal Nueva Publicación ───────────────────────────────────────────────────

interface NewPostModalProps {
  isOpen: boolean;
  tableroId: string;
  onClose: () => void;
  onCreado: (post: PostResponse) => void;
}

function NewPostModal({ isOpen, tableroId, onClose, onCreado }: NewPostModalProps) {
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contenido.trim()) return setError("El contenido es obligatorio.");
    const request: CrearPostRequest = {
      titulo: titulo.trim() || null,
      contenido: contenido.trim(),
    };
    try {
      setCargando(true);
      setError(null);
      const nuevo = await foroService.crearPost(tableroId, request);
      onCreado(nuevo);
      setTitulo("");
      setContenido("");
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "No se pudo crear la publicación.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal onClose={onClose} maxWidth="42rem">
        <div className="border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-card-foreground">Nueva Publicación</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent transition-colors"
            style={{ borderRadius: "var(--radius-sm)" }}
          >
            <Plus className="w-5 h-5 rotate-45 text-muted-foreground" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div
              className="flex items-center gap-2 px-4 py-3 bg-destructive/10 text-destructive text-sm"
              style={{ borderRadius: "var(--radius)" }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
          <div>
            <label className="block mb-2 text-card-foreground">Título (opcional)</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título de la publicación..."
              className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              style={{ borderRadius: "var(--radius)" }}
            />
          </div>
          <div>
            <label className="block mb-2 text-card-foreground">Contenido</label>
            <textarea
              rows={6}
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              placeholder="Describí tu duda, compartí información o iniciá una discusión..."
              className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-all"
              style={{ borderRadius: "var(--radius)" }}
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-border hover:bg-accent transition-colors"
              style={{ borderRadius: "var(--radius)" }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando || !contenido.trim()}
              className="px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors flex items-center gap-2 disabled:opacity-60 portal-hoverable"
              style={{ borderRadius: "var(--radius)", boxShadow: "var(--portal-shadow-card)" }}
            >
              {cargando && <Loader2 className="w-4 h-4 animate-spin" />}
              Publicar
            </button>
          </div>
        </form>
    </Modal>
  );
}

// ── Menú de administración del tablero ───────────────────────────────────────

interface TableroAdminMenuProps {
  portalId: string;
  tableroId: string;
  nombre: string;
  descripcion: string | null;
  onActualizado: (t: TableroResponse) => void;
}

function TableroAdminMenu({
  portalId,
  tableroId,
  nombre,
  descripcion,
  onActualizado,
}: TableroAdminMenuProps) {
  // Modal de votación para eliminar
  const [voteModal, setVoteModal] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorVote, setErrorVote] = useState<string | null>(null);
  const [successVote, setSuccessVote] = useState(false);

  // Modal de edición
  const [editando, setEditando] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState(nombre);
  const [nuevaDescripcion, setNuevaDescripcion] = useState(descripcion ?? "");
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [errorEdicion, setErrorEdicion] = useState<string | null>(null);

  const handleGuardarEdicion = async () => {
    if (!nuevoNombre.trim()) return;
    try {
      setGuardandoEdicion(true);
      setErrorEdicion(null);
      const actualizado = await foroService.editarTablero(
        Number(portalId),
        tableroId,
        { nombre: nuevoNombre.trim(), descripcion: nuevaDescripcion.trim() || null },
      );
      onActualizado(actualizado);
      setEditando(false);
    } catch (err: any) {
      setErrorEdicion(err?.response?.data?.message || "No se pudo guardar.");
    } finally {
      setGuardandoEdicion(false);
    }
  };

  const handleProponerEliminacion = async () => {
    if (!motivo.trim()) return;
    try {
      setEnviando(true);
      setErrorVote(null);
      await adminService.crearVotacion(Number(portalId), {
        tipo: "ELIMINAR_TABLERO",
        motivo: motivo.trim(),
        entidadId: tableroId,
      });
      setSuccessVote(true);
      setMotivo("");
    } catch (err: any) {
      setErrorVote(err?.response?.data?.message ?? "No se pudo abrir la votación.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      {/* Modal de edición */}
      {editando && (
        <Modal onClose={() => { setEditando(false); setErrorEdicion(null); }} maxWidth="32rem">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-card-foreground">Editar tablero</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-foreground">Nombre</label>
                <input
                  type="text"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  style={{ borderRadius: "var(--radius)" }}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-foreground">
                  Descripción (opcional)
                </label>
                <textarea
                  rows={3}
                  value={nuevaDescripcion}
                  onChange={(e) => setNuevaDescripcion(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  style={{ borderRadius: "var(--radius)" }}
                />
              </div>
              {errorEdicion && (
                <p className="text-sm text-destructive">{errorEdicion}</p>
              )}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => { setEditando(false); setErrorEdicion(null); }}
                  disabled={guardandoEdicion}
                  className="px-5 py-2.5 border border-border hover:bg-accent transition-colors disabled:opacity-50"
                  style={{ borderRadius: "var(--radius)" }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarEdicion}
                  disabled={guardandoEdicion || !nuevoNombre.trim()}
                  className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors disabled:opacity-50 flex items-center gap-2 portal-hoverable"
                  style={{ borderRadius: "var(--radius)", boxShadow: "var(--portal-shadow-card)" }}
                >
                  {guardandoEdicion && <Loader2 className="w-4 h-4 animate-spin" />}
                  Guardar
                </button>
              </div>
            </div>
        </Modal>
      )}

      {/* Modal de votación para eliminar */}
      {voteModal && (
        <Modal onClose={() => { setVoteModal(false); setMotivo(""); setErrorVote(null); }} maxWidth="32rem">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-card-foreground">Proponer Eliminación de Tablero</h2>
            </div>
            <div className="p-6 space-y-4">
              {successVote ? (
                <>
                  <div
                    className="p-4 text-sm"
                    style={{
                      borderRadius: "var(--radius)",
                      background: "var(--portal-teal-soft)",
                      border: "1px solid var(--portal-teal-border)",
                      color: "var(--portal-teal-dim)",
                    }}
                  >
                    Votación abierta correctamente. Los administradores serán notificados.
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => { setVoteModal(false); setSuccessVote(false); }}
                      className="px-5 py-2.5 border border-border hover:bg-accent transition-colors"
                      style={{ borderRadius: "var(--radius)" }}
                    >
                      Cerrar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div
                    className="p-4 bg-primary/5 border border-primary/20 text-sm text-foreground"
                    style={{ borderRadius: "var(--radius)" }}
                  >
                    Estás proponiendo eliminar el tablero{" "}
                    <span className="font-medium">"{nombre}"</span>. Esta acción requiere
                    votación de todos los administradores. Si se aprueba, el tablero
                    quedará inactivo.
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-foreground">
                      Motivo de la propuesta <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      disabled={enviando}
                      className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none disabled:opacity-50"
                      style={{ borderRadius: "var(--radius)" }}
                      placeholder="Explica por qué propones eliminar este tablero. Todos los administradores verán este mensaje."
                    />
                  </div>
                  {errorVote && (
                    <p className="text-sm text-destructive">{errorVote}</p>
                  )}
                  <div className="flex gap-3 justify-end pt-2">
                    <button
                      onClick={() => { setVoteModal(false); setMotivo(""); setErrorVote(null); }}
                      disabled={enviando}
                      className="px-5 py-2.5 border border-border hover:bg-accent transition-colors disabled:opacity-50"
                      style={{ borderRadius: "var(--radius)" }}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleProponerEliminacion}
                      disabled={!motivo.trim() || enviando}
                      className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 portal-hoverable"
                      style={{ borderRadius: "var(--radius)", boxShadow: "var(--portal-shadow-card)" }}
                    >
                      {enviando && <Loader2 className="w-4 h-4 animate-spin" />}
                      Abrir Votación
                    </button>
                  </div>
                </>
              )}
            </div>
        </Modal>
      )}

      {/* Botón de tres puntos */}
      <ContextMenu
        items={[
          {
            label: "Editar tablero",
            icon: <Pencil className="w-4 h-4 text-primary" />,
            onClick: () => {
              setNuevoNombre(nombre);
              setNuevaDescripcion(descripcion ?? "");
              setErrorEdicion(null);
              setEditando(true);
            },
          },
          {
            label: "Proponer eliminación",
            icon: <Trash2 className="w-4 h-4" />,
            onClick: () => setVoteModal(true),
            danger: true,
          },
        ]}
      />
    </>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function ForumBoardView() {
  const { portalId, boardId } = useParams();
  const portalIdNum = Number(portalId);
  const tableroId = boardId!;

  const usuarioActualId = authService.getUserId();
  const rolUsuario = useRolEnPortal(portalIdNum);
  const { isMember, isAdmin, isOpen } = usePortalContext();
  const canInteract = isMember || isAdmin;

  const [tablero, setTablero] = useState<TableroResponse | null>(null);
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewPostModal, setShowNewPostModal] = useState(false);

  // ── Búsqueda ──────────────────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PostResponse[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [postsPage, setPostsPage] = useState(1);
  const POSTS_PAGE_SIZE = 6;

  useEffect(() => {
    setPostsPage(1);
  }, [searchQuery, tableroId]);

  const isSearchActive = searchQuery.trim().length > 0;

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = searchInput.trim();
    if (!trimmed) {
      setSearchQuery("");
      setSearchResults([]);
      setErrorBusqueda(null);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        setBuscando(true);
        setErrorBusqueda(null);
        const tokensOriginales = trimmed.toLowerCase().split(/\s+/).filter(Boolean);
        const tokensExpandidos = tokensOriginales.flatMap(expandirToken);
        const queryExpandida = [...new Set(tokensExpandidos)].join(" ");
        const results = await foroService.buscarPosts(tableroId, queryExpandida);
        setSearchResults(results);
        setSearchQuery(trimmed);
      } catch {
        setErrorBusqueda("No se pudo realizar la búsqueda.");
      } finally {
        setBuscando(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput, tableroId]);

  // ── Carga inicial ─────────────────────────────────────────────────────────
  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        setError(null);
        const [tableros, postsData] = await Promise.all([
          foroService.listarTableros(portalIdNum),
          foroService.listarPosts(tableroId),
        ]);
        const tableroActual = tableros.find((t) => t.id === tableroId) ?? null;
        setTablero(tableroActual);
        setPosts(postsData);
      } catch {
        setError("No se pudieron cargar las publicaciones.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [tableroId, portalIdNum]);

  const handlePostCreado = (nuevo: PostResponse) => {
    setPosts((prev) => [nuevo, ...prev]);
  };

  const handlePostEliminado = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setSearchResults((prev) => prev.filter((p) => p.id !== id));
  };

  const handlePostEditado = (updated: PostResponse) => {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setSearchResults((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  if (!isMember && !isAdmin && !isOpen) {
    return <AccesoDenegado portalId={portalId} />;
  }

  const postsAMostrar = (isSearchActive ? searchResults : posts).filter((p) => !p.eliminado);
  const postsTotalPages = Math.max(1, Math.ceil(postsAMostrar.length / POSTS_PAGE_SIZE));
  const pagedPosts = postsAMostrar.slice(
    (postsPage - 1) * POSTS_PAGE_SIZE,
    postsPage * POSTS_PAGE_SIZE,
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 portal-fade-up">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-on-surface-variant">
        <Link to={`/portal/${portalId}/foro`} className="hover:text-primary transition-colors">
          Foro
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground">{tablero?.nombre ?? "Tablero"}</span>
      </nav>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className="hidden sm:flex w-11 h-11 flex-shrink-0 items-center justify-center bg-primary/10 text-primary"
            style={{ borderRadius: "var(--radius-md)" }}
          >
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            {tablero ? (
              <>
                <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                  <h1 className="text-foreground">{tablero.nombre}</h1>
                  <CategoryBadge label={tablero.etiqueta.nombre} />
                </div>
                {tablero.descripcion && (
                  <p className="text-on-surface-variant text-sm max-w-2xl">
                    {tablero.descripcion}
                  </p>
                )}
              </>
            ) : (
              <h1 className="text-foreground">Publicaciones</h1>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isAdmin && tablero && (
            <TableroAdminMenu
              portalId={portalId!}
              tableroId={tableroId}
              nombre={tablero.nombre}
              descripcion={tablero.descripcion ?? null}
              onActualizado={(t) => setTablero(t)}
            />
          )}
          {canInteract && (
            <button
              onClick={() => setShowNewPostModal(true)}
              className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors flex items-center gap-2 whitespace-nowrap portal-hoverable"
              style={{ borderRadius: "var(--radius)", boxShadow: "var(--portal-shadow-card)" }}
            >
              <Plus className="w-5 h-5" />
              Nueva Publicación
            </button>
          )}
        </div>
      </div>

      {/* Barra de búsqueda */}
      {!cargando && !error && (
        <div className="mb-6 relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar en este tablero..."
              className="w-full pl-10 pr-10 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all text-sm"
              style={{ borderRadius: "var(--radius)", boxShadow: "var(--portal-shadow-card)" }}
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setSearchQuery("");
                  setSearchResults([]);
                  setErrorBusqueda(null);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-on-surface-variant hover:text-foreground transition-colors"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {buscando && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 animate-spin text-on-surface-variant" />
            </div>
          )}
        </div>
      )}

      {/* Feedback resultados de búsqueda */}
      {isSearchActive && !buscando && !errorBusqueda && (
        <p className="text-sm text-on-surface-variant mb-4">
          {searchResults.length === 0
            ? `Sin resultados para "${searchQuery}"`
            : `${searchResults.length} ${searchResults.length === 1 ? "resultado" : "resultados"} para "${searchQuery}"`}
        </p>
      )}

      {errorBusqueda && (
        <div className="flex items-center gap-2 mb-4 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {errorBusqueda}
        </div>
      )}

      {/* Estados de carga inicial */}
      {cargando && (
        <div className="flex items-center justify-center py-20 gap-3 text-on-surface-variant">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Cargando publicaciones...</span>
        </div>
      )}

      {error && !cargando && (
        <div className="text-center py-16">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4 opacity-50" />
          <p className="text-destructive">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 border border-border hover:bg-accent transition-colors text-sm portal-hoverable"
            style={{ borderRadius: "var(--radius)" }}
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Empty state */}
      {!cargando && !error && !isSearchActive && posts.length === 0 && (
        <div className="text-center py-16">
          <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
          <p className="text-on-surface-variant">
            Todavía no hay publicaciones en este tablero.
          </p>
        </div>
      )}

      {/* Lista de posts */}
      {!cargando && !error && postsAMostrar.length > 0 && (
        <>
          <div
            className="bg-card border border-border"
            style={{ borderRadius: "var(--radius-lg)", boxShadow: "var(--portal-shadow-card)" }}
          >
            {pagedPosts.map((post, index, arr) => (
              <PostItem
                key={post.id}
                post={post}
                isLast={index === arr.length - 1}
                usuarioActualId={usuarioActualId}
                rolUsuario={rolUsuario}
                canInteract={canInteract}
                searchQuery={isSearchActive ? searchQuery : ""}
                onEliminado={handlePostEliminado}
                onEditado={handlePostEditado}
              />
            ))}
          </div>
          <div className="mt-4">
            <Pagination page={postsPage} totalPages={postsTotalPages} onPageChange={setPostsPage} />
          </div>
        </>
      )}

      <NewPostModal
        isOpen={showNewPostModal}
        tableroId={tableroId}
        onClose={() => setShowNewPostModal(false)}
        onCreado={handlePostCreado}
      />
    </div>
  );
}