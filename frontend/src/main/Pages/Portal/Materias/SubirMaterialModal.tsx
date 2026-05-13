import { useState } from "react";
import { X, Upload, FileText } from "lucide-react";

interface UploadMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectName: string;
}

export function UploadMaterialModal({ isOpen, onClose, subjectName }: UploadMaterialModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Uploading material:", { title, description, file });
    onClose();
    setTitle("");
    setDescription("");
    setFile(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl text-card-foreground">Subir Material</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block mb-2 text-card-foreground">Materia</label>
            <input
              type="text"
              value={subjectName}
              disabled
              className="w-full px-4 py-2 border border-border rounded-md bg-muted text-muted-foreground"
            />
          </div>

          <div>
            <label className="block mb-2 text-card-foreground">
              Título del Material <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Apuntes de Clase - Unidad 3"
              required
              className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block mb-2 text-card-foreground">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe brevemente el contenido del material..."
              rows={4}
              className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div>
            <label className="block mb-2 text-card-foreground">
              Archivo <span className="text-destructive">*</span>
            </label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-primary" />
                  <div className="text-left">
                    <p className="text-card-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="ml-4 text-destructive hover:text-destructive/80"
                  >
                    Eliminar
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-card-foreground mb-2">Arrastra un archivo o haz clic para seleccionar</p>
                  <p className="text-sm text-muted-foreground">PDF, DOCX, PPTX, ZIP (máx. 50MB)</p>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                    required
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors cursor-pointer"
                  >
                    Seleccionar Archivo
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="bg-accent/50 rounded-md p-4 text-sm text-muted-foreground">
            <p className="mb-2">
              <strong className="text-accent-foreground">Nota:</strong> El material será revisado por un administrador antes de publicarse.
            </p>
            <p>Asegúrate de que el contenido sea relevante y de calidad para tus compañeros.</p>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-border rounded-md hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Subir Material
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
