package com.unsam.scholarium.repository

import com.unsam.scholarium.model.Foro
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface ForoRepository : JpaRepository<Foro, UUID> {

    fun findByPortalId(portalId: Long): List<Foro>

    @Query("""
        SELECT f FROM Foro f 
        JOIN FETCH f.etiqueta e
        WHERE f.portal.id = :portalId 
        AND (:etiquetaNombre IS NULL OR e.nombre = :etiquetaNombre)
        ORDER BY f.createdAt DESC
    """)
    fun findByPortalIdWithEtiqueta(
        @Param("portalId") portalId: Long,
        @Param("etiquetaNombre") etiquetaNombre: String?
    ): List<Foro>
}