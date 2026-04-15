package com.unsam.scholarium.dto

import java.time.LocalDateTime

data class PortalResponse(
    var id: Long?,
    var universidad: String,
    var carrera: String,
    var descripcion: String?,
    var membresias: Int,
    var fechaRegistro: LocalDateTime,
    var activo: Boolean
)