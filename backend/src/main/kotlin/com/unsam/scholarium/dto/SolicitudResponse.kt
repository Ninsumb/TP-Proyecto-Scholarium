package com.unsam.scholarium.dto

data class SolicitudResponse (
    val id: Long,
    val usuario: UsuarioResumenDTO,
    val fechaCreacion: String,
)

data class UsuarioResumenDTO(
    val id: Long,
    val nombre: String,
    val email: String
)