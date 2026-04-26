package com.unsam.scholarium.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface CarpetaRepository : JpaRepository<Carpeta, UUID> {
    fun findByPortalId(portalId: UUID): List<Carpeta>
    fun findByCarpetaPadreId(carpetaPadreId: UUID): List<Carpeta>
    fun findByPortalIdAndCarpetaPadreId(portalId: UUID, carpetaPadreId: UUID): List<Carpeta>
}