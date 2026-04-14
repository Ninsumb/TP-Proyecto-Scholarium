package com.unsam.scholarium.repository

import com.unsam.scholarium.model.Membresia
import com.unsam.scholarium.model.RolMembresia
import org.springframework.data.jpa.repository.JpaRepository

interface MembresiaRepository : JpaRepository<Membresia, Long> {
    fun findByUsuarioIdAndPortalId(usuarioId: Long, portalId: Long): Membresia?
    fun findByUsuarioId(usuarioId: Long): List<Membresia>
    fun existsByUsuarioIdAndPortalIdAndRol(uId: Long, pId: Long, rol: RolMembresia): Boolean
}