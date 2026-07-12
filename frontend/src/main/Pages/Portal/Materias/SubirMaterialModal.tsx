import { useState } from "react";
import { X, Upload, FileText, CheckCircle2, Loader2, AlertCircle, FileUp } from "lucide-react"; // Importamos iconos para feedback
import {
    TIPO_MATERIAL_OPCIONES,
    type TipoMaterial,
    type MaterialResponse,
} from "../../../types/Material/Material";
import { materialService } from "../../../services/Material/MaterialService";
import { Modal } from "../../../Components/common/Modal";
import axios from "axios";

interface UploadMaterialModalProps {
    isOpen: boolean;
    onClose: () => void;
    subjectName: string;
    materiaId: string;
    onUploaded?: (m: MaterialResponse) => void;
}

export function UploadMaterialModal({
    isOpen,
    onClose,
    subjectName,
    materiaId,
    onUploaded,
}: UploadMaterialModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [tipo, setTipo] = useState<TipoMaterial | "">("");
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});

    // ESTADOS DE FEEDBACK
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs: Record<string, string> = {};
        const nombreTrim = title.trim();

        // Validaciones básicas
        if (!nombreTrim) errs.nombre = "El titulo es obligatorio.";
        if (!tipo) errs.tipo = "Seleccioná un tipo.";
        if (!file) errs.archivo = "Adjuntá un archivo.";

        setErrors(errs);
        if (Object.keys(errs).length) return;

        try {
            setIsSubmitting(true);
            const created = await materialService.subirMaterial(materiaId, {
                archivo: file!,
                nombre: nombreTrim,
                descripcion: description.trim() || undefined,
                tipo: tipo as TipoMaterial,
            });

            setIsSuccess(true);

            setTimeout(() => {
                onUploaded?.(created);
                handleClose();
            }, 1500);

        } catch (err) {
            const msg = axios.isAxiosError(err)
                ? (err.response?.data?.message ?? "Error al subir el material.")
                : "Error de conexión.";
            setErrors({ general: msg }); // FEEDBACK: Error
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setTitle(""); setDescription(""); setTipo(""); setFile(null);
        setErrors({}); setIsSuccess(false);
        onClose();
    };

    return (
        <Modal onClose={handleClose} maxWidth="42rem" className="max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-9 h-9 flex items-center justify-center flex-shrink-0"
                            style={{
                                borderRadius: "var(--radius-sm)",
                                background: "var(--primary)",
                                color: "var(--primary-foreground)",
                            }}
                        >
                            <FileUp className="w-4 h-4" />
                        </div>
                        <h2
                            className="text-lg font-semibold text-card-foreground"
                            style={{ fontFamily: "Work Sans, sans-serif" }}
                        >
                            Subir Material
                        </h2>
                    </div>
                    <button onClick={handleClose} className="p-2 hover:bg-accent rounded-md transition-colors">
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                {/* VISTA DE ÉXITO */}
                {isSuccess ? (
                    <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle2 className="w-9 h-9 text-emerald-500 animate-in zoom-in" />
                        </div>
                        <h3 className="text-2xl font-semibold text-foreground" style={{ fontFamily: "Work Sans, sans-serif" }}>
                            ¡Subida Exitosa!
                        </h3>
                        <p className="text-muted-foreground">El material se envió correctamente y está pendiente de aprobación.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {errors.general && (
                            <div className="p-3 rounded-md border border-destructive/40 bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {errors.general}
                            </div>
                        )}

                        <div>
                            <label className="block mb-2 text-sm font-medium text-card-foreground">Materia</label>
                            <input
                                type="text"
                                value={subjectName}
                                disabled
                                className="w-full px-4 py-2 border border-border rounded-md bg-muted text-muted-foreground"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-card-foreground">
                                Título del Material <span className="text-destructive">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={isSubmitting}
                                placeholder="Ej: Apuntes de Clase - Unidad 3"
                                className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                            />
                            {errors.nombre && <span className="text-xs text-destructive">{errors.nombre}</span>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-card-foreground">
                                    Tipo <span className="text-destructive">*</span>
                                </label>
                                <select
                                    value={tipo}
                                    onChange={(e) => setTipo(e.target.value as TipoMaterial)}
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                                >
                                    <option value="">Seleccioná...</option>
                                    {TIPO_MATERIAL_OPCIONES.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                                {errors.tipo && <span className="text-xs text-destructive">{errors.tipo}</span>}
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-card-foreground">
                                    Archivo <span className="text-destructive">*</span>
                                </label>
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    disabled={isSubmitting}
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="flex items-center justify-center gap-2 w-full h-[42px] border border-dashed rounded-md bg-background cursor-pointer hover:bg-accent hover:border-primary/40 transition-colors text-sm text-muted-foreground"
                                    style={{ borderColor: "var(--border)" }}
                                >
                                    <Upload className="w-4 h-4" />
                                    {file ? "Cambiar Archivo" : "Seleccionar Archivo"}
                                </label>
                            </div>
                        </div>

                        {file && (
                            <div
                                className="flex items-center gap-3 p-3 rounded-md"
                                style={{ background: "var(--muted)" }}
                            >
                                <div
                                    className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0"
                                >
                                    <FileText className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1 truncate">
                                    <p className="text-sm font-medium truncate text-foreground">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFile(null)}
                                    className="text-destructive text-xs font-medium hover:underline flex-shrink-0"
                                >
                                    Eliminar
                                </button>
                            </div>
                        )}
                        {errors.archivo && <span className="text-xs text-destructive">{errors.archivo}</span>}

                        <div>
                            <label className="block mb-2 text-sm font-medium text-card-foreground">Descripción</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={isSubmitting}
                                placeholder="Describe brevemente el contenido..."
                                rows={3}
                                className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow resize-none"
                            />
                        </div>

                        <div className="flex gap-3 justify-end sticky bottom-0 bg-card pt-2">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isSubmitting}
                                className="px-6 py-2 border border-border rounded-md hover:bg-accent transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-dim transition-colors flex items-center gap-2 disabled:opacity-70 portal-hoverable"
                                style={{ boxShadow: "var(--portal-shadow-card)" }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Subiendo...
                                    </>
                                ) : (
                                    "Subir Material"
                                )}
                            </button>
                        </div>
                    </form>
                )}
        </Modal>
    );
}
