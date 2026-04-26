package com.unsam.scholarium.repository

import com.unsam.scholarium.model.Membresia
import com.unsam.scholarium.model.Portal
import com.unsam.scholarium.model.RolMembresia
import com.unsam.scholarium.model.Usuario
import org.springframework.data.jpa.repository.JpaRepository

interface MembresiaRepository : JpaRepository<Membresia, Long> {
    fun findByUsuarioIdAndPortalId(usuarioId: Long, portalId: Long): Membresia?
    fun findByUsuarioId(usuarioId: Long): List<Membresia>
    fun findAllByUsuarioEmail(email: String): List<Membresia>

    fun existsByUsuarioIdAndPortalId(usuarioId: Long, portalId: Long): Boolean

    fun existsByUsuarioIdAndPortalIdAndRol(usuarioId: Long, portalId: Long, rol: RolMembresia): Boolean

    fun countByPortalId(portalId: Long): Int
}