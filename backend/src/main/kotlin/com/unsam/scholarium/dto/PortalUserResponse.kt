package com.unsam.scholarium.dto

import com.unsam.scholarium.model.RolMembresia

data class PortalUserResponse(
    val id: Long,
    val universidad: String,
    val carrera: String,
    val rol: RolMembresia
)