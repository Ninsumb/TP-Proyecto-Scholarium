package com.unsam.scholarium.repository

import com.unsam.scholarium.model.Estado
import com.unsam.scholarium.model.Portal
import com.unsam.scholarium.model.Solicitud
import com.unsam.scholarium.model.Usuario
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository


@Repository
interface SolicitudRepository : JpaRepository<Solicitud, Long> {
    fun findByUsuarioId(usuarioId: Long): List<Solicitud>
    fun findByPortalId(portalId: Long): List<Solicitud>
    fun findByEstadoAndPortalId(estado: Estado, portalId: Long): List<Solicitud>
    fun findAllByEstadoAndPortalId(
        estado: Estado,
        portalId: Long
    ): List<Solicitud>
    fun existsByUsuarioAndPortalAndEstado(usuario: Usuario, portal: Portal, estado: Estado): Boolean
}