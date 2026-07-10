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
