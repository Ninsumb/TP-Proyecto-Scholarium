package com.unsam.scholarium.repository

import com.unsam.scholarium.model.PlantillaSolicitud
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface PlantillaSolicitudRepository : JpaRepository<PlantillaSolicitud, Long> {
    fun findByPortalId(portalId: Long): PlantillaSolicitud?
}