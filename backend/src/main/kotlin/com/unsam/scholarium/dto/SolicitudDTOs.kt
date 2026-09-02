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

/**
 * Request para actualizar la PlantillaSolicitud de un portal.
 * Permite a un admin:
 *   - Cambiar el texto de requisitos que ven los usuarios antes de solicitar.
 *   - Abrir o cerrar el portal a nuevas solicitudes.
 *
 * Ambos campos son opcionales: si se manda null no se toca ese campo.
 */
data class ActualizarPlantillaRequest(
    val requisitos: String?,
    val abierta: Boolean?,
)

data class ActualizarPlantillaSolicitudRequest(
    val requisitos: String,
    val abierta: Boolean
)

data class PuedeSolicitarResponse(
    val puede: Boolean,
    val motivo: String? // "BLOQUEADO" | "YA_MIEMBRO" | "PENDIENTE" | null
)
