package com.unsam.scholarium.dto

import java.time.Instant
import java.util.UUID

data class MateriaResponse(
    val id: UUID,
    val nombre: String,
    val carpetaId: UUID,
    val orden: Int,
    val createdAt: Instant
)