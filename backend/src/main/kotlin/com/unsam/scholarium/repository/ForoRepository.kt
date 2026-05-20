package com.unsam.scholarium.repository

import com.unsam.scholarium.model.Tablero
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface ForoRepository : JpaRepository<Tablero, UUID> {

    fun findByPortalId(portalId: Long): List<Tablero>

    @Query("""
    SELECT t FROM Tablero t 
    JOIN FETCH t.etiqueta e
    WHERE t.portal.id = :portalId 
    AND (:etiquetaNombre IS NULL OR e.nombre = :etiquetaNombre)
    ORDER BY t.createdAt DESC
""")
    fun findByPortalIdWithEtiqueta(
        @Param("portalId") portalId: Long,
        @Param("etiquetaNombre") etiquetaNombre: String?
    ): List<Tablero>
}