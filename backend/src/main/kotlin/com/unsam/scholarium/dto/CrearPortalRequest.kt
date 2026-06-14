package com.unsam.scholarium.dto

/**
 * DTO para la creación de un Portal.
 *
 * Reemplaza el anti-patrón actual de recibir la entidad Portal directamente
 * en el controller (@RequestBody portal: Portal). Recibir la entidad expone
 * campos que el cliente no debería poder setear (id, fechaRegistro, activo,
 * membresias, etc.) y acopla el contrato HTTP al modelo de dominio.
 *
 * La imagen subida (logoUrl) llega como una URL ya resuelta de Cloudinary:
 * el front sube la imagen a Cloudinary directamente y nos manda la URL resultante.
 * Esto es consistente con cómo manejan fotos de perfil y materiales.
 */
data class CrearPortalRequest(
    // Obligatorios
    val universidad: String,
    val carrera: String,

    // Opcionales
    val unidadAcademica: String? = null,
    val descripcion: String? = null,

    // Identidad visual — mutuamente excluyentes desde el front,
    // pero el back no valida exclusividad: si llegan los dos, logoUrl tiene prioridad
    // (el front ya lo controla; no tiene sentido duplicar esa lógica acá).
    val logoUrl: String? = null,
    val iconoPortal: String? = null,
    val colorPortal: String? = null,
    val tipoAcceso: String = "ABIERTO" 
)