package com.unsam.scholarium.dto

import com.unsam.scholarium.model.TipoMaterial
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class EditarMaterialRequest(
    @field:NotBlank(message = "El nombre no puede estar vacío")
    @field:Size(max = 150, message = "El nombre no puede superar los 150 caracteres")
    val nombre: String,

    @field:Size(max = 1000, message = "La descripción no puede superar los 1000 caracteres")
    val descripcion: String?,

    val tipo: TipoMaterial
)
