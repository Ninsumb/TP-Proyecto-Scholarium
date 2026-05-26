package com.unsam.scholarium.dto

// PortalBusquedaDTO: usado para las cards en la vista de búsqueda (/portales/buscar)
data class PortalBusquedaDTO(
    val id: Long?,
    val universidad: String,
    val carrera: String,
    val unidadAcademica: String?,
    val descripcion: String?,
    val estudiantes: Int,
    // Identidad visual
    val logoUrl: String?,
    val iconoPortal: String?,
    val colorPortal: String?,
)

data class PortalBusquedaResponse(
    val portales: List<PortalBusquedaDTO>,
    val page: Int,
    val total: Int
)