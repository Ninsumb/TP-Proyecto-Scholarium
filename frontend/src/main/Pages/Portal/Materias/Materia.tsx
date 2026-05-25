import { useState, useEffect } from "react";
import { useParams, Link, useOutletContext } from "react-router";
import { FileText, Download, Upload, ArrowLeft, Calendar, User, Edit2, Save, X, Mail, Globe, Phone, Search } from "lucide-react";
import { UploadMaterialModal } from "./SubirMaterialModal";
import { materialService } from "../../../services/Material/MaterialService";
import type { MaterialResponse } from "../../../types/Material/Material";

interface PortalContext {
  isMember: boolean;
  isAdmin: boolean;
}

const mockSubjects: Record<string, any> = {
  prog1: { name: "Programación I", code: "INF101", year: 1, semester: 1, description: "Introducción..." },
  bd: { name: "Base de Datos", code: "INF301", year: 2, semester: 1, description: "Diseño..." }
};

export function SubjectDetail() {
  const { id, portalId } = useParams();
  const context = useOutletContext<PortalContext>();
  const isAdmin = context?.isAdmin || false;
  const isMember = context?.isMember || false;
  const puedeAcceder = isMember || isAdmin;

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [materials, setMaterials] = useState<MaterialResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const subject = mockSubjects[id || ""] || mockSubjects.prog1;

  // Carga inicial y Búsqueda
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

  if (!puedeAcceder) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-destructive font-medium">
        Solo los miembros autorizados de este portal pueden ver o descargar el contenido de esta materia.
      </div>
    );
  }

  const filteredMaterials = filterType === "all"
    ? materials
    : materials.filter((m) => m.tipo?.toLowerCase() === filterType.toLowerCase());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Filtrar:</span>
          {["all", "pdf", "docx", "zip"].map((tipo) => (
            <button
              key={tipo}
              onClick={() => setFilterType(tipo)}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                filterType === tipo ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
              }`}
            >
              {tipo === "all" ? "Todos" : tipo.toUpperCase()}
            </button>
          ))}
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
              <button
                onClick={() => handleDescargar(material.id)}
                className="p-2 rounded-md bg-primary hover:bg-primary/90 transition-colors"
                title="Descargar material"
              >
                <Download className="w-5 h-5 text-primary-foreground" />
              </button>
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
          if (id) materialService.listarMaterialPublicado(id).then(setMaterials);
        }}
      />
    </div>
  );
}