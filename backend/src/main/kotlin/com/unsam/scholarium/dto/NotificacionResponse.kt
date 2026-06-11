package com.unsam.scholarium.dto

import java.time.LocalDateTime
import java.util.UUID

data class NotificacionResponse(
    val id: UUID,
    val tipo: String,
    val titulo: String,
    val descripcion: String,
    val portalNombre: String?,
    val leida: Boolean,
    val fechaCreacion: LocalDateTime,
    val entidadId: UUID?,
)