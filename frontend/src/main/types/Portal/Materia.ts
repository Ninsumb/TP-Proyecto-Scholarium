// types/Portal/Materia.ts
export interface MateriaResponse {
  id: string;
  nombre: string;
  descripcion: string | null;
  carpetaId: string;
  orden: number;
  updatedAt: string;
}