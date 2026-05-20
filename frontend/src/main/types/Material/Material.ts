export type TipoMaterial =
  | 'APUNTE' | 'PARCIAL' | 'FINAL' | 'GUIA_EJERCICIOS' | 'OTRO';

export type EstadoMaterial = 'PENDIENTE' | 'PUBLICADO' | 'RECHAZADO';

export const TIPO_MATERIAL_OPCIONES: { value: TipoMaterial; label: string }[] = [
  { value: 'APUNTE', label: 'Apunte' },
  { value: 'PARCIAL', label: 'Parcial' },
  { value: 'FINAL', label: 'Final' },
  { value: 'GUIA_EJERCICIOS', label: 'Guía de ejercicios' },
  { value: 'OTRO', label: 'Otro' },
];

export interface SubirMaterialRequest {
  archivo: File;
  nombre: string;
  descripcion?: string;
  tipo: TipoMaterial;
}

export interface MaterialResponse {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: TipoMaterial;
  estado: EstadoMaterial;
  url: string;
  tamanio: number;
  tipoArchivo: string;
  uploadedByEmail: string;
  createdAt: string;
  updatedAt: string | null;
}