package com.unsam.scholarium.dto

data class PortalBusquedaResponse(
    val id: Long?,
    val universidad: String,
    val carrera: String,
    val descripcion: String?,
    val cantidadMiembros: Int
)
