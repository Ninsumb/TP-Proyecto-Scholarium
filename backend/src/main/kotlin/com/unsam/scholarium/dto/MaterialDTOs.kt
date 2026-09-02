package com.unsam.scholarium.dto

import com.unsam.scholarium.model.EstadoMaterial
import com.unsam.scholarium.model.Material
import com.unsam.scholarium.model.TipoMaterial
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.util.Date
import java.util.UUID

data class MaterialResponse(
    val id: UUID,
    val nombre: String,
    val descripcion: String,
    val tipo: TipoMaterial,
    val estado: EstadoMaterial,
    val url: String,
    val tamanio: Long,
    val tipoArchivo: String,
    val uploadedByEmail: String,
    val createdAt: Date,
    val updatedAt: Date?
) {
    companion object {
        fun fromEntity(material: Material): MaterialResponse {
            return MaterialResponse(
                id = material.id!!,
                nombre = material.nombre,
                descripcion = material.descripcion,
                tipo = material.tipo,
                estado = material.estado,
                url = material.url,
                tamanio = material.tamanio,
                tipoArchivo = material.tipoArchivo,
                uploadedByEmail = material.usuario.email,
                createdAt = material.createdAt,
                updatedAt = material.updatedAt
            )
        }
    }
}

data class MaterialPendienteDTO(
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

data class EditarMaterialRequest(
    @field:NotBlank(message = "El nombre no puede estar vacío")
    @field:Size(max = 150, message = "El nombre no puede superar los 150 caracteres")
    val nombre: String,

    @field:Size(max = 1000, message = "La descripción no puede superar los 1000 caracteres")
    val descripcion: String?,

    val tipo: TipoMaterial
)

data class RechazarMaterialRequest(
    @field:NotBlank(message = "El motivo de rechazo no puede estar vacío")
    @field:Size(min = 10, max = 500, message = "El motivo debe tener entre 10 y 500 caracteres")
    val motivoRechazo: String
)

data class ArchivoSubidoResponse(
    val url: String,
    val publicId: String,
    val tamanio: Long,
    val tipoArchivo: String
)
