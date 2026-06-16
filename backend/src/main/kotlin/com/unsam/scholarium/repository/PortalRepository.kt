package com.unsam.scholarium.repository

import com.unsam.scholarium.model.Portal
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface PortalRepository : JpaRepository<Portal, Long> {

    /**
     * Validación de unicidad por valores YA normalizados.
     * El service llama a Portal.normalizarParaUnicidad() antes de invocar este método,
     * entonces los parámetros que llegan acá ya están en minúscula y sin tildes.
     * La query solo necesita comparación exacta (no LOWER adicional).
     *
     * IMPORTANTE: este método reemplaza al antiguo existsByUniversidadAndCarrera.
     * Asegurate de que el nombre viejo NO exista en este archivo, porque Spring
     * lo resolvería automáticamente con exact match e ignoraría la normalización.
     */
    @Query("""
        SELECT COUNT(p) > 0 FROM Portal p
        WHERE p.universidadNormalizada = :universidadNorm
        AND p.carreraNormalizada = :carreraNorm
        AND p.activo = true
    """)
    fun existePortalConValoresNormalizados(
        @Param("universidadNorm") universidadNorm: String,
        @Param("carreraNorm") carreraNorm: String
    ): Boolean

    fun findByUniversidad(universidad: String): List<Portal>

    @EntityGraph(attributePaths = ["membresias"])
    @Query("""
        SELECT p FROM Portal p
        WHERE (:universidad IS NULL OR LOWER(p.universidad) LIKE LOWER(CONCAT('%', CAST(:universidad AS string), '%')))
        AND (:carrera IS NULL OR LOWER(p.carrera) LIKE LOWER(CONCAT('%', CAST(:carrera AS string), '%')))
        AND p.activo = true
    """)
    fun buscarPortales(
        @Param("universidad") universidad: String?,
        @Param("carrera") carrera: String?,
        pageable: Pageable
    ): Page<Portal>
}