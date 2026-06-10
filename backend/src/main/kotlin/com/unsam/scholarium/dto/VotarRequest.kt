package com.unsam.scholarium.dto

import jakarta.validation.constraints.NotNull

data class VotarRequest(
    @field:NotNull(message = "El campo 'aprueba' es obligatorio")
    val aprueba: Boolean?,
)