package com.unsam.scholarium.dto

import com.unsam.scholarium.model.EstadoVotacion
import com.unsam.scholarium.model.TipoVotacion
import com.unsam.scholarium.model.VotacionAdmin
import java.time.LocalDateTime

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
) {
    companion object {
        fun fromEntity(
            v: VotacionAdmin,
            votosAFavor: Long,
            votosEnContra: Long,
            totalAdmins: Long,
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
        )
    }
}