package com.unsam.scholarium.repository

import com.unsam.scholarium.model.Foro
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface ForoRepository : JpaRepository<Foro, UUID> {
    fun findByMateriaId(materiaId: UUID): Foro?
}