package com.unsam.scholarium.dto

import com.unsam.scholarium.model.TipoAcceso

data class CambiarTipoAccesoRequest(
    val nuevoTipoAcceso: TipoAcceso,
    val motivo: String
)
