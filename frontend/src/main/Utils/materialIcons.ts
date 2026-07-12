// Utils/materialIcons.ts
import { FileText, NotebookText, Presentation, FileImage, File, type LucideIcon } from "lucide-react";

const EXTENSION_ICONS: Record<string, LucideIcon> = {
  pdf: FileText,
  docx: NotebookText,
  pptx: Presentation,
  jpg: FileImage,
  jpeg: FileImage,
  png: FileImage,
  gif: FileImage,
  webp: FileImage,
};

export function getExtensionIcon(extension: string): LucideIcon {
  return EXTENSION_ICONS[extension.toLowerCase()] ?? File;
}

// Deriva una extensión legible a partir del mime type que devuelve el backend.
export function getFileExtension(tipoArchivo: string): string {
  const mime = tipoArchivo.toLowerCase();

  if (mime.includes("wordprocessingml")) return "docx";
  if (mime.includes("presentationml")) return "pptx";
  if (mime.includes("pdf")) return "pdf";

  if (mime.includes("jpeg")) return "jpg";
  if (mime.includes("png")) return "png";
  if (mime.includes("gif")) return "gif";
  if (mime.includes("webp")) return "webp";

  return mime;
}
