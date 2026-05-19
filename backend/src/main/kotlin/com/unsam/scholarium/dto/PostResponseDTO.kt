package com.unsam.scholarium.dto

import java.time.Instant
import java.util.UUID

data class PostResponse(
    val id: UUID,
    val titulo: String?,
    val contenido: String,
    val foroId: UUID,
    val autor: AutorDTO,
    val postPadreId: UUID?,
    val cantidadRespuestas: Long,
    val createdAt: Instant,
    val updatedAt: Instant
)