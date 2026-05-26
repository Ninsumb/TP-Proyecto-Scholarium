package com.unsam.scholarium.dto

import java.time.LocalDateTime

// PortalResponse: usado para la vista de detalle del portal (/portales/{id})
data class PortalResponse(
    var id: Long?,
    var universidad: String,
    var carrera: String,
    var unidadAcademica: String?,
    var descripcion: String?,
    var logoUrl: String?,
    var iconoPortal: String?,
    var colorPortal: String?,
    var cantidadMiembros: Int = 0,
    var cantidadMaterias: Int = 0,
    var cantidadMaterialPublicado: Int = 0,
    val rolUsuarioAutenticado: String?,
    var fechaRegistro: LocalDateTime,
    var activo: Boolean
)