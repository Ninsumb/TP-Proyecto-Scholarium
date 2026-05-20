import { useState } from "react";
import { useParams, Link, useOutletContext } from "react-router";
import { FileText, Download, Eye, Upload, ArrowLeft, Calendar, User, Edit2, Save, X, Mail, Globe, Phone } from "lucide-react";
import { UploadMaterialModal } from "./SubirMaterialModal";

interface PortalContext {
  isMember: boolean;
  isAdmin: boolean;
}

const mockSubjects: Record<string, any> = {
  prog1: {
    name: "Programación I",
    code: "INF101",
    year: 1,
    semester: 1,
    description: "Introducción a la programación estructurada y fundamentos de algoritmos",
  },
  bd: {
    name: "Base de Datos",
    code: "INF301",
    year: 2,
    semester: 1,
    description: "Diseño e implementación de bases de datos relacionales",
  },
};

const mockMaterials = [
  {
    id: 1,
    title: "Apuntes de Clase - Unidad 1",
    type: "PDF",
    size: "2.4 MB",
    uploadDate: "2026-03-15",
    uploadedBy: "Prof. García",
    downloads: 156,
    status: "approved",
  },
  {
    id: 2,
    title: "Ejercicios Prácticos - Estructuras de Control",
    type: "PDF",
    size: "1.8 MB",
    uploadDate: "2026-03-20",
    uploadedBy: "María Rodríguez",
    downloads: 142,
    status: "approved",
  },
  {
    id: 3,
    title: "Guía de Estudio - Parcial 1",
    type: "DOCX",
    size: "890 KB",
    uploadDate: "2026-03-25",
    uploadedBy: "Juan Pérez",
    downloads: 203,
    status: "approved",
  },
  {
    id: 4,
    title: "Código de Ejemplo - Funciones",
    type: "ZIP",
    size: "456 KB",
    uploadDate: "2026-03-28",
    uploadedBy: "Ana López",
    downloads: 98,
    status: "approved",
  },
  {
    id: 5,
    title: "Presentación - Introducción a Algoritmos",
    type: "PPTX",
    size: "5.2 MB",
    uploadDate: "2026-03-30",
    uploadedBy: "Prof. García",
    downloads: 187,
    status: "approved",
  },
];

export function SubjectDetail() {
  const { id, portalId } = useParams();
  const context = useOutletContext<PortalContext>();
  const isAdmin = context?.isAdmin || false;
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [isEditing, setIsEditing] = useState(false);
  const [editedSubject, setEditedSubject] = useState(mockSubjects[id || ""] || mockSubjects.prog1);

  const subject = mockSubjects[id || ""] || mockSubjects.prog1;

  const handleSave = () => {
    // Aquí se guardarían los cambios en la base de datos
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedSubject(subject);
    setIsEditing(false);
  };

  const filteredMaterials =
    filterType === "all"
      ? mockMaterials
      : mockMaterials.filter((m) => m.type.toLowerCase() === filterType.toLowerCase());

  return (
    <>
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
              {!isEditing && (
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

          {/* Información adicional de contacto - editable por admin */}
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

        <div className="mb-6 flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Filtrar por tipo:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                filterType === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent text-accent-foreground hover:bg-accent/80"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType("pdf")}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                filterType === "pdf"
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent text-accent-foreground hover:bg-accent/80"
              }`}
            >
              PDF
            </button>
            <button
              onClick={() => setFilterType("docx")}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                filterType === "docx"
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent text-accent-foreground hover:bg-accent/80"
              }`}
            >
              DOCX
            </button>
            <button
              onClick={() => setFilterType("zip")}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                filterType === "zip"
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent text-accent-foreground hover:bg-accent/80"
              }`}
            >
              ZIP
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredMaterials.map((material) => (
            <div
              key={material.id}
              className="bg-card border border-border rounded-lg p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1">
                  <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-card-foreground">{material.title}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {material.type} • {material.size}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(material.uploadDate).toLocaleDateString("es-ES")}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {material.uploadedBy}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        {material.downloads} descargas
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 rounded-md bg-accent hover:bg-accent/80 transition-colors">
                    <Eye className="w-5 h-5 text-accent-foreground" />
                  </button>
                  <button className="p-2 rounded-md bg-primary hover:bg-primary/90 transition-colors">
                    <Download className="w-5 h-5 text-primary-foreground" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <UploadMaterialModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        subjectName={subject.name}
        materiaId={id ?? ""}
        onUploaded={()=> {setIsUploadModalOpen(false)}}
      />
    </>
  );
}