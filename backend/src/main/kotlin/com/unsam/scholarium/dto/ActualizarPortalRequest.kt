package com.unsam.scholarium.dto

import com.unsam.scholarium.model.TipoAcceso

/**
 * Request para actualizar los campos de identidad y visual del portal
 * que NO requieren votación: unidadAcademica, descripcion, iconoPortal, colorPortal, logoUrl.
 *
 * Universidad y carrera NO están acá porque esos campos requieren votación de admins
 * y se manejan por el sistema de VotacionAdmin (tipo CAMBIO_INFO_PORTAL).
 */
data class ActualizarPortalRequest(
    val unidadAcademica: String?,
    val descripcion: String?,
    val iconoPortal: String?,
    val colorPortal: String?,
    val logoUrl: String?,
    val tipoAcceso: TipoAcceso? = null,
)