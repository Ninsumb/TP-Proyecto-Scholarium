import { useState, useEffect } from "react";
import { useParams, Link, useOutletContext } from "react-router";
import {
  FileText, Download, Upload, ArrowLeft, Calendar,
  User, Edit2, Save, X, Search, Loader2,
} from "lucide-react";
import { UploadMaterialModal } from "./SubirMaterialModal";
import { materialService } from "../../../services/Material/MaterialService";
import { materiaService } from "../../../services/Portal/MateriaService";
import type { MaterialResponse } from "../../../types/Material/Material";
import type { MateriaResponse } from "../../../types/Portal/Materia";

interface PortalContext {
  isMember: boolean;
  isAdmin: boolean;
  isOpen: boolean;
}

export function SubjectDetail() {
  const { id, portalId } = useParams();
  const context = useOutletContext<PortalContext>();
  const isAdmin = context?.isAdmin || false;
  const isMember = context?.isMember || false;
  const isOpen = context?.isOpen || false;

  const puedeAcceder = isMember || isAdmin || isOpen;
  const puedeSubirMaterial = isMember || isAdmin;

  // ── Estado de la materia ──────────────────────────────────────────────
  const [materia, setMateria] = useState<MateriaResponse | null>(null);
  const [loadingMateria, setLoadingMateria] = useState(true);

  // Estado de edición — solo nombre y descripción
  const [isEditing, setIsEditing] = useState(false);
  const [editNombre, setEditNombre] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");
  const [saving, setSaving] = useState(false);

  // ── Estado de materiales ──────────────────────────────────────────────
  const [materials, setMaterials] = useState<MaterialResponse[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const [errorMaterials, setErrorMaterials] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // ── Cargar materia ────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    setLoadingMateria(true);
    materiaService.obtenerMateria(id)
      .then((data) => {
        setMateria(data);
        setEditNombre(data.nombre);
        setEditDescripcion(data.descripcion ?? "");
      })
      .catch(() => setMateria(null))
      .finally(() => setLoadingMateria(false));
  }, [id]);

  // ── Cargar materiales ─────────────────────────────────────────────────
  useEffect(() => {
    if (!id || !puedeAcceder) return;
    setLoadingMaterials(true);
    setErrorMaterials(null);

    const traerMateriales = searchTerm.trim()
      ? materialService.buscarMaterial(id, searchTerm)
      : materialService.listarMaterialPublicado(id);

    traerMateriales
      .then((data) => setMaterials(data))
      .catch(() => setErrorMaterials("No se pudieron cargar los materiales."))
      .finally(() => setLoadingMaterials(false));
  }, [id, searchTerm, puedeAcceder]);

  const handleDescargar = async (materialId: string) => {
    try {
      const url = await materialService.obtenerUrlDescarga(materialId);
      window.open(url, "_blank");
    } catch {
      alert("Error al intentar descargar el archivo.");
    }
  };

  const handleSave = async () => {
    if (!id || !materia) return;
    setSaving(true);
    try {
      const updated = await materiaService.actualizarMateria(id, {
        nombre: editNombre,
        descripcion: editDescripcion,
      });
      setMateria(updated);
      setIsEditing(false);
    } catch {
      alert("Error al guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditNombre(materia?.nombre ?? "");
    setEditDescripcion(materia?.descripcion ?? "");
    setIsEditing(false);
  };

  if (!puedeAcceder) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-destructive font-medium">
        Este portal es privado. Solo los miembros pueden ver el contenido de sus materias.
      </div>
    );
  }

  const filteredMaterials = filterType === "all"
    ? materials
    : materials.filter((m) => m.tipo?.toLowerCase() === filterType.toLowerCase());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        to={`/portal/${portalId}/materias`}
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a Materias
      </Link>

      {/* ── Header de la materia ── */}
      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        {loadingMateria ? (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Cargando materia...</span>
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <>
                  <input
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    className="w-full text-3xl font-semibold px-3 py-1 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-3"
                  />
                  <textarea
                    value={editDescripcion}
                    onChange={(e) => setEditDescripcion(e.target.value)}
                    placeholder="Descripción de la materia (opcional)..."
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px] text-sm"
                  />
                </>
              ) : (
                <>
                  <h1 className="text-3xl mb-2 text-card-foreground">
                    {materia?.nombre ?? "Materia"}
                  </h1>
                  {materia?.descripcion && (
                    <p className="text-muted-foreground">{materia.descripcion}</p>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-2 ml-4 flex-shrink-0">
              {isAdmin && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-accent transition-colors flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
              )}
              {isAdmin && isEditing && (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-accent transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                </>
              )}
              {puedeSubirMaterial && !isEditing && (
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Subir Material
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Filtros y búsqueda ── */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Filtrar:</span>
          <div className="flex gap-2">
            {["all", "pdf", "docx", "zip"].map((tipo) => (
              <button
                key={tipo}
                onClick={() => setFilterType(tipo)}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  filterType === tipo
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent text-accent-foreground hover:bg-accent/80"
                }`}
              >
                {tipo === "all" ? "Todos" : tipo.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar material por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* ── Lista de materiales ── */}
      <div className="space-y-3">
        {loadingMaterials && (
          <div className="text-center py-12 text-muted-foreground">Cargando materiales...</div>
        )}
        {!loadingMaterials && errorMaterials && (
          <div className="text-center py-12 text-destructive">{errorMaterials}</div>
        )}
        {!loadingMaterials && !errorMaterials && filteredMaterials.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No se encontraron materiales.</div>
        )}
        {!loadingMaterials && !errorMaterials && filteredMaterials.map((material) => (
          <div key={material.id} className="bg-card border border-border rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex gap-4 flex-1">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-card-foreground">
                    {material.nombre || `Material ${material.id}`}
                  </h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {material.tipo}
                      {material.tamanio ? ` • ${material.tamanio}` : ""}
                    </span>
                    {material.createdAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(material.createdAt).toLocaleDateString("es-ES")}
                      </span>
                    )}
                    {material.uploadedByEmail && (
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {material.uploadedByEmail}
                      </span>
                    )}
                  </div>
                  {material.descripcion && (
                    <p className="mt-2 text-sm text-muted-foreground">{material.descripcion}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDescargar(material.id)}
                  className="p-2 rounded-md bg-primary hover:bg-primary/90 transition-colors"
                  title="Descargar material"
                >
                  <Download className="w-5 h-5 text-primary-foreground" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <UploadMaterialModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        subjectName={materia?.nombre ?? ""}
        materiaId={id ?? ""}
        onUploaded={() => {
          setIsUploadModalOpen(false);
          if (id) materialService.listarMaterialPublicado(id).then(setMaterials).catch(() => {});
        }}
      />
    </div>
  );
}