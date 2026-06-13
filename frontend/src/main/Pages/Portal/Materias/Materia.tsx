import { useState, useEffect } from "react";
import { useParams, Link, useOutletContext } from "react-router";
import { FileText, Download, Upload, ArrowLeft, Calendar, User, Edit2, Save, X, Mail, Globe, Phone, Search } from "lucide-react";
import { UploadMaterialModal } from "./SubirMaterialModal";
import { materialService } from "../../../services/Material/MaterialService";
import type { MaterialResponse } from "../../../types/Material/Material";

interface PortalContext {
  isMember: boolean;
  isAdmin: boolean;
  isOpen: boolean;
}

const mockSubjects: Record<string, any> = {
  prog1: { 
    name: "Programación I", 
    code: "INF101", 
    year: 1, 
    semester: 1, 
    description: "Introducción a la programación estructurada y fundamentos de algoritmos" 
  },
  bd: { 
    name: "Base de Datos", 
    code: "INF301", 
    year: 2, 
    semester: 1, 
    description: "Diseño e implementación de bases de datos relacionales" 
  }
};

export function SubjectDetail() {
  const { id, portalId } = useParams();
  const context = useOutletContext<PortalContext>();
  const isAdmin = context?.isAdmin || false;
  const isMember = context?.isMember || false;
  const isOpen = context?.isOpen || false;

   const puedeAcceder = isMember || isAdmin || isOpen;

    const puedeSubirMaterial = isMember || isAdmin;

  const subject = mockSubjects[id || ""] || mockSubjects.prog1;

 
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedSubject, setEditedSubject] = useState(subject);
  
  
  const [materials, setMaterials] = useState<MaterialResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  
  useEffect(() => {
    if (!id || !puedeAcceder) return;
    setLoading(true);
    setError(null);

    const traerMateriales = searchTerm.trim() 
      ? materialService.buscarMaterial(id, searchTerm)
      : materialService.listarMaterialPublicado(id);

    traerMateriales
      .then((data) => setMaterials(data))
      .catch(() => setError("No se pudieron cargar los materiales."))
      .finally(() => setLoading(false));
  }, [id, searchTerm, puedeAcceder]);

  const handleDescargar = async (materialId: string) => {
    try {
      const url = await materialService.obtenerUrlDescarga(materialId);
      window.open(url, "_blank");
    } catch (err) {
      alert("Error al intentar descargar el archivo.");
    }
  };

  const handleSave = () => {
    // Aquí se guardarían los cambios en la base de datos
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedSubject(subject);
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

      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl mb-2 text-card-foreground">{subject.name}</h1>
            {isEditing ? (
              <textarea
                value={editedSubject.description}
                onChange={(e) => setEditedSubject({ ...editedSubject, description: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[60px] mb-3"
              />
            ) : (
              <p className="text-muted-foreground mb-4">{subject.description}</p>
            )}
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Código: {subject.code}</span>
              <span>•</span>
              <span>Año {subject.year} - Semestre {subject.semester}</span>
            </div>
          </div>
          <div className="flex gap-2 ml-4">
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
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Guardar
                </button>
                <button
                  onClick={handleCancel}
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

        {(isEditing || editedSubject.contactEmail || editedSubject.web || editedSubject.phone) && (
          <div className="mt-4 pt-4 border-t border-border">
            <h3 className="text-sm font-medium text-foreground mb-3">Información de Contacto</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-primary mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-1">Email</div>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedSubject.contactEmail || ""}
                      onChange={(e) => setEditedSubject({ ...editedSubject, contactEmail: e.target.value })}
                      placeholder="email@universidad.edu"
                      className="w-full px-2 py-1 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                  ) : (
                    <a href={`mailto:${editedSubject.contactEmail}`} className="text-sm text-primary hover:underline">
                      {editedSubject.contactEmail}
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Globe className="w-4 h-4 text-primary mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-1">Sitio Web</div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedSubject.web || ""}
                      onChange={(e) => setEditedSubject({ ...editedSubject, web: e.target.value })}
                      placeholder="www.ejemplo.com"
                      className="w-full px-2 py-1 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                  ) : (
                    <a href={`https://${editedSubject.web}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                      {editedSubject.web}
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-primary mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-1">Teléfono</div>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedSubject.phone || ""}
                      onChange={(e) => setEditedSubject({ ...editedSubject, phone: e.target.value })}
                      placeholder="+54 11 1234-5678"
                      className="w-full px-2 py-1 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                  ) : (
                    <a href={`tel:${editedSubject.phone}`} className="text-sm text-primary hover:underline">
                      {editedSubject.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Filtrar:</span>
          <div className="flex gap-2">
            {["all", "pdf", "docx", "zip"].map((tipo) => (
              <button
                key={tipo}
                onClick={() => setFilterType(tipo)}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  filterType === tipo ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground hover:bg-accent/80"
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

      <div className="space-y-3">
        {loading && <div className="text-center py-12 text-muted-foreground">Cargando materiales...</div>}
        {!loading && error && <div className="text-center py-12 text-destructive">{error}</div>}
        {!loading && !error && filteredMaterials.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No se encontraron materiales.</div>
        )}

        {!loading && !error && filteredMaterials.map((material) => (
          <div key={material.id} className="bg-card border border-border rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex gap-4 flex-1">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-card-foreground">{material.nombre || `Material ${material.id}`}</h3>
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
        subjectName={subject.name}
        materiaId={id ?? ""}
        onUploaded={() => {
          setIsUploadModalOpen(false);
          if (id) materialService.listarMaterialPublicado(id).then(setMaterials).catch(() => {});
        }}
      />
    </div>
  );
}