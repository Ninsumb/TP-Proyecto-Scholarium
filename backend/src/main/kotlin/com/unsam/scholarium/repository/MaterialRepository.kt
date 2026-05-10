package com.unsam.scholarium.repository

import com.unsam.scholarium.model.Material
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository


@Repository
interface MaterialRepository : JpaRepository<Material, Long> {
    fun findByMateriaId(materiaId: Long): List<Material>
}