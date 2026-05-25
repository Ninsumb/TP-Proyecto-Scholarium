package com.unsam.scholarium.dto

data class PortalBusquedaDTO(
    val id: Long?,
    val universidad: String,
    val carrera: String,
    val descripcion: String?,
    val estudiantes: Int,
    val logoUrl: String?
)

data class PortalBusquedaResponse(
    val portales: List<PortalBusquedaDTO>,
    val page: Int,
    val total: Int
)