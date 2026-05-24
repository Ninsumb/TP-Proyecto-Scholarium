package com.unsam.scholarium.dto

import java.time.LocalDateTime

data class UsuarioMeResponse(
    val id: Long,
    val nombre: String,
    val email: String,
    val bio: String?,
    val fotoPerfil: String?,
    val createdAt: LocalDateTime,
    val cantidadPortales: Int,
    val cantidadMaterialSubido: Long
)
