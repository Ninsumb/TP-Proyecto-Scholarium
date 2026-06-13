package com.unsam.scholarium.dto

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