package com.unsam.scholarium.dto

import com.unsam.scholarium.model.RolMembresia

data class MembresiaResponse(
    val membresiaId: Long,
    val usuarioId: Long,
    val portalId: Long,
    val rol: RolMembresia
)