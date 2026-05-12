export interface Portal {
    id: string
    nombre: string
    universidad: string
    carrera: string
    descripcion: string
    numeroEstudiantes: number
}

export interface PortalCardProps{
   portal : Portal
}