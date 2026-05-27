package com.unsam.scholarium.repository

import com.unsam.scholarium.model.Carpeta
import com.unsam.scholarium.model.Portal
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface CarpetaRepository : JpaRepository<Carpeta, UUID> {
    fun findByNombre(nombre: String): List<Carpeta>
    fun findByPortalId(portalId: Long): List<Carpeta>
    fun findByCarpetaPadreId(carpetaPadreId: UUID): List<Carpeta>
    fun findByPortalIdAndCarpetaPadreId(portalId: Long, carpetaPadreId: UUID): List<Carpeta>
    fun findByPortalIdAndCarpetaPadreIdIsNull(portalId: Long): List<Carpeta>

    fun existsByCarpetaPadreId(carpetaPadreId: UUID): Boolean

    @Query("""
    SELECT DISTINCT c
    FROM Carpeta c
    LEFT JOIN FETCH c.carpetaPadre
    WHERE c.portal.id = :portalId
    ORDER BY c.orden ASC
""")
    fun findAllByPortalIdWithPadre(
        @Param("portalId") portalId: Long
    ): List<Carpeta>
}