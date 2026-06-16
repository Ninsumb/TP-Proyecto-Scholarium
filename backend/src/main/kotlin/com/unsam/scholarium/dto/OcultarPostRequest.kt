package com.unsam.scholarium.dto

import jakarta.validation.constraints.NotBlank

data class OcultarPostRequest(
    @field:NotBlank(message = "El motivo es obligatorio")
    val motivo: String,
)