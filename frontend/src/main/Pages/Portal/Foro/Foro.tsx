import { useState } from "react";
import { MessageSquare, Search, Plus, ChevronRight, MessageCircle } from "lucide-react";
import { Link, useParams } from "react-router";

// Mock data para tableros
const mockBoards = [
  {
    id: 1,
    title: "Info. y consultas de la carrera",
    category: "General",
    description: "Espacio para consultas generales sobre la carrera, requisitos, trámites y orientación académica.",
    author: "Admin Sistema",
    createdAt: "2026-02-15",
    postsCount: 24,
    repliesCount: 156,
  },
  {
    id: 2,
    title: "Dudas sobre el parcial de Programación I",
    category: "Programación I",
    description: "Resolvemos dudas sobre los temas del parcial: punteros, estructuras de control y funciones.",
    author: "Prof. García",
    createdAt: "2026-03-20",
    postsCount: 18,
    repliesCount: 94,
  },
  {
    id: 3,
    title: "Consultas sobre normalización de bases de datos",
    category: "Base de Datos",
    description: "Espacio dedicado a resolver dudas sobre formas normales, dependencias funcionales y diseño de BD.",
    author: "María González",
    createdAt: "2026-03-25",
    postsCount: 12,
    repliesCount: 67,
  },
  {
    id: 4,
    title: "Ejercicios de algoritmos de ordenamiento",
    category: "Algoritmos",
    description: "Compartimos y resolvemos ejercicios de bubble sort, quicksort, mergesort y otros algoritmos.",
    author: "Carlos Méndez",
    createdAt: "2026-04-01",
    postsCount: 31,
    repliesCount: 189,
  },
  {
    id: 5,
    title: "Recursos y libros recomendados",
    category: "General",
    description: "Compartimos libros, tutoriales, videos y recursos útiles para todas las materias de la carrera.",
    author: "Ana Rodríguez",
    createdAt: "2026-04-10",
    postsCount: 8,
    repliesCount: 42,
  },
];

const categories = ["Todos", "General", "Programación I", "Base de Datos", "Algoritmos"];

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function CreateBoardModal({ isOpen, onClose }: CreateBoardModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para crear el tablero
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card max-w-2xl w-full shadow-2xl" style={{ borderRadius: 'var(--radius)' }}>
        <div className="border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-card-foreground">Crear Nuevo Tablero</h2>
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
            <label className="block mb-2 text-card-foreground">Título del Tablero</label>
            <input
              type="text"
              placeholder="Ej: Dudas sobre el final"
              className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              style={{ borderRadius: 'var(--radius)' }}
            />
          </div>
          <div>
            <label className="block mb-2 text-card-foreground">Categoría</label>
            <select
              className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all appearance-none"
              style={{ borderRadius: 'var(--radius)' }}
            >
              <option value="">Seleccionar categoría</option>
              {categories.filter(cat => cat !== "Todos").map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 text-card-foreground">Descripción</label>
            <textarea
              rows={5}
              placeholder="Describe el propósito de este tablero..."
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
              Crear Tablero
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ForumBoardsList() {
  const { portalId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredBoards = mockBoards.filter((board) => {
    const matchesSearch =
      board.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      board.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" || board.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calcular estadísticas
  const totalBoards = mockBoards.length;
  const totalPosts = mockBoards.reduce((sum, board) => sum + board.postsCount, 0);
  const totalMembers = 1247; // Mock

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="mb-2 text-foreground">Foro de Discusión</h1>
          <p className="text-on-surface-variant">Comparte dudas, recursos y experiencias con la comunidad</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors flex items-center gap-2 shadow-sm"
          style={{ borderRadius: 'var(--radius)' }}
        >
          <Plus className="w-5 h-5" />
          Crear Tablero
        </button>
      </div>

      {/* Layout de 2 columnas - sidebar más estrecha para dar más espacio al contenido */}
      <div className="grid lg:grid-cols-[240px_1fr] gap-8">
        {/* Sidebar Izquierdo */}
        <aside className="space-y-6">
          {/* Categorías */}
          <div className="bg-surface-container-lowest p-5 shadow-sm" style={{ borderRadius: 'var(--radius)' }}>
            <h3 className="mb-4 text-foreground">Categorías</h3>
            <div className="space-y-1.5">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-surface-container text-on-surface-variant"
                  }`}
                  style={{ borderRadius: 'var(--radius)' }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Estadísticas */}
          <div className="bg-surface-container-lowest p-5 shadow-sm" style={{ borderRadius: 'var(--radius)' }}>
            <h3 className="mb-4 text-foreground">Estadísticas</h3>
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant text-sm">Tableros</span>
                <span className="text-foreground font-medium">{totalBoards}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant text-sm">Publicaciones</span>
                <span className="text-foreground font-medium">{totalPosts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant text-sm">Miembros</span>
                <span className="text-foreground font-medium">{totalMembers.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Contenido Principal */}
        <main>
          {/* Barra de búsqueda */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Buscar tableros..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                style={{ borderRadius: 'var(--radius)' }}
              />
            </div>
          </div>

          {/* Lista de Tableros */}
          <div className="space-y-3">
            {filteredBoards.map((board) => (
              <Link
                key={board.id}
                to={`/portal/${portalId}/foro/${board.id}`}
                className="block bg-surface-container-lowest hover:shadow-md transition-all group"
                style={{ borderRadius: 'var(--radius)' }}
              >
                <div className="p-5 flex gap-4">
                  {/* Icono del tablero */}
                  <div className="flex-shrink-0">
                    <div
                      className="w-12 h-12 bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors"
                      style={{ borderRadius: 'var(--radius)' }}
                    >
                      <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                  </div>

                  {/* Contenido del tablero */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h4 className="text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                        {board.title}
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h4>
                      <span
                        className="px-2.5 py-1 bg-accent text-accent-foreground text-xs whitespace-nowrap"
                        style={{ borderRadius: 'var(--radius)' }}
                      >
                        {board.category}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant mb-3 line-clamp-2">
                      {board.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1.5">
                        <span className="hidden sm:inline">{board.author}</span>
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span className="flex items-center gap-1">
                        {new Date(board.createdAt).toLocaleDateString("es-ES", {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {board.postsCount}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5" />
                        {board.repliesCount}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredBoards.length === 0 && (
            <div className="text-center py-16">
              <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
              <p className="text-on-surface-variant">No se encontraron tableros</p>
            </div>
          )}
        </main>
      </div>

      {/* Modal Crear Tablero */}
      <CreateBoardModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  );
}
