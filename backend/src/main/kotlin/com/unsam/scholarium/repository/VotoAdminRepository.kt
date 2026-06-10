package com.unsam.scholarium.repository

import com.unsam.scholarium.model.Usuario
import com.unsam.scholarium.model.VotacionAdmin
import com.unsam.scholarium.model.VotoAdmin
import org.springframework.data.jpa.repository.JpaRepository

interface VotoAdminRepository : JpaRepository<VotoAdmin, Long> {

    /** True si el admin ya votó esa votación (independiente del valor de `aprueba`). */
    fun existsByVotacionAndAdmin(votacion: VotacionAdmin, admin: Usuario): Boolean

    /** Cuenta votos a favor (aprueba=true) o en contra (aprueba=false). */
    fun countByVotacionAndAprueba(votacion: VotacionAdmin, aprueba: Boolean): Long

    /** Todos los votos de una votación, por si el front los necesita en el detalle. */
    fun findByVotacion(votacion: VotacionAdmin): List<VotoAdmin>
}