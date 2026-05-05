package com.unsam.scholarium.repository

import com.unsam.scholarium.model.Materia
import com.unsam.scholarium.model.Portal
import java.util.UUID
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface MateriaRepository : JpaRepository<Materia, UUID> {
    fun findByCarpetaId(carpetaId: UUID): List<Materia>

    @Query("""
    SELECT COUNT(m)
    FROM Materia m
    WHERE m.carpeta.portal = :portal
""")
    fun countByPortal(@Param("portal") portal: Portal): Long

    fun existsByCarpetaId(carpetaId: UUID): Boolean


    @Query("SELECT COUNT(m) FROM Materia m WHERE m.carpeta.portal.id = :portalId")
    fun countByPortalId(portalId: Long): Int
}