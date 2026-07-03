package com.unsam.scholarium.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class EditarTableroRequest(
    @field:NotBlank(message = "El nombre es obligatorio")
    @field:Size(max = 150)
    val nombre: String,

    @field:Size(max = 500)
    val descripcion: String? = null,
)