package com.unsam.scholarium.dto

data class DenunciaPortalRequest(
    val motivo: String,
    val comentarios: String? = null
)