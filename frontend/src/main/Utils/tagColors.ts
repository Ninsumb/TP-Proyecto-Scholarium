// Utils/tagColors.ts
// Designated colors for material "tipo" tags and file extensions, so each
// one reads as its own category at a glance instead of sharing one accent.

export interface TagColor {
  bg: string;
  text: string;
}

const TIPO_COLORS: Record<string, TagColor> = {
  APUNTE: { bg: "rgba(30, 127, 114, 0.12)", text: "#1e7f72" }, // Signal Teal
  PARCIAL: { bg: "rgba(200, 132, 26, 0.12)", text: "#c8841a" }, // Ember
  FINAL: { bg: "rgba(179, 38, 30, 0.12)", text: "#b3261e" }, // Rose
  GUIA_EJERCICIOS: { bg: "rgba(109, 91, 151, 0.12)", text: "#6d5b97" }, // Plum
  OTRO: { bg: "rgba(100, 114, 122, 0.14)", text: "#64727a" }, // Mist
};

const EXTENSION_COLORS: Record<string, TagColor> = {
  pdf: { bg: "rgba(179, 38, 30, 0.12)", text: "#b3261e" },
  docx: { bg: "rgba(42, 93, 176, 0.12)", text: "#2a5db0" },
  pptx: { bg: "rgba(194, 107, 31, 0.12)", text: "#c26b1f" },
  jpg: { bg: "rgba(47, 143, 91, 0.12)", text: "#2f8f5b" },
  png: { bg: "rgba(31, 138, 112, 0.12)", text: "#1f8a70" },
  gif: { bg: "rgba(122, 143, 47, 0.12)", text: "#7a8f2f" },
  webp: { bg: "rgba(47, 127, 143, 0.12)", text: "#2f7f8f" },
};

const FALLBACK_COLOR: TagColor = { bg: "rgba(100, 114, 122, 0.14)", text: "#64727a" };

export function getTipoColor(tipo: string): TagColor {
  return TIPO_COLORS[tipo] ?? FALLBACK_COLOR;
}

export function getExtensionColor(extension: string): TagColor {
  return EXTENSION_COLORS[extension.toLowerCase()] ?? FALLBACK_COLOR;
}
