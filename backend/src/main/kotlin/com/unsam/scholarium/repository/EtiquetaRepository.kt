package com.unsam.scholarium.repository

import com.unsam.scholarium.model.Etiqueta
import com.unsam.scholarium.model.Portal
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface EtiquetaRepository : JpaRepository<Etiqueta, UUID> {
    fun findByNombreAndPortal(nombre: String, portal: Portal): Etiqueta?
    fun findByPortalId(portalId: Long): List<Etiqueta>
}