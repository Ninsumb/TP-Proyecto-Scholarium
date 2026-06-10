package com.unsam.scholarium.dto

import com.unsam.scholarium.model.TipoVotacion
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size

data class CrearVotacionRequest(
    @field:NotNull(message = "El tipo de votación es obligatorio")
    val tipo: TipoVotacion?,

    @field:NotBlank(message = "El motivo es obligatorio")
    @field:Size(max = 2000, message = "El motivo no puede tener más de 2000 caracteres")
    val motivo: String?,

    /** ID de la entidad afectada (UUID, Long...) serializado como String. Puede ir null. */
    val entidadId: String? = null,

    /** JSON libre con contexto extra. */
    val metadatos: String? = null,
)