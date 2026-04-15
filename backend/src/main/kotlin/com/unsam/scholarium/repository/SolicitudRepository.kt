package com.unsam.scholarium.repository

import com.unsam.scholarium.model.Estado
import com.unsam.scholarium.model.Solicitud
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository


@Repository
interface SolicitudRepository : JpaRepository<Solicitud, Long> {
    fun findByUsuarioId(usuarioId: Long): List<Solicitud>

    fun findByPortalId(portalId: Long): List<Solicitud>

    fun findByEstadoAndPortalId(estado: Estado, portalId: Long): List<Solicitud>
}