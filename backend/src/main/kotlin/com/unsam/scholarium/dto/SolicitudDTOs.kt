package com.unsam.scholarium.dto

/**
 * Respuesta de una Solicitud para el Panel de Administración.
 * Incluye toda la info que los admins necesitan para tomar una decisión.
 */
data class SolicitudResponse(
    val id: Long,
    val usuario: UsuarioResumenDTO,
    val nombreCompleto: String?,
    val descripcion: String,
    val estado: String,
    val fechaSolicitud: String,
    val motivoRechazo: String?,
)

data class UsuarioResumenDTO(
    val id: Long,
    val nombre: String,
    val email: String,
)

/**
 * Request para rechazar una solicitud con motivo obligatorio.
 */
data class RechazarSolicitudRequest(
    val motivoRechazo: String,
)

/**
 * Respuesta con la PlantillaSolicitud de un Portal.
 * Se expone al usuario ANTES de que complete el formulario de solicitud,
 * para que vea los requisitos y sepa si las solicitudes están abiertas.
 */
data class PlantillaSolicitudResponse(
    val requisitos: String?,
    val abierta: Boolean,
)