// ForumBoardsList.tsx
import { useState, useEffect } from "react";
import { MessageSquare, Search, Plus, ChevronRight, MessageCircle, Loader2, UserPlus, Lock } from "lucide-react";
import { Link, useOutletContext, useParams } from "react-router";
import { foroService } from "../../../services/Portal/ForoService";
import type { TableroResponse, CrearTableroRequest } from "../../../types/Portal/Foro";
import { CategoryBadge } from "../../../Components/common/CategoryBadge";
import { Modal } from "../../../Components/common/Modal";
import { Pagination } from "../../../Components/common/Pagination";

// ── Modal Crear Tablero ───────────────────────────────────────────────────────

interface CreateBoardModalProps {
  isOpen: boolean;
  portalId: number;
  etiquetasExistentes: string[];
  onClose: () => void;
  onCreado: (tablero: TableroResponse) => void;
}

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

function CreateBoardModal({
  isOpen,
  portalId,
  etiquetasExistentes,
  onClose,
  onCreado,
}: CreateBoardModalProps) {
  const [nombre, setNombre] = useState("");
  const [etiqueta, setEtiqueta] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nombre.trim()) return setError("El nombre es obligatorio.");
    if (!etiqueta) return setError("Seleccioná una categoría.");

    const request: CrearTableroRequest = {
      nombre: nombre.trim(),
      etiqueta,
      descripcion: descripcion.trim() || null,
    };

    try {
      setCargando(true);
      const nuevo = await foroService.crearTablero(portalId, request);
      onCreado(nuevo);
      setNombre("");
      setEtiqueta("");
      setDescripcion("");
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(msg || "No se pudo crear el tablero. Verificá que la etiqueta exista en el portal.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal onClose={onClose} maxWidth="42rem">
        <div className="border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-card-foreground">Crear Nuevo Tablero</h2>
          <button onClick={onClose} className="p-2 hover:bg-accent transition-colors" style={{ borderRadius: "var(--radius-sm)" }}>
            <Plus className="w-5 h-5 rotate-45 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="px-4 py-3 bg-destructive/10 text-destructive text-sm" style={{ borderRadius: "var(--radius)" }}>
              {error}
            </div>
          )}

          <div>
            <label className="block mb-2 text-card-foreground">Título del Tablero</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Dudas sobre el final"
              className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              style={{ borderRadius: "var(--radius)" }}
            />
          </div>

          <div>
            <label className="block mb-2 text-card-foreground">Categoría</label>
            <select
              value={etiqueta}
              onChange={(e) => setEtiqueta(e.target.value)}
              className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all appearance-none"
              style={{ borderRadius: "var(--radius)" }}
            >
              <option value="">Seleccionar categoría</option>
              {etiquetasExistentes.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-card-foreground">Descripción</label>
            <textarea
              rows={5}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe el propósito de este tablero..."
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
              disabled={cargando}
              className="px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors flex items-center gap-2 disabled:opacity-60 portal-hoverable"
              style={{ borderRadius: "var(--radius)", boxShadow: "var(--portal-shadow-card)" }}
            >
              {cargando && <Loader2 className="w-4 h-4 animate-spin" />}
              Crear Tablero
            </button>
          </div>
        </form>
    </Modal>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function ForumBoardsList() {
  const { portalId } = useParams();
  // Recibir isOpen del contexto
  const context = useOutletContext<{ isAdmin: boolean; isMember: boolean; isOpen: boolean }>();
  const isAdmin = context?.isAdmin || false;
  const isMember = context?.isMember || false;
  const isOpen = context?.isOpen || false;
  const puedeCrearTablero = isAdmin;


  const portalIdNum = Number(portalId);

  const [tableros, setTableros] = useState<TableroResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        setError(null);
        const data = await foroService.listarTableros(portalIdNum);
        setTableros(data);
      } catch {
        setError("No se pudieron cargar los tableros. Intentá de nuevo.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [portalIdNum]);

  // Las categorías se derivan dinámicamente de los tableros reales
  const etiquetas = Array.from(new Set(tableros.map((t) => t.etiqueta.nombre)));
  const categories = ["Todos", ...etiquetas];

  const filteredBoards = tableros.filter((tablero) => {
    const matchesSearch =
      tablero.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tablero.descripcion ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "Todos" || tablero.etiqueta.nombre === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filteredBoards.length / PAGE_SIZE));
  const pagedBoards = filteredBoards.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategory]);

  const handleTableroCreado = (nuevo: TableroResponse) => {
    setTableros((prev) => [nuevo, ...prev]);
  };

   if (!isMember && !isAdmin && !isOpen) {
    return <AccesoDenegado portalId={portalId} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-10 portal-fade-up">
        <div className="flex items-start gap-4">
          <div
            className="hidden sm:flex w-12 h-12 flex-shrink-0 items-center justify-center bg-primary/10 text-primary"
            style={{ borderRadius: "var(--radius-md)" }}
          >
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="mb-1.5 text-foreground">Foro de Discusión</h1>
            <p className="text-muted-foreground">Comparte dudas, recursos y experiencias con la comunidad</p>
          </div>
        </div>
        {/* Solo admins pueden crear tableros */}
        {puedeCrearTablero && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors flex items-center gap-2 flex-shrink-0 portal-hoverable"
            style={{ borderRadius: "var(--radius)", boxShadow: "var(--portal-shadow-card)" }}
          >
            <Plus className="w-5 h-5" />
            Crear Tablero
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-8 portal-fade-up-delay">
        {/* Sidebar */}
        <aside className="space-y-6">
          <div
            className="bg-card p-5 border border-border"
            style={{ borderRadius: "var(--radius-lg)", boxShadow: "var(--portal-shadow-card)" }}
          >
            <h3 className="mb-4 text-foreground">Categorías</h3>
            <div className="space-y-1.5">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left px-3 py-2 text-sm text-foreground transition-colors ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground font-medium"
                      : "hover:bg-surface-container text-foreground"
                  }`}
                  style={{ borderRadius: "var(--radius-sm)" }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Contenido principal */}
        <main>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar tableros..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                style={{ borderRadius: 'var(--radius)', boxShadow: 'var(--portal-shadow-card)' }}
              />
            </div>
          </div>

          {/* Estados */}
          {cargando && (
            <div className="flex items-center justify-center py-20 gap-3 text-on-surface-variant">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Cargando tableros...</span>
            </div>
          )}

          {error && !cargando && (
            <div className="text-center py-16">
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

          {!cargando && !error && (
            <div className="space-y-3">
              {pagedBoards.map((tablero) => (
                <Link
                  key={tablero.id}
                  to={`/portal/${portalId}/foro/${tablero.id}`}
                  className="block bg-card border border-border transition-all group portal-hoverable"
                  style={{ borderRadius: "var(--radius-lg)", boxShadow: "var(--portal-shadow-card)" }}
                >
                  <div className="p-5 flex gap-4">
                    <div className="flex-shrink-0">
                      <div
                        className="w-12 h-12 bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors"
                        style={{ borderRadius: "var(--radius-md)" }}
                      >
                        <MessageSquare className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h4 className="text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                          {tablero.nombre}
                          <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h4>
                        <CategoryBadge label={tablero.etiqueta.nombre} />
                      </div>

                      {tablero.descripcion && (
                        <p className="text-sm text-on-surface-variant mb-3 line-clamp-2">
                          {tablero.descripcion}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-on-surface-variant">
                        <span>
                          {new Date(tablero.createdAt).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3.5 h-3.5" />
                          {tablero.etiqueta.nombre}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}

              {filteredBoards.length === 0 && (
                <div className="text-center py-16">
                  <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
                  <p className="text-on-surface-variant">No se encontraron tableros</p>
                </div>
              )}

              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </main>
      </div>

      <CreateBoardModal
        isOpen={showCreateModal}
        portalId={portalIdNum}
        etiquetasExistentes={etiquetas}
        onClose={() => setShowCreateModal(false)}
        onCreado={handleTableroCreado}
      />
    </div>
  );
}