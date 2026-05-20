import { useState } from "react";
import { Link, useParams } from "react-router";
import { ChevronRight, Plus, Heart, MessageCircle, CornerDownRight } from "lucide-react";

// Mock data para un tablero específico
const mockBoardData = {
  1: {
    title: "Info. y consultas de la carrera",
    category: "General",
    description: "Espacio para consultas generales sobre la carrera, requisitos, trámites y orientación académica.",
  },
  2: {
    title: "Dudas sobre el parcial de Programación I",
    category: "Programación I",
    description: "Resolvemos dudas sobre los temas del parcial: punteros, estructuras de control y funciones.",
  },
};

// Mock data para publicaciones con respuestas anidadas
const mockPosts = [
  {
    id: 1,
    author: "María González",
    authorAvatar: "MG",
    date: "2026-05-08",
    title: "¿Cómo es el proceso de inscripción para nuevas materias?",
    content: "Hola a todos, soy nueva en la carrera y no entiendo bien el sistema de inscripción. ¿Alguien me puede explicar los pasos?",
    likes: 12,
    replies: [
      {
        id: 101,
        author: "Carlos Méndez",
        authorAvatar: "CM",
        date: "2026-05-08",
        content: "¡Hola María! El proceso es sencillo. Primero tenés que entrar al sistema de inscripciones (SIU Guaraní) con tu usuario y contraseña.",
        likes: 5,
        parentId: 1,
        replies: [
          {
            id: 102,
            author: "María González",
            authorAvatar: "MG",
            date: "2026-05-08",
            content: "Gracias Carlos! Ya pude entrar al sistema. ¿Y después cómo elijo las materias?",
            likes: 2,
            parentId: 101,
            replies: [
              {
                id: 104,
                author: "Carlos Méndez",
                authorAvatar: "CM",
                date: "2026-05-08",
                content: "Una vez adentro, vas a 'Inscripción a Cursadas', seleccionás el cuatrimestre y te van a aparecer todas las materias disponibles según tu plan de estudios.",
                likes: 4,
                parentId: 102,
                replies: [],
              },
            ],
          },
        ],
      },
      {
        id: 103,
        author: "Ana Rodríguez",
        authorAvatar: "AR",
        date: "2026-05-09",
        content: "También te recomiendo que revises los requisitos de correlatividades antes de inscribirte. Algunos errores comunes son intentar inscribirse a materias sin tener aprobadas las correlativas.",
        likes: 8,
        parentId: 1,
        replies: [],
      },
    ],
  },
  {
    id: 2,
    author: "Juan Pérez",
    authorAvatar: "JP",
    date: "2026-05-07",
    title: null,
    content: "¿Alguien tiene el cronograma de finales actualizado? No lo encuentro en la página de la facultad.",
    likes: 6,
    replies: [
      {
        id: 201,
        author: "Prof. García",
        authorAvatar: "PG",
        date: "2026-05-07",
        content: "Juan, el cronograma se publicó ayer en el tablón de anuncios. También lo acaban de subir a la sección de 'Documentos' del portal.",
        likes: 4,
        parentId: 2,
        replies: [],
      },
    ],
  },
  {
    id: 3,
    author: "Laura Martínez",
    authorAvatar: "LM",
    date: "2026-05-06",
    title: "Información sobre las becas del próximo cuatrimestre",
    content: "Se abrió la convocatoria para becas de estudio. Los requisitos son: promedio mayor a 7, no tener materias adeudadas y completar el formulario antes del 31/05. ¡No se olviden!",
    likes: 24,
    replies: [],
  },
];

interface Reply {
  id: number;
  author: string;
  authorAvatar: string;
  date: string;
  content: string;
  likes: number;
  parentId: number;
  replies: Reply[];
}

interface Post {
  id: number;
  author: string;
  authorAvatar: string;
  date: string;
  title: string | null;
  content: string;
  likes: number;
  replies: Reply[];
}

// Función para aplanar todas las respuestas en un solo nivel
function flattenReplies(replies: Reply[], allReplies: Reply[] = []): Reply[] {
  replies.forEach((reply) => {
    allReplies.push(reply);
    if (reply.replies && reply.replies.length > 0) {
      flattenReplies(reply.replies, allReplies);
    }
  });
  return allReplies;
}

interface ReplyItemProps {
  reply: Reply;
  postId: number;
  allRepliesFlat: Reply[];
}

function ReplyItem({ reply, postId, allRepliesFlat }: ReplyItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);

  // Encontrar el nombre del padre al que está respondiendo
  const parentReply = allRepliesFlat.find(r => r.id === reply.parentId);
  const isReplyingToPost = reply.parentId === postId;

  return (
    <div className="flex gap-3 py-3 pl-4 relative">
      {/* Línea vertical de conexión (estilo Reddit) - conecta con el avatar */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-border"></div>

      {/* Avatar */}
      <div className="flex-shrink-0 relative">
        <div
          className="w-9 h-9 bg-primary/15 flex items-center justify-center text-primary"
          style={{ borderRadius: 'var(--radius)' }}
        >
          <span className="text-xs font-medium">{reply.authorAvatar}</span>
        </div>
      </div>

      {/* Contenido de la respuesta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-medium text-foreground text-sm">{reply.author}</span>
          {!isReplyingToPost && parentReply && (
            <>
              <CornerDownRight className="w-3 h-3 text-foreground" />
              <span className="text-xs text-foreground">
                respondiendo a <span className="text-primary">{parentReply.author}</span>
              </span>
            </>
          )}
          <span className="text-xs text-foreground">
            {new Date(reply.date).toLocaleDateString("es-ES", {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
        <p className="text-sm text-foreground mb-2 leading-relaxed">{reply.content}</p>

        {/* Botones de interacción */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 text-xs text-foreground hover:text-destructive transition-colors">
            <Heart className="w-3.5 h-3.5" />
            <span>{reply.likes}</span>
          </button>
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="flex items-center gap-1.5 text-xs text-foreground hover:text-primary transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Responder</span>
          </button>
        </div>

        {/* Formulario de respuesta */}
        {showReplyForm && (
          <div className="mt-3">
            <textarea
              rows={2}
              placeholder={`Respondiendo a ${reply.author}...`}
              className="w-full px-3 py-2 text-sm border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              style={{ borderRadius: 'var(--radius)' }}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setShowReplyForm(false)}
                className="px-3 py-1.5 text-xs border border-border hover:bg-accent transition-colors"
                style={{ borderRadius: 'var(--radius)' }}
              >
                Cancelar
              </button>
              <button
                className="px-3 py-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary-dim transition-colors"
                style={{ borderRadius: 'var(--radius)' }}
              >
                Responder
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface PostItemProps {
  post: Post;
  isLast: boolean;
}

function PostItem({ post, isLast }: PostItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);

  // Aplanar todas las respuestas para mostrarlas en un solo nivel
  const allRepliesFlat = flattenReplies(post.replies);

  return (
    <>
      <div className="py-5 px-5">
        <div className="flex gap-4">
          {/* Avatar del autor */}
          <div className="flex-shrink-0">
            <div
              className="w-11 h-11 bg-primary/15 flex items-center justify-center text-primary"
              style={{ borderRadius: 'var(--radius)' }}
            >
              <span className="text-sm font-medium">{post.authorAvatar}</span>
            </div>
          </div>

          {/* Contenido de la publicación */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-medium text-foreground">{post.author}</span>
              <span className="text-sm text-foreground">
                {new Date(post.date).toLocaleDateString("es-ES", {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            {post.title && (
              <h3 className="text-foreground mb-2">{post.title}</h3>
            )}

            <p className="text-foreground leading-relaxed mb-3">{post.content}</p>

            {/* Botones de interacción */}
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-sm text-foreground hover:text-destructive transition-colors">
                <Heart className="w-4 h-4" />
                <span>{post.likes}</span>
              </button>
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{allRepliesFlat.length} {allRepliesFlat.length === 1 ? 'respuesta' : 'respuestas'}</span>
              </button>
            </div>

            {/* Formulario de respuesta */}
            {showReplyForm && (
              <div className="mt-4 pt-4 border-t border-border">
                <textarea
                  rows={3}
                  placeholder="Escribe tu respuesta..."
                  className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  style={{ borderRadius: 'var(--radius)' }}
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setShowReplyForm(false)}
                    className="px-4 py-2 border border-border hover:bg-accent transition-colors"
                    style={{ borderRadius: 'var(--radius)' }}
                  >
                    Cancelar
                  </button>
                  <button
                    className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors"
                    style={{ borderRadius: 'var(--radius)' }}
                  >
                    Responder
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Todas las respuestas en un solo nivel */}
        {allRepliesFlat.length > 0 && (
          <div className="mt-3 ml-11">
            {allRepliesFlat.map((reply) => (
              <ReplyItem
                key={reply.id}
                reply={reply}
                postId={post.id}
                allRepliesFlat={allRepliesFlat}
              />
            ))}
          </div>
        )}
      </div>

      {/* Separador entre posts */}
      {!isLast && (
        <div className="border-t border-border"></div>
      )}
    </>
  );
}

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function NewPostModal({ isOpen, onClose }: NewPostModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card max-w-2xl w-full shadow-2xl" style={{ borderRadius: 'var(--radius)' }}>
        <div className="border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-card-foreground">Nueva Publicación</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent transition-colors"
            style={{ borderRadius: 'var(--radius)' }}
          >
            <Plus className="w-5 h-5 rotate-45 text-muted-foreground" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block mb-2 text-card-foreground">Título (opcional)</label>
            <input
              type="text"
              placeholder="Título de la publicación..."
              className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              style={{ borderRadius: 'var(--radius)' }}
            />
          </div>
          <div>
            <label className="block mb-2 text-card-foreground">Contenido</label>
            <textarea
              rows={6}
              placeholder="Describe tu duda, comparte información o inicia una discusión..."
              className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-all"
              style={{ borderRadius: 'var(--radius)' }}
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-border hover:bg-accent transition-colors"
              style={{ borderRadius: 'var(--radius)' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors shadow-sm"
              style={{ borderRadius: 'var(--radius)' }}
            >
              Publicar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ForumBoardView() {
  const { portalId, boardId } = useParams();
  const [showNewPostModal, setShowNewPostModal] = useState(false);

  // Obtener datos del tablero (mock)
  const boardData = mockBoardData[Number(boardId) as keyof typeof mockBoardData] || mockBoardData[1];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-foreground">
        <Link to={`/portal/${portalId}/foro`} className="hover:text-primary transition-colors">
          Foro
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground">{boardData.category}</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground">{boardData.title}</span>
      </nav>

      {/* Header del tablero */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h1 className="mb-2 text-foreground">{boardData.title}</h1>
            <p className="text-foreground max-w-3xl">{boardData.description}</p>
          </div>
          <button
            onClick={() => setShowNewPostModal(true)}
            className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap ml-4"
            style={{ borderRadius: 'var(--radius)' }}
          >
            <Plus className="w-5 h-5" />
            Nueva Publicación
          </button>
        </div>
        <div
          className="inline-block px-3 py-1 bg-accent text-accent-foreground text-sm"
          style={{ borderRadius: 'var(--radius)' }}
        >
          {boardData.category}
        </div>
      </div>

      {/* Sección única con separadores entre posts */}
      <div className="bg-surface-container-lowest shadow-sm" style={{ borderRadius: 'var(--radius)' }}>
        {mockPosts.map((post, index) => (
          <PostItem key={post.id} post={post} isLast={index === mockPosts.length - 1} />
        ))}
      </div>

      {/* Modal Nueva Publicación */}
      <NewPostModal isOpen={showNewPostModal} onClose={() => setShowNewPostModal(false)} />
    </div>
  );
}
