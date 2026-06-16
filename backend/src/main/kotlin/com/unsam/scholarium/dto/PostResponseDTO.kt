package com.unsam.scholarium.dto

import java.time.Instant
import java.util.UUID

data class PostResponse(
    val id: UUID,
    val titulo: String?,
    val contenido: String?,
    val tableroId: UUID,
    val autor: AutorDTO?,
    val postPadreId: UUID?,
    val cantidadRespuestas: Long,
    val eliminado: Boolean,
    val ocultado: Boolean,           // NUEVO
    val ocultadoMotivo: String?,     // NUEVO — solo se puebla para admins
    val createdAt: Instant,
    val updatedAt: Instant,
)