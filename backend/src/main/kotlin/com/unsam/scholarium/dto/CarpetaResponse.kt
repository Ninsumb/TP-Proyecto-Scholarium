package com.unsam.scholarium.dto

import java.util.Date
import java.util.UUID

data class CarpetaResponse(
    val id: UUID,
    val nombre: String,
    val portalId: Long,
    val carpetaPadreId: UUID?,
    val orden: Int,
    val createdAt: Date?
)