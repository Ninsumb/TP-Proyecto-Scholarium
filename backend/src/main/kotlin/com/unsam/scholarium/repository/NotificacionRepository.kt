package com.unsam.scholarium.repository

import com.unsam.scholarium.model.Notificacion
import com.unsam.scholarium.model.Usuario
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface NotificacionRepository : JpaRepository<Notificacion, UUID> {
    fun findByUsuarioOrderByFechaCreacionDesc(usuario: Usuario): List<Notificacion>
    fun findByUsuarioAndLeidaFalseOrderByFechaCreacionDesc(usuario: Usuario): List<Notificacion>
    fun deleteByUsuario(usuario: Usuario)
    fun deleteByUsuarioAndLeidaTrue(usuario: Usuario)
}