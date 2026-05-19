package com.unsam.scholarium.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class RechazarMaterialRequest(
    @field:NotBlank(message = "El motivo de rechazo no puede estar vacío")
    @field:Size(min = 10, max = 500, message = "El motivo debe tener entre 10 y 500 caracteres")
    val motivoRechazo: String
)
