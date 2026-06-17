package com.unsam.scholarium.dto

import com.unsam.scholarium.model.RolMembresia
import java.util.UUID

data class UsuarioPortalResponse(
    val id: Long,
    val universidad: String,
    val carrera: String,
    val descripcion: String?,
    val logoUrl: String?,
    val iconoPortal: String?,
    val colorPortal: String?,
    val rol: RolMembresia,
    val cantidadMiembros: Long,
    val cantidadMaterias: Long
)
