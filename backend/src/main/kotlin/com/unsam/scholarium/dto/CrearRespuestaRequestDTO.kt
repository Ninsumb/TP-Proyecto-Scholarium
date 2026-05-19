package com.unsam.scholarium.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class CrearRespuestaRequest(
    @field:NotBlank(message = "El contenido es obligatorio")
    @field:Size(max = 5000, message = "El contenido no puede tener más de 5000 caracteres")
    val contenido: String
)