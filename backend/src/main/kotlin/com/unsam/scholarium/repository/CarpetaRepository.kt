package com.unsam.scholarium.repository

import com.unsam.scholarium.model.Carpeta
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface CarpetaRepository : JpaRepository<Carpeta, UUID> {
    fun findByNombre(nombre: String): List<Carpeta>
    fun findByPortalId(portalId: Long): List<Carpeta>
    fun findByCarpetaPadreId(carpetaPadreId: UUID): List<Carpeta>
    fun findByPortalIdAndCarpetaPadreId(portalId: Long, carpetaPadreId: UUID): List<Carpeta>
    fun findByPortalIdAndCarpetaPadreIdIsNull(portalId: Long): List<Carpeta>
}