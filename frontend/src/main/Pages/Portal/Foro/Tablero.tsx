// ForumBoardView.tsx
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router";
import { ChevronRight, Plus, MessageCircle, Loader2, AlertCircle } from "lucide-react";
import { foroService } from "../../../services/Portal/ForoService";
import type { PostResponse, CrearPostRequest, CrearRespuestaRequest } from "../../../types/Portal/Foro";

// ── Componente de una respuesta individual ────────────────────────────────────

interface ReplyItemProps {
  reply: PostResponse;
}

function ReplyItem({ reply }: ReplyItemProps) {
  return (
    <div className="flex gap-3 py-3 pl-4 relative">
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-border" />

      <div className="flex-shrink-0">
        <div
          className="w-9 h-9 bg-primary/15 flex items-center justify-center text-primary"
          style={{ borderRadius: "var(--radius)" }}
        >
          <span className="text-xs font-medium">
            {reply.autor.nombre.slice(0, 2).toUpperCase()}
          </span>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-medium text-foreground text-sm">{reply.autor.nombre}</span>
          <span className="text-xs text-on-surface-variant">
            {new Date(reply.createdAt).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <p className="text-sm text-foreground leading-relaxed">{reply.contenido}</p>
      </div>
    </div>
  );
}

// ── Componente de un post con su sección de respuestas ────────────────────────

interface PostItemProps {
  post: PostResponse;
  isLast: boolean;
}

function PostItem({ post, isLast }: PostItemProps) {
  const [expandido, setExpandido] = useState(false);
  const [respuestas, setRespuestas] = useState<PostResponse[]>([]);
  const [cargandoRespuestas, setCargandoRespuestas] = useState(false);
  const [errorRespuestas, setErrorRespuestas] = useState<string | null>(null);

  const [showReplyForm, setShowReplyForm] = useState(false);
  const [contenidoRespuesta, setContenidoRespuesta] = useState("");
  const [enviandoRespuesta, setEnviandoRespuesta] = useState(false);
  const [errorRespuesta, setErrorRespuesta] = useState<string | null>(null);

  const handleExpandir = async () => {
    if (expandido) {
      setExpandido(false);
      return;
    }
    setExpandido(true);
    // Solo carga si todavía no las cargó nunca
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

    const request: CrearRespuestaRequest = { contenido: contenidoRespuesta.trim() };

    try {
      setEnviandoRespuesta(true);
      setErrorRespuesta(null);
      const nueva = await foroService.responderPost(post.id, request);
      setRespuestas((prev) => [...prev, nueva]);
      setContenidoRespuesta("");
      setShowReplyForm(false);
      // Si no estaba expandido, lo abrimos para mostrar la nueva respuesta
      setExpandido(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setErrorRespuesta(msg || "No se pudo enviar la respuesta.");
    } finally {
      setEnviandoRespuesta(false);
    }
  };

  // Cantidad local: la del back + las que se agregaron en esta sesión sin recargar
  const cantidadMostrada =
    respuestas.length > 0
      ? respuestas.length
      : post.cantidadRespuestas;

  return (
    <>
      <div className="py-5 px-5">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div
              className="w-11 h-11 bg-primary/15 flex items-center justify-center text-primary"
              style={{ borderRadius: "var(--radius)" }}
            >
              <span className="text-sm font-medium">
                {post.autor.nombre.slice(0, 2).toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-medium text-foreground">{post.autor.nombre}</span>
              <span className="text-sm text-on-surface-variant">
                {new Date(post.createdAt).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {post.titulo && (
              <h3 className="text-foreground mb-2">{post.titulo}</h3>
            )}

            <p className="text-foreground leading-relaxed mb-3">{post.contenido}</p>

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

            {/* Formulario de respuesta */}
            {showReplyForm && (
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
                    onClick={() => {
                      setShowReplyForm(false);
                      setErrorRespuesta(null);
                      setContenidoRespuesta("");
                    }}
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
              respuestas.map((r) => <ReplyItem key={r.id} reply={r} />)}
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
      const msg = err?.response?.data?.message;
      setError(msg || "No se pudo crear la publicación.");
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

  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewPostModal, setShowNewPostModal] = useState(false);

  // boardId es el UUID del tablero
  const tableroId = boardId!;

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        setError(null);
        const data = await foroService.listarPosts(tableroId);
        setPosts(data);
      } catch {
        setError("No se pudieron cargar las publicaciones.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [tableroId]);

  const handlePostCreado = (nuevo: PostResponse) => {
    // El back devuelve posts ordenados por createdAt DESC,
    // así que el nuevo va al principio
    setPosts((prev) => [nuevo, ...prev]);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-on-surface-variant">
        <Link to={`/portal/${portalId}/foro`} className="hover:text-primary transition-colors">
          Foro
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground">Tablero</span>
      </nav>

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="mb-2 text-foreground">Publicaciones</h1>
        </div>
        <button
          onClick={() => setShowNewPostModal(true)}
          className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap ml-4"
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
          {posts.map((post, index) => (
            <PostItem key={post.id} post={post} isLast={index === posts.length - 1} />
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