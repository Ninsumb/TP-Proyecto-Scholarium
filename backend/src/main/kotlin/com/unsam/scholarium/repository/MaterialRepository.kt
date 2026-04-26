package com.unsam.scholarium.repository

import com.unsam.scholarium.model.Material
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface MaterialRepository : JpaRepository<Material, UUID> {
    fun findByIdIn(ids: List<UUID>): List<Material>

    @Query("SELECT COUNT(m) FROM Material m WHERE m.materia.carpeta.portal.id = :portalId")
    fun countByPortalId(portalId: Long): Int
}