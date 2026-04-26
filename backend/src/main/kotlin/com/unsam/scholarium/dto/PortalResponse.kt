package com.unsam.scholarium.dto

import java.time.LocalDateTime

data class PortalResponse(
    var id: Long?,
    var universidad: String,
    var carrera: String,
    var descripcion: String?,
    var logoUrl: String?,
    var cantidadMiembros: Int = 0,
    var cantidadMaterias: Int = 0,
    var cantidadMaterialPublicado: Int = 0,
    val rolUsuarioAutenticado: String?,
    var fechaRegistro: LocalDateTime,
    var activo: Boolean
)