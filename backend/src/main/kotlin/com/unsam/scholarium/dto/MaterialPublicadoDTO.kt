package com.unsam.scholarium.dto

import com.unsam.scholarium.model.EstadoMaterial
import com.unsam.scholarium.model.Material
import com.unsam.scholarium.model.TipoMaterial
import java.util.Date
import java.util.UUID

data class UploadedByResponse(
    val id: Long,
    val nombre: String
)

data class MaterialPublicadoResponse(
    val id: UUID,
    val nombre: String,
    val descripcion: String,
    val tipo: TipoMaterial,
    val archivoUrl: String,
    val tamanio: Long,
    val tipoArchivo: String,
    val uploadedBy: UploadedByResponse,
    val createdAt: Date
) {
    companion object {
        fun fromEntity(material: Material): MaterialPublicadoResponse {
            return MaterialPublicadoResponse(
                id = material.id!!,
                nombre = material.nombre,
                descripcion = material.descripcion,
                tipo = material.tipo,
                archivoUrl = material.url,
                tamanio = material.tamanio,
                tipoArchivo = material.tipoArchivo,
                uploadedBy = UploadedByResponse(
                    id = material.usuario.id!!,
                    nombre = material.usuario.nombre
                ),
                createdAt = material.createdAt
            )
        }
    }
}