import { useState } from "react";
import { Link, useParams, useOutletContext } from "react-router";
import { BookOpen, ChevronDown, ChevronRight, Folder, FolderPlus, Edit2, Trash2, Plus } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  code: string;
  materials: number;
}

interface FolderItem {
  id: string;
  name: string;
  type: "folder" | "subject";
  children?: FolderItem[];
  subject?: Subject;
}

// Mock data con estructura de carpetas dinámica
const initialFolderStructure: FolderItem[] = [
  {
    id: "year-1",
    name: "Primer Año",
    type: "folder",
    children: [
      {
        id: "year-1-sem-1",
        name: "Primer Cuatrimestre",
        type: "folder",
        children: [
          {
            id: "mat1",
            name: "Matemática I",
            type: "subject",
            subject: { id: "mat1", name: "Matemática I", code: "MAT101", materials: 24 },
          },
          {
            id: "fis1",
            name: "Física I",
            type: "subject",
            subject: { id: "fis1", name: "Física I", code: "FIS101", materials: 18 },
          },
          {
            id: "prog1",
            name: "Programación I",
            type: "subject",
            subject: { id: "prog1", name: "Programación I", code: "INF101", materials: 32 },
          },
        ],
      },
      {
        id: "year-1-sem-2",
        name: "Segundo Cuatrimestre",
        type: "folder",
        children: [
          {
            id: "mat2",
            name: "Matemática II",
            type: "subject",
            subject: { id: "mat2", name: "Matemática II", code: "MAT201", materials: 28 },
          },
          {
            id: "prog2",
            name: "Programación II",
            type: "subject",
            subject: { id: "prog2", name: "Programación II", code: "INF201", materials: 35 },
          },
        ],
      },
    ],
  },
  {
    id: "year-2",
    name: "Segundo Año",
    type: "folder",
    children: [
      {
        id: "year-2-sem-1",
        name: "Primer Cuatrimestre",
        type: "folder",
        children: [
          {
            id: "bd",
            name: "Base de Datos",
            type: "subject",
            subject: { id: "bd", name: "Base de Datos", code: "INF301", materials: 27 },
          },
          {
            id: "algo",
            name: "Algoritmos",
            type: "subject",
            subject: { id: "algo", name: "Algoritmos", code: "INF302", materials: 31 },
          },
        ],
      },
    ],
  },
  {
    id: "miscelanea",
    name: "Miscelánea",
    type: "folder",
    children: [
      {
        id: "seminarios",
        name: "Seminarios",
        type: "folder",
        children: [],
      },
    ],
  },
  {
    id: "historico",
    name: "Plan de Estudio Anterior (2015)",
    type: "folder",
    children: [
      {
        id: "old-prog",
        name: "Programación Avanzada",
        type: "subject",
        subject: { id: "old-prog", name: "Programación Avanzada", code: "INF999", materials: 15 },
      },
    ],
  },
];

export function Subjects() {
  const { portalId } = useParams();
  const { isAdmin } = useOutletContext<{ isAdmin: boolean; isMember: boolean }>();
  const [folderStructure, setFolderStructure] = useState<FolderItem[]>(initialFolderStructure);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["year-1"]));
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedParentFolder, setSelectedParentFolder] = useState<string | null>(null);

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateFolder = (parentId: string | null) => {
    setSelectedParentFolder(parentId);
    setShowNewFolderModal(true);
  };

  const createFolder = () => {
    if (!newFolderName.trim()) return;

    const newFolder: FolderItem = {
      id: `folder-${Date.now()}`,
      name: newFolderName,
      type: "folder",
      children: [],
    };

    if (selectedParentFolder === null) {
      // Agregar a raíz
      setFolderStructure([...folderStructure, newFolder]);
    } else {
      // Agregar dentro de una carpeta
      const addToFolder = (items: FolderItem[]): FolderItem[] => {
        return items.map(item => {
          if (item.id === selectedParentFolder) {
            return {
              ...item,
              children: [...(item.children || []), newFolder],
            };
          }
          if (item.children) {
            return {
              ...item,
              children: addToFolder(item.children),
            };
          }
          return item;
        });
      };
      setFolderStructure(addToFolder(folderStructure));
    }

    setNewFolderName("");
    setShowNewFolderModal(false);
    setSelectedParentFolder(null);
  };

  const renderFolder = (item: FolderItem, depth: number = 0) => {
    const isExpanded = expandedFolders.has(item.id);
    const paddingLeft = depth * 24;

    if (item.type === "subject" && item.subject) {
      return (
        <Link
          key={item.id}
          to={`/portal/${portalId}/materias/${item.subject.id}`}
          className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors group rounded-sm"
          style={{ paddingLeft: `${paddingLeft + 16}px` }}
        >
          <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="text-foreground group-hover:text-primary transition-colors">{item.subject.name}</h4>
            <p className="text-xs text-foreground uppercase tracking-wide">{item.subject.code}</p>
          </div>
          <div className="text-sm text-muted-foreground">
            {item.subject.materials} materiales
          </div>
        </Link>
      );
    }

    return (
      <div key={item.id}>
        <div
          className="flex items-center gap-2 px-4 py-3 hover:bg-surface-container-low transition-colors group rounded-sm"
          style={{ paddingLeft: `${paddingLeft + 16}px` }}
        >
          <button
            onClick={() => toggleFolder(item.id)}
            className="flex items-center gap-2 flex-1 text-left"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )}
            <Folder className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="font-medium text-foreground">{item.name}</span>
            <span className="text-xs text-foreground ml-2">
              {item.children?.length || 0} elementos
            </span>
          </button>

          {isAdmin && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button
                onClick={() => handleCreateFolder(item.id)}
                className="p-1.5 hover:bg-surface-container rounded-sm text-muted-foreground hover:text-foreground"
                title="Crear subcarpeta"
              >
                <FolderPlus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {isExpanded && item.children && (
          <div>
            {item.children.map(child => renderFolder(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl mb-2 text-foreground" style={{ fontFamily: 'Work Sans, sans-serif' }}>
            Materias de la Carrera
          </h1>
          <p className="text-muted-foreground">
            Explora las materias organizadas en carpetas personalizadas
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => handleCreateFolder(null)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-surface-container-high text-foreground hover:bg-surface-container transition-all"
          >
            <FolderPlus className="w-4 h-4" />
            Nueva Carpeta
          </button>
        )}
      </div>

      <div className="bg-surface-container-lowest rounded-sm" style={{ boxShadow: '0 1px 3px rgba(58, 95, 148, 0.06)' }}>
        {folderStructure.map(item => renderFolder(item))}
      </div>

      {/* Modal para crear nueva carpeta */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4"
          style={{ backdropFilter: 'blur(4px)' }}
          onClick={() => setShowNewFolderModal(false)}
        >
          <div
            className="bg-surface-container-lowest p-6 rounded-sm max-w-md w-full"
            style={{ boxShadow: '0 24px 40px rgba(42, 52, 57, 0.15)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-foreground mb-4" style={{ fontFamily: 'Work Sans, sans-serif' }}>
              Crear Nueva Carpeta
            </h3>

            <div className="mb-6">
              <label htmlFor="folderName" className="block text-sm font-medium text-foreground mb-2">
                Nombre de la carpeta
              </label>
              <input
                type="text"
                id="folderName"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Ej: Tercer Año, Electivas, etc."
                className="w-full px-4 py-3 bg-surface-container-lowest text-foreground rounded-sm focus:outline-none focus:ring-2 focus:ring-primary"
                style={{ border: '2px solid rgba(169, 180, 185, 0.15)' }}
                autoFocus
                onKeyPress={(e) => e.key === "Enter" && createFolder()}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={createFolder}
                className="flex-1 px-4 py-2 rounded-sm transition-all"
                style={{ 
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 100%)',
                  color: 'var(--primary-foreground)'
                }}
              >
                Crear Carpeta
              </button>
              <button
                onClick={() => {
                  setShowNewFolderModal(false);
                  setNewFolderName("");
                }}
                className="px-4 py-2 bg-surface-container-high text-foreground rounded-sm hover:bg-surface-container transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
