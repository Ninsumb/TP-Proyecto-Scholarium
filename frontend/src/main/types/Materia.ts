export interface MateriaResponse {
  id: string;
  nombre: string;
  codigo: string;
  anio: number;
  semestre: number;
  descripcion?: string;
  contactEmail?: string;
  web?: string;
  telefono?: string;
}
 
export type ActualizarMateriaRequest = Partial<
  Omit<MateriaResponse, "id">
>;
 