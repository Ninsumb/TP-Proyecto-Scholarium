package com.unsam.scholarium.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class CrearPostRequest(
    @field:NotBlank(message = "El título es obligatorio")
    @field:Size(max = 200, message = "El título no puede tener más de 200 caracteres")
    val titulo: String,

    @field:NotBlank(message = "El contenido es obligatorio")
    @field:Size(max = 5000, message = "El contenido no puede tener más de 5000 caracteres")
    val contenido: String
)