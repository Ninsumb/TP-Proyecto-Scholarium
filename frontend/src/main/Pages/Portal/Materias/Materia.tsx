import { useState, useEffect } from "react";
import { useParams, Link, useOutletContext } from "react-router";
import {
  Download, Upload, ArrowLeft, Calendar,
  User, Edit2, Save, X, Search, Loader2,
  UserPlus, Lock, BookOpen, Inbox, AlertCircle,
  Pencil, Trash2
} from "lucide-react";
import { UploadMaterialModal } from "./SubirMaterialModal";
import { materialService } from "../../../services/Material/MaterialService";
import { materiaService } from "../../../services/Portal/MateriaService";
import type { MaterialResponse } from "../../../types/Material/Material";
import { TIPO_MATERIAL_OPCIONES, type TipoMaterial } from "../../../types/Material/Material";
import type { MateriaResponse } from "../../../types/Portal/Materia";
import { getTipoColor, getExtensionColor } from "../../../Utils/tagColors";
import { getExtensionIcon, getFileExtension } from "../../../Utils/materialIcons";
import { Pagination } from "../../../Components/common/Pagination";
import { ContextMenu } from "../../../Components/common/ContextMenu";
import { Modal } from "../../../Components/common/Modal";

interface PortalContext {
  isMember: boolean;
  isAdmin: boolean;
  isOpen: boolean;
}

//TODO: Este componente en realidad se puede abstraer... por cuestiones de tiempo lo dejo acá

function AccesoDenegado({ portalId }: { portalId: string | undefined }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="max-w-md">
        <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-6">
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
  const [filterTipo, setFilterTipo] = useState("all");
  const [filterExtension, setFilterExtension] = useState("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [filterMode, setFilterMode] = useState<"tipo" | "extension">("tipo");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  // ── Edición / eliminación de material (solo admin) ─────────────────────
  const [editingMaterial, setEditingMaterial] = useState<MaterialResponse | null>(null);
  const [editMatNombre, setEditMatNombre] = useState("");
  const [editMatDescripcion, setEditMatDescripcion] = useState("");
  const [editMatTipo, setEditMatTipo] = useState<TipoMaterial>("OTRO");
  const [savingMaterial, setSavingMaterial] = useState(false);

  const [deletingMaterial, setDeletingMaterial] = useState<MaterialResponse | null>(null);
  const [deletingMaterialLoading, setDeletingMaterialLoading] = useState(false);

  const TIPOS = ["all", "APUNTE", "PARCIAL", "FINAL", "GUIA_EJERCICIOS", "OTRO"];
  const EXTENSIONES = ["all", "img", "pdf", "docx", "pptx"];

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

  const openEditMaterial = (material: MaterialResponse) => {
    setEditingMaterial(material);
    setEditMatNombre(material.nombre);
    setEditMatDescripcion(material.descripcion ?? "");
    setEditMatTipo(material.tipo);
  };

  const handleSaveMaterialEdit = async () => {
    if (!editingMaterial || !id) return;
    setSavingMaterial(true);
    try {
      await materialService.editarMaterial(editingMaterial.id, {
        nombre: editMatNombre,
        descripcion: editMatDescripcion,
        tipo: editMatTipo,
      });
      setEditingMaterial(null);
      materialService.listarMaterialPublicado(id).then(setMaterials).catch(() => {});
    } catch {
      alert("Error al guardar los cambios del material.");
    } finally {
      setSavingMaterial(false);
    }
  };

  const handleConfirmDeleteMaterial = async () => {
    if (!deletingMaterial || !id) return;
    setDeletingMaterialLoading(true);
    try {
      await materialService.eliminarMaterial(deletingMaterial.id);
      setDeletingMaterial(null);
      materialService.listarMaterialPublicado(id).then(setMaterials).catch(() => {});
    } catch {
      alert("Error al eliminar el material.");
    } finally {
      setDeletingMaterialLoading(false);
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
      return <AccesoDenegado portalId={portalId} />;
  }

  const getExtension = getFileExtension;

  const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp"];

  const filteredMaterials = materials.filter((m) => {
    const coincideTipo =
      filterTipo === "all" ||
      m.tipo === filterTipo;

    const extension = getExtension(m.tipoArchivo);

    const coincideExtension =
      filterExtension === "all"
        ? true
        : filterExtension === "img"
          ? IMAGE_EXTENSIONS.includes(extension)
          : extension === filterExtension;

    return coincideTipo && coincideExtension;
  });

  const totalPages = Math.max(1, Math.ceil(filteredMaterials.length / PAGE_SIZE));
  const pagedMaterials = filteredMaterials.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [filterTipo, filterExtension, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      <Link
        to={`/portal/${portalId}/materias`}
        className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
        Volver a Materias
      </Link>

      {/* ── Header de la materia ── */}
      <div
        className="bg-card border border-border rounded-lg p-6 sm:p-7 mb-8 portal-fade-up"
        style={{ boxShadow: "var(--portal-shadow-card)" }}
      >
        {loadingMateria ? (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Cargando materia...</span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {!isEditing && (
                <div
                  className="hidden sm:flex w-12 h-12 items-center justify-center flex-shrink-0"
                  style={{
                    borderRadius: "var(--radius-sm)",
                    background: "var(--primary)",
                    color: "var(--primary-foreground)",
                  }}
                >
                  <BookOpen className="w-6 h-6" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <>
                    <input
                      value={editNombre}
                      onChange={(e) => setEditNombre(e.target.value)}
                      className="w-full text-2xl sm:text-3xl font-semibold px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow mb-3"
                      style={{ fontFamily: "Work Sans, sans-serif" }}
                    />
                    <textarea
                      value={editDescripcion}
                      onChange={(e) => setEditDescripcion(e.target.value)}
                      placeholder="Descripción de la materia (opcional)..."
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow min-h-[80px] text-sm"
                    />
                  </>
                ) : (
                  <>
                    <h1 className="text-card-foreground mb-1.5">
                      {materia?.nombre ?? "Materia"}
                    </h1>
                    {materia?.descripcion && (
                      <p className="text-muted-foreground leading-relaxed">{materia.descripcion}</p>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-2 flex-shrink-0">
              {isAdmin && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-accent hover:text-foreground transition-colors flex items-center gap-2 portal-hoverable"
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
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-dim transition-colors flex items-center gap-2 disabled:opacity-60 portal-hoverable"
                    style={{ boxShadow: "var(--portal-shadow-card)" }}
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-accent hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                </>
              )}
              {puedeSubirMaterial && !isEditing && (
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-dim transition-colors flex items-center gap-2 portal-hoverable"
                  style={{ boxShadow: "var(--portal-shadow-card)" }}
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
      <div className="mb-6 flex flex-col gap-4 portal-fade-up-delay">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Selector principal */}
          <div
            className="inline-flex items-center gap-1 p-1 self-start"
            style={{ background: "var(--muted)", borderRadius: "var(--radius-sm)" }}
          >
            {[
              { key: "tipo", label: "Etiqueta" },
              { key: "extension", label: "Extensión" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => {
                  setFilterMode(key as "tipo" | "extension");
                  setFilterTipo("all");
                  setFilterExtension("all");
                }}
                className={`px-3.5 py-1.5 text-sm font-medium rounded-sm transition-all ${
                  filterMode === key
                    ? "bg-card text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Barra de búsqueda */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar material por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
            />
          </div>
        </div>

        {/* Filtro dinámico */}
        <div className="flex flex-wrap gap-2">
          {(filterMode === "tipo" ? TIPOS : EXTENSIONES).map((value) => {
            const isActive =
              filterMode === "tipo" ? filterTipo === value : filterExtension === value;
            const color =
              value === "all"
                ? null
                : filterMode === "tipo"
                  ? getTipoColor(value)
                  : getExtensionColor(value);

            return (
              <button
                key={value}
                onClick={() =>
                  filterMode === "tipo"
                    ? setFilterTipo(value)
                    : setFilterExtension(value)
                }
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  isActive
                    ? color
                      ? "border-transparent"
                      : "bg-primary text-primary-foreground border-transparent"
                    : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/20"
                }`}
                style={isActive && color ? { background: color.text, color: "#ffffff" } : undefined}
              >
                {value === "all"
                  ? "Todos"
                  : value.replaceAll("_", " ").toUpperCase()
                }
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Lista de materiales ── */}
      <div className="space-y-3 portal-fade-up-delay">
        {loadingMaterials && (
          <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Cargando materiales...
          </div>
        )}
        {!loadingMaterials && errorMaterials && (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-destructive">
            <AlertCircle className="w-6 h-6" />
            <span>{errorMaterials}</span>
          </div>
        )}
        {!loadingMaterials && !errorMaterials && filteredMaterials.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
            <Inbox className="w-8 h-8 opacity-60" />
            <span>No se encontraron materiales.</span>
          </div>
        )}
        {!loadingMaterials && !errorMaterials && pagedMaterials.map((material) => {
          const tipoColor = getTipoColor(material.tipo);
          const extension = getExtension(material.tipoArchivo);
          const extensionColor = getExtensionColor(extension);
          const FileIcon = getExtensionIcon(extension);
          return (
            <div
              key={material.id}
              className="bg-card border border-border rounded-lg p-5 transition-all portal-hoverable"
              style={{ boxShadow: "var(--portal-shadow-card)" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4 flex-1 min-w-0">
                  <div
                    className="w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--muted)" }}
                  >
                    <FileIcon className="w-6 h-6" style={{ color: "var(--muted-foreground)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="mb-2 text-card-foreground font-medium truncate">
                      {material.nombre || `Material ${material.id}`}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: tipoColor.bg, color: tipoColor.text }}
                      >
                        {material.tipo.replaceAll("_", " ")}
                      </span>
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium uppercase"
                        style={{ background: extensionColor.bg, color: extensionColor.text }}
                      >
                        {extension}
                      </span>
                      {material.tamanio ? <span>{material.tamanio}</span> : null}
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
                <div className="flex gap-2 flex-shrink-0 items-center">
                  <button
                    onClick={() => handleDescargar(material.id)}
                    className="p-2.5 rounded-md bg-primary hover:bg-primary-dim transition-colors portal-hoverable"
                    title="Descargar material"
                  >
                    <Download className="w-5 h-5 text-primary-foreground" />
                  </button>
                  {isAdmin && (
                    <ContextMenu
                      items={[
                        {
                          label: "Editar material",
                          icon: <Pencil className="w-4 h-4" />,
                          onClick: () => openEditMaterial(material),
                        },
                        {
                          label: "Eliminar material",
                          icon: <Trash2 className="w-4 h-4" />,
                          danger: true,
                          onClick: () => setDeletingMaterial(material),
                        },
                      ]}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!loadingMaterials && !errorMaterials && (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}

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

      {editingMaterial && (
        <Modal onClose={() => setEditingMaterial(null)} maxWidth="28rem" className="p-6">
          <h3
            className="text-xl font-semibold text-foreground mb-4"
            style={{ fontFamily: "Work Sans, sans-serif" }}
          >
            Editar Material
          </h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">Nombre</label>
            <input
              type="text"
              value={editMatNombre}
              onChange={(e) => setEditMatNombre(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container-lowest text-foreground rounded-sm focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
              style={{ border: "1px solid var(--border)" }}
              autoFocus
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">Descripción</label>
            <textarea
              value={editMatDescripcion}
              onChange={(e) => setEditMatDescripcion(e.target.value)}
              placeholder="Descripción del material (opcional)..."
              className="w-full px-4 py-3 bg-surface-container-lowest text-foreground rounded-sm focus:outline-none focus:ring-2 focus:ring-primary transition-shadow min-h-[80px]"
              style={{ border: "1px solid var(--border)" }}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">Categoría</label>
            <select
              value={editMatTipo}
              onChange={(e) => setEditMatTipo(e.target.value as TipoMaterial)}
              className="w-full px-4 py-3 bg-surface-container-lowest text-foreground rounded-sm focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
              style={{ border: "1px solid var(--border)" }}
            >
              {TIPO_MATERIAL_OPCIONES.map((opcion) => (
                <option key={opcion.value} value={opcion.value}>
                  {opcion.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSaveMaterialEdit}
              disabled={savingMaterial || !editMatNombre.trim()}
              className="flex-1 px-4 py-2 rounded-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed portal-hoverable"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              {savingMaterial ? "Guardando..." : "Guardar"}
            </button>
            <button
              onClick={() => setEditingMaterial(null)}
              disabled={savingMaterial}
              className="flex-1 px-4 py-2 rounded-sm bg-muted text-muted-foreground hover:bg-accent hover:text-foreground transition-all disabled:opacity-40"
            >
              Cancelar
            </button>
          </div>
        </Modal>
      )}

      {deletingMaterial && (
        <Modal onClose={() => setDeletingMaterial(null)} maxWidth="28rem" className="p-6">
          <h3
            className="text-xl font-semibold text-foreground mb-4"
            style={{ fontFamily: "Work Sans, sans-serif" }}
          >
            Eliminar Material
          </h3>
          <p className="text-foreground mb-6">
            ¿Estás seguro de que querés eliminar{" "}
            <strong>"{deletingMaterial.nombre}"</strong>? Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleConfirmDeleteMaterial}
              disabled={deletingMaterialLoading}
              className="flex-1 px-4 py-2 rounded-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed portal-hoverable"
              style={{ background: "var(--destructive)", color: "var(--destructive-foreground)" }}
            >
              {deletingMaterialLoading ? "Eliminando..." : "Eliminar"}
            </button>
            <button
              onClick={() => setDeletingMaterial(null)}
              disabled={deletingMaterialLoading}
              className="flex-1 px-4 py-2 rounded-sm bg-muted text-muted-foreground hover:bg-accent hover:text-foreground transition-all disabled:opacity-40"
            >
              Cancelar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
