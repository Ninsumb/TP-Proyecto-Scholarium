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
    fun findByUsuarioEmailAndPortalId(email: String, portalId: Long): Membresia?

    fun existsByUsuarioIdAndPortalId(usuarioId: Long, portalId: Long): Boolean

    fun existsByUsuarioIdAndPortalIdAndRol(usuarioId: Long, portalId: Long, rol: RolMembresia): Boolean

    fun existsByUsuarioAndPortalAndRol(
        usuario: Usuario,
        portal: Portal,
        rol: RolMembresia
    ): Boolean

    fun countByPortalId(portalId: Long): Int

    fun findByUsuarioOrderByFechaRegistroDesc(usuario: Usuario): List<Membresia>
    fun countByPortal(portal: Portal): Long

    /** Cuenta cuántos usuarios tienen el rol dado en el portal (ej. cuántos admins). */
    fun countByPortalAndRol(portal: Portal, rol: RolMembresia): Long

    /** Lista las membresías del portal con un rol específico (ej. todos los admins). */
    fun findByPortalAndRol(portal: Portal, rol: RolMembresia): List<Membresia>

    // ─────────────────────────────────────────────────────────────────────────────
// AGREGAR AL MembresiaRepository
// ─────────────────────────────────────────────────────────────────────────────

    // Spring Data JPA infiere la query automáticamente a partir del nombre.
// Devuelve todas las membresias de un portal (ADMIN y MIEMBRO).
    fun findAllByPortalId(portalId: Long): List<Membresia>

// Si la entidad Membresia tiene un campo `activo: Boolean`, podés filtrar así:
// fun findAllByPortalIdAndActivoIsTrue(portalId: Long): List<Membresia>
// Revisando el modelo: activo = true por defecto, así que ese filtro es recomendable
// si en algún momento las membresias se desactivan en lugar de eliminarse.
// Por ahora, con findAllByPortalId alcanza porque removerMiembro hace hard delete.
}