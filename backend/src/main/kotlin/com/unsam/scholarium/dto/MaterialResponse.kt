package com.unsam.scholarium.dto

import com.unsam.scholarium.model.EstadoMaterial
import com.unsam.scholarium.model.TipoMaterial
import com.unsam.scholarium.model.Material
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