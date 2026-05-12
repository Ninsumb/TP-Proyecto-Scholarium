package com.unsam.scholarium.dto

import java.time.Instant
import java.util.UUID

data class ForoResponse(
    val id: UUID,
    val nombre: String,
    val etiqueta: EtiquetaSimpleResponse,
    val createdAt: Instant,
    val updatedAt: Instant?
)

data class EtiquetaSimpleResponse(
    val id: UUID,
    val nombre: String
)


data class ObtenerForosRequest(
    val portalId: Long,
    val etiquetaNombre: String? = null
)