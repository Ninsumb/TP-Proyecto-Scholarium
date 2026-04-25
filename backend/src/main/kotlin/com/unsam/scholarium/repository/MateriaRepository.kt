package com.unsam.scholarium.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface MateriaRepository : JpaRepository<Materia, Long> {
    fun findByCarpetaId(carpetaId: UUID): List<Materia>
}