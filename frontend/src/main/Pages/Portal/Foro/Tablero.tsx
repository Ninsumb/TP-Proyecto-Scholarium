// ForumBoardView.tsx
import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router";
import {
  ChevronRight,
  Plus,
  MessageCircle,
  Loader2,
  AlertCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
  Flag,
  ShieldAlert,
  X,
  Check,
  CornerDownRight,
} from "lucide-react";
import { foroService } from "../../../services/Portal/ForoService";
import { usuarioService } from "../../../services/UsuarioService";
import { authService } from "../../../services/AuthService";
import type {
  PostResponse,
  CrearPostRequest,
  TableroResponse,
} from "../../../types/Portal/Foro";

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
  onEditar: () => void;
  onEliminar: () => void;
}

function PostMenu({ esPropio, rolUsuario, onEditar, onEliminar }: PostMenuProps) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setAbierto((v) => !v)}
        className="p-1.5 rounded hover:bg-accent transition-colors text-on-surface-variant hover:text-foreground"
        aria-label="Opciones"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {abierto && (
        <div
          className="absolute right-0 top-full mt-1 z-50 bg-card border border-border shadow-lg min-w-[180px] py-1"
          style={{ borderRadius: "var(--radius)" }}
        >
          {esPropio ? (
            <>
              <button
                onClick={() => { setAbierto(false); onEditar(); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors text-left"
              >
                <Pencil className="w-4 h-4 text-primary" />
                Editar
              </button>
              <button
                onClick={() => { setAbierto(false); onEliminar(); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            </>
          ) : rolUsuario === "ADMIN" ? (
            <button
              onClick={() => setAbierto(false)}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
            >
              <ShieldAlert className="w-4 h-4" />
              Marcar como inapropiado
            </button>
          ) : (
            <button
              onClick={() => setAbierto(false)}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-accent transition-colors text-left"
            >
              <Flag className="w-4 h-4" />
              Denunciar
            </button>
          )}
        </div>
      )}
    </div>
  );
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-card max-w-sm w-full shadow-2xl p-6"
        style={{ borderRadius: "var(--radius)" }}
      >
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
            className="px-4 py-2 bg-destructive text-white hover:bg-destructive/90 transition-colors text-sm flex items-center gap-2"
            style={{ borderRadius: "var(--radius)" }}
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Respuesta individual ──────────────────────────────────────────────────────

interface ReplyItemProps {
  reply: PostResponse;
  postRaizId: string;
  autorPadreNombre: string | null;
  usuarioActualId: number | null;
  rolUsuario: "ADMIN" | "MIEMBRO" | null;
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
  onEliminada,
  onEditada,
  onNuevaRespuesta,
}: ReplyItemProps) {
  const [editando, setEditando] = useState(false);
  const [contenidoEdit, setContenidoEdit] = useState(reply.contenido ?? "");
  const [guardando, setGuardando] = useState(false);
  const [errorEdit, setErrorEdit] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [showReplyForm, setShowReplyForm] = useState(false);
  const [contenidoRespuesta, setContenidoRespuesta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorRespuesta, setErrorRespuesta] = useState<string | null>(null);

  const esPropio = reply.autor !== null && reply.autor.id === usuarioActualId;
  const fuiEditado =
    !reply.eliminado &&
    new Date(reply.updatedAt).getTime() - new Date(reply.createdAt).getTime() > 1000;

  // Es respuesta de respuesta si su padre no es el post raíz
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

  const handleResponder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contenidoRespuesta.trim()) return;
    try {
      setEnviando(true);
      setErrorRespuesta(null);
      // Apuntamos al ID de esta respuesta directamente — el back ya soporta profundidad libre
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

  if (reply.eliminado) {
    return (
      <div id={`reply-${reply.id}`} className="flex gap-3 py-4 pl-4 pr-2 relative transition-all border-b border-border last:border-b-0">
        
        <p className="text-sm text-on-surface-variant italic">Respuesta eliminada por el usuario.</p>
      </div>
    );
  }

  return (
    <>
      <ConfirmDeleteModal
        isOpen={confirmDelete}
        esRespuesta={true}
        onConfirmar={handleEliminar}
        onCancelar={() => setConfirmDelete(false)}
      />

      <div id={`reply-${reply.id}`} className="flex gap-3 py-4 pl-4 pr-2 relative transition-all rounded-sm border-b border-border last:border-b-0">

        <div className="flex-shrink-0">
          <div
            className="w-9 h-9 bg-primary/15 flex items-center justify-center text-primary"
            style={{ borderRadius: "var(--radius)" }}
          >
            <span className="text-xs font-medium">
              {reply.autor!.nombre.slice(0, 2).toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-foreground text-sm">{reply.autor!.nombre}</span>

              {/* "Respondiendo a" — solo aparece si es respuesta de respuesta */}
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
              onEditar={() => { setContenidoEdit(reply.contenido ?? ""); setEditando(true); }}
              onEliminar={() => setConfirmDelete(true)}
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
              <p className="text-sm text-foreground leading-relaxed">{reply.contenido}</p>

              {/* Botón Responder */}
              {!editando && (
                <button
                  onClick={() => setShowReplyForm((v) => !v)}
                  className="mt-1.5 text-xs text-on-surface-variant hover:text-primary transition-colors"
                >
                  Responder
                </button>
              )}

              {/* Formulario de respuesta a esta respuesta */}
              {showReplyForm && (
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
  onEliminado: (id: string) => void;
  onEditado: (updated: PostResponse) => void;
}

function PostItem({ post, isLast, usuarioActualId, rolUsuario, onEliminado, onEditado }: PostItemProps) {
  const [expandido, setExpandido] = useState(false);
  const [respuestas, setRespuestas] = useState<PostResponse[]>([]);
  const [cargandoRespuestas, setCargandoRespuestas] = useState(false);
  const [errorRespuestas, setErrorRespuestas] = useState<string | null>(null);

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

  const cantidadMostrada = respuestas.length > 0 ? respuestas.length : post.cantidadRespuestas;

  if (post.eliminado) return null;

  return (
    <>
      <ConfirmDeleteModal
        isOpen={confirmDelete}
        esRespuesta={false}
        onConfirmar={handleEliminar}
        onCancelar={() => setConfirmDelete(false)}
      />

      <div className="py-5 px-5">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div
              className="w-11 h-11 bg-primary/15 flex items-center justify-center text-primary"
              style={{ borderRadius: "var(--radius)" }}
            >
              <span className="text-sm font-medium">
                {post.autor!.nombre.slice(0, 2).toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-medium text-foreground">{post.autor!.nombre}</span>
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
                onEditar={() => {
                  setTituloEdit(post.titulo ?? "");
                  setContenidoEdit(post.contenido ?? "");
                  setEditando(true);
                }}
                onEliminar={() => setConfirmDelete(true)}
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
                  <h3 className="text-foreground mb-2">{post.titulo}</h3>
                )}
                <p className="text-foreground leading-relaxed mb-3">{post.contenido}</p>
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
                <button
                  onClick={() => setShowReplyForm((v) => !v)}
                  className="text-sm text-on-surface-variant hover:text-primary transition-colors"
                >
                  Responder
                </button>
              </div>
            )}

            {showReplyForm && !editando && (
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
              respuestas.map((r) => {
                // Nombre del autor padre: solo relevante si es respuesta de respuesta
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
                    onEliminada={(id) =>
                      setRespuestas((prev) =>
                        prev.map((x) =>
                          x.id === id ? { ...x, eliminado: true, contenido: null, autor: null } : x
                        )
                      )
                    }
                    onEditada={(updated) =>
                      setRespuestas((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
                    }
                    onNuevaRespuesta={(nueva) => {
                      setRespuestas((prev) => [...prev, nueva]);
                      setExpandido(true);
                    }}
                  />
                );
              })}
            {!cargandoRespuestas && respuestas.length === 0 && post.cantidadRespuestas === 0 && (
              <p className="text-sm text-on-surface-variant py-3">
                Todavía no hay respuestas. ¡Sé el primero!
              </p>
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card max-w-2xl w-full shadow-2xl" style={{ borderRadius: "var(--radius)" }}>
        <div className="border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-card-foreground">Nueva Publicación</h2>
          <button onClick={onClose} className="p-2 hover:bg-accent transition-colors" style={{ borderRadius: "var(--radius)" }}>
            <Plus className="w-5 h-5 rotate-45 text-muted-foreground" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-destructive/10 text-destructive text-sm" style={{ borderRadius: "var(--radius)" }}>
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
            <button type="button" onClick={onClose} className="px-6 py-2.5 border border-border hover:bg-accent transition-colors" style={{ borderRadius: "var(--radius)" }}>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando || !contenido.trim()}
              className="px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors shadow-sm flex items-center gap-2 disabled:opacity-60"
              style={{ borderRadius: "var(--radius)" }}
            >
              {cargando && <Loader2 className="w-4 h-4 animate-spin" />}
              Publicar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function ForumBoardView() {
  const { portalId, boardId } = useParams();
  const portalIdNum = Number(portalId);
  const tableroId = boardId!;

  const usuarioActualId = authService.getUserId();
  const rolUsuario = useRolEnPortal(portalIdNum);

  const [tablero, setTablero] = useState<TableroResponse | null>(null);
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewPostModal, setShowNewPostModal] = useState(false);

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
  };

  const handlePostEditado = (updated: PostResponse) => {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-on-surface-variant">
        <Link to={`/portal/${portalId}/foro`} className="hover:text-primary transition-colors">
          Foro
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground">{tablero?.nombre ?? "Tablero"}</span>
      </nav>

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          {tablero ? (
            <>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-foreground">{tablero.nombre}</h1>
                <span
                  className="px-2.5 py-1 bg-accent text-accent-foreground text-xs"
                  style={{ borderRadius: "var(--radius)" }}
                >
                  {tablero.etiqueta.nombre}
                </span>
              </div>
              {tablero.descripcion && (
                <p className="text-on-surface-variant text-sm max-w-2xl">{tablero.descripcion}</p>
              )}
            </>
          ) : (
            <h1 className="text-foreground">Publicaciones</h1>
          )}
        </div>
        <button
          onClick={() => setShowNewPostModal(true)}
          className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap flex-shrink-0"
          style={{ borderRadius: "var(--radius)" }}
        >
          <Plus className="w-5 h-5" />
          Nueva Publicación
        </button>
      </div>

      {/* Estados */}
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
            className="mt-4 px-4 py-2 border border-border hover:bg-accent transition-colors text-sm"
            style={{ borderRadius: "var(--radius)" }}
          >
            Reintentar
          </button>
        </div>
      )}

      {!cargando && !error && posts.length === 0 && (
        <div className="text-center py-16">
          <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
          <p className="text-on-surface-variant">Todavía no hay publicaciones en este tablero.</p>
        </div>
      )}

      {!cargando && !error && posts.length > 0 && (
        <div className="bg-surface-container-lowest shadow-sm" style={{ borderRadius: "var(--radius)" }}>
          {posts
            .filter((p) => !p.eliminado)
            .map((post, index, arr) => (
              <PostItem
                key={post.id}
                post={post}
                isLast={index === arr.length - 1}
                usuarioActualId={usuarioActualId}
                rolUsuario={rolUsuario}
                onEliminado={handlePostEliminado}
                onEditado={handlePostEditado}
              />
            ))}
        </div>
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