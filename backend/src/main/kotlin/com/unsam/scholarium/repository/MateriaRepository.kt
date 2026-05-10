package com.unsam.scholarium.repository

import com.unsam.scholarium.model.Materia
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface MateriaRepository : JpaRepository<Materia, Long> {
    fun findByCarpetaId(carpetaId: UUID): List<Materia>
}