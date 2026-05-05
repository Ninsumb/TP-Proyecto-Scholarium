package com.unsam.scholarium.dto

import com.unsam.scholarium.model.EstadoMaterial
import java.util.Date
import java.util.UUID

data class MaterialResponse(
    val id: UUID,
    val nombre: String,
    val estado: EstadoMaterial,
    val updatedAt: Date?
)
