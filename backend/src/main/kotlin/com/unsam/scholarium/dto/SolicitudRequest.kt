package com.unsam.scholarium.dto

/**
 * Request para crear una Solicitud de membresía.
 *
 * Cambios respecto a la versión anterior:
 * - Se eliminó `titulo`.
 * - Se agregó `nombreCompleto` (opcional): nombre real del solicitante.
 * - `descripcion` sigue siendo el campo principal de texto libre.
 */
data class SolicitudRequest(
    /** Nombre completo real del solicitante. Opcional, pero los admins pueden pedirlo. */
    val nombreCompleto: String? = null,
    /** Respuesta del usuario a los requisitos del portal. Obligatorio. */
    val descripcion: String,
)