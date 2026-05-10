package com.unsam.scholarium.repository

import com.unsam.scholarium.model.Foro
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ForoRepository : JpaRepository<Foro, Long> {
    fun findByMateriaId(materiaId: Long): Foro?
}