package com.unsam.scholarium.dto

import java.time.Instant
import java.util.Date
import java.util.UUID

data class CarpetaRequest(
    val nombre: String,
    val carpetaPadreId: UUID? = null
)

data class CarpetaResponse(
    val id: UUID,
    val nombre: String,
    val portalId: Long,
    val carpetaPadreId: UUID?,
    val orden: Int,
    val createdAt: Date?
)

data class MoverCarpetaBodyRequestDTO(
    val carpetaPadre: UUID?
)

data class CrearMateriaRequest(
    val nombre: String,
    val etiqueta: String
)

data class ActualizarMateriaRequest(
    val nombre: String,
    val descripcion: String? = null,
)

data class MateriaResponse(
    val id: UUID,
    val nombre: String,
    val descripcion: String?,
    val carpetaId: UUID,
    val orden: Int,
    val updatedAt: Instant
)

data class MoverMateriaRequest(
    val nuevaCarpetaId: UUID
)
