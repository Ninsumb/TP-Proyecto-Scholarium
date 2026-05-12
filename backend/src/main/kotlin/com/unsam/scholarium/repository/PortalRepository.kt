package com.unsam.scholarium.repository

import com.unsam.scholarium.model.Portal
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface PortalRepository : JpaRepository<Portal, Long> {
    fun existsByUniversidadAndCarrera(universidad: String, carrera: String): Boolean
    fun findByUniversidad(universidad: String): List<Portal>

    @EntityGraph(attributePaths = ["membresias"])
    @Query("""
    SELECT p FROM Portal p
    WHERE (:universidad IS NULL OR LOWER(p.universidad) LIKE LOWER(CONCAT('%', CAST(:universidad AS string), '%')))
    AND (:carrera IS NULL OR LOWER(p.carrera) LIKE LOWER(CONCAT('%', CAST(:carrera AS string), '%')))
""")
    fun buscarPortales(
        @Param("universidad") universidad: String?,
        @Param("carrera") carrera: String?
    ): List<Portal>
}