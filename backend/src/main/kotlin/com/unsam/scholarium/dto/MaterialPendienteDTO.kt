package com.unsam.scholarium.dto

import com.unsam.scholarium.model.Material
import com.unsam.scholarium.model.TipoMaterial
import java.util.Date
import java.util.UUID

data class MaterialPendienteDTO (
    val id: UUID,
    val nombre: String,
    val descripcion: String,
    val tipo: TipoMaterial,
    val url: String,
    val tamanio: Long,
    val tipoArchivo: String,
    val materia: MateriaResumenDTO,
    val uploadedByEmail: String,
    val createdAt: Date
) {
    companion object {
        fun fromEntity(material: Material): MaterialPendienteDTO {
            return MaterialPendienteDTO(
                id = material.id!!,
                nombre = material.nombre,
                descripcion = material.descripcion,
                tipo = material.tipo,
                url = material.url,
                tamanio = material.tamanio,
                tipoArchivo = material.tipoArchivo,
                materia = MateriaResumenDTO(
                    id = material.materia.id!!,
                    nombre = material.materia.nombre,
                    carpeta = material.materia.carpeta.nombre
                ),
                uploadedByEmail = material.usuario.email,
                createdAt = material.createdAt
            )
        }
    }
}

data class MateriaResumenDTO(
    val id: UUID,
    val nombre: String,
    val carpeta: String
)