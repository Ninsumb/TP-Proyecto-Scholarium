// src/main/kotlin/com/unsam/scholarium/repository/AccionAdminRepository.kt
package com.unsam.scholarium.repository

import com.unsam.scholarium.model.AccionAdmin
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface AccionAdminRepository : JpaRepository<AccionAdmin, Long> {

    /** Historial cronológico inverso de un portal, paginado. */
    @Query("""
        SELECT a FROM AccionAdmin a
        JOIN FETCH a.admin
        WHERE a.portal.id = :portalId
        ORDER BY a.createdAt DESC
    """)
    fun findByPortalId(portalId: Long, pageable: Pageable): Page<AccionAdmin>
}