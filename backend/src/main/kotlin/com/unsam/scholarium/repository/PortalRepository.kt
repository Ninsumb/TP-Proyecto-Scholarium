package com.unsam.scholarium.repository

import com.unsam.scholarium.model.Portal
import org.springframework.data.jpa.repository.JpaRepository

interface PortalRepository : JpaRepository<Portal, Long> {
    fun existsByUniversidadAndCarrera(universidad: String, carrera: String): Boolean
    fun findByUniversidad(universidad: String): List<Portal>
}