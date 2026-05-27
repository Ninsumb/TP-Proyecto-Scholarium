package com.unsam.scholarium.repository

import com.unsam.scholarium.model.Portal
import com.unsam.scholarium.model.PortalBloqueo
import com.unsam.scholarium.model.Usuario
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface PortalBloqueoRepository : JpaRepository<PortalBloqueo, Long> {
    fun existsByPortalAndUsuario(portal: Portal, usuario: Usuario): Boolean
    fun findByPortalAndUsuario(portal: Portal, usuario: Usuario): PortalBloqueo?
    fun findAllByPortalId(portalId: Long): List<PortalBloqueo>
}