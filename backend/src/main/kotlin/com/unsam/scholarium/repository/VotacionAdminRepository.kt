package com.unsam.scholarium.repository

import com.unsam.scholarium.model.EstadoVotacion
import com.unsam.scholarium.model.TipoVotacion
import com.unsam.scholarium.model.VotacionAdmin
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository

interface VotacionAdminRepository : JpaRepository<VotacionAdmin, Long> {

    /** Votaciones del portal en un estado específico (ej. ABIERTA). Orden: más recientes primero. */
    fun findByPortalIdAndEstadoOrderByCreadaEnDesc(
        portalId: Long,
        estado: EstadoVotacion,
    ): List<VotacionAdmin>

    /** Historial paginado del portal (todos los estados terminales). */
    fun findByPortalIdAndEstadoInOrderByCreadaEnDesc(
        portalId: Long,
        estados: List<EstadoVotacion>,
        pageable: Pageable,
    ): Page<VotacionAdmin>

    /**
     * Busca si ya existe una votación ABIERTA del mismo tipo sobre la misma entidad en el portal.
     * Lo usa la validación "no se puede crear duplicada".
     * `entidadId` puede ser null (para tipos que no aplican sobre una entidad puntual).
     */
    fun findFirstByPortalIdAndTipoAndEstadoAndEntidadId(
        portalId: Long,
        tipo: TipoVotacion,
        estado: EstadoVotacion,
        entidadId: String?,
    ): VotacionAdmin?

    /** Todas las votaciones ABIERTAS (para el barrido perezoso de expiración). */
    fun findAllByEstado(estado: EstadoVotacion): List<VotacionAdmin>
}