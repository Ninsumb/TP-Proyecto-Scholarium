package com.unsam.scholarium.dto

data class ActualizarMateriaRequest(
    val nombre: String,
    val descripcion: String? = null,
)