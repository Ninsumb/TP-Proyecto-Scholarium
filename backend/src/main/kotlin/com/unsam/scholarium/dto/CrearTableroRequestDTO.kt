package com.unsam.scholarium.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class CrearTableroRequest(
    @field:NotBlank(message = "El nombre del tablero es obligatorio")
    @field:Size(max = 150, message = "El nombre no puede tener más de 150 caracteres")
    val nombre: String,

    @field:NotBlank(message = "La etiqueta es obligatoria")
    @field:Size(max = 30, message = "La etiqueta no puede tener más de 30 caracteres")
    val etiqueta: String,

    @field:Size(max = 500, message = "La descripción no puede tener más de 500 caracteres")
    val descripcion: String? = null
)