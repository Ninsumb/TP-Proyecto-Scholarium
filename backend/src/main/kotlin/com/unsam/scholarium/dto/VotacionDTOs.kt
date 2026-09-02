package com.unsam.scholarium.dto

import com.unsam.scholarium.model.EstadoVotacion
import com.unsam.scholarium.model.TipoVotacion
import com.unsam.scholarium.model.VotacionAdmin
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.time.LocalDateTime

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

data class VotarRequest(
    @field:NotNull(message = "El campo 'aprueba' es obligatorio")
    val aprueba: Boolean?,
)

data class VotacionResponse(
    val id: Long,
    val portalId: Long,
    val tipo: TipoVotacion,
    val proponenteId: Long,
    val proponenteEmail: String,
    val proponenteNombre: String,
    val motivo: String,
    val estado: EstadoVotacion,
    val entidadId: String?,
    val metadatos: String?,
    val creadaEn: LocalDateTime,
    val resueltaEn: LocalDateTime?,
    val expiraEn: LocalDateTime,
    val votosAFavor: Long,
    val votosEnContra: Long,
    val totalAdmins: Long,
    val usuarioYaVoto: Boolean? = null,
) {
    companion object {
        fun fromEntity(
            v: VotacionAdmin,
            votosAFavor: Long,
            votosEnContra: Long,
            totalAdmins: Long,
            usuarioYaVoto: Boolean,
        ): VotacionResponse = VotacionResponse(
            id = v.id!!,
            portalId = v.portal.id!!,
            tipo = v.tipo,
            proponenteId = v.proponente.id!!,
            proponenteEmail = v.proponente.email,
            proponenteNombre = v.proponente.nombre,
            motivo = v.motivo,
            estado = v.estado,
            entidadId = v.entidadId,
            metadatos = v.metadatos,
            creadaEn = v.creadaEn,
            resueltaEn = v.resueltaEn,
            expiraEn = v.expiraEn,
            votosAFavor = votosAFavor,
            votosEnContra = votosEnContra,
            totalAdmins = totalAdmins,
            usuarioYaVoto = usuarioYaVoto
        )
    }
}
