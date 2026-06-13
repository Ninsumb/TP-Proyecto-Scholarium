// dto/PuedeSolicitarResponse.kt
package com.unsam.scholarium.dto

data class PuedeSolicitarResponse(
    val puede: Boolean,
    val motivo: String? // "BLOQUEADO" | "YA_MIEMBRO" | "PENDIENTE" | null
)