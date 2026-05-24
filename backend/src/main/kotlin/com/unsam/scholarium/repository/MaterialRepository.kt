package com.unsam.scholarium.repository

import com.unsam.scholarium.model.EstadoMaterial
import com.unsam.scholarium.model.Material
import com.unsam.scholarium.model.TipoMaterial
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface MaterialRepository : JpaRepository<Material, UUID> {
    fun findByIdIn(ids: List<UUID>): List<Material>

    @Query("SELECT COUNT(m) FROM Material m WHERE m.materia.carpeta.portal.id = :portalId")
    fun countByPortalId(portalId: Long): Int
    fun tipo(tipo: TipoMaterial): MutableList<Material>

    fun findByMateriaIdAndEstadoOrderByCreatedAtDesc(
        materiaId: UUID,
        estado: EstadoMaterial
    ): List<Material>

    @Query("""
    SELECT mat
    FROM Material mat
    JOIN FETCH mat.materia m
    JOIN FETCH m.carpeta c
    JOIN FETCH c.portal p
    JOIN FETCH mat.usuario u
    WHERE p.id = :portalId
    AND mat.estado = com.unsam.scholarium.model.EstadoMaterial.PENDIENTE
""")
    fun findPendientesByPortalId(
        @Param("portalId") portalId: Long
    ): List<Material>

    @Query("SELECT COUNT(m) FROM Material m WHERE m.usuario.id = :usuarioId")
    fun countByUsuarioId(usuarioId: Long): Long
}