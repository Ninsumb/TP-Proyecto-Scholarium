package com.unsam.scholarium.dto

/**
 * Respuesta devuelta al crear un Portal exitosamente.
 * El front necesita el id para poder redirigir al usuario
 * directamente a su portal recién creado.
 */
data class CrearPortalResponse(
    val id: Long,
    val universidad: String,
    val carrera: String,
)