package com.unsam.scholarium.service

import com.unsam.scholarium.dto.NotificacionResponse
import com.unsam.scholarium.model.Notificacion
import com.unsam.scholarium.model.Portal
import com.unsam.scholarium.model.TipoNotificacion
import com.unsam.scholarium.model.Usuario
import com.unsam.scholarium.repository.NotificacionRepository
import com.unsam.scholarium.repository.UsuarioRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.*

@Service
class NotificacionService(
    private val notificacionRepository: NotificacionRepository,
    private val usuarioRepository: UsuarioRepository
) {

    fun crearNotificacion(
        usuario: Usuario,
        tipo: TipoNotificacion,
        titulo: String,
        descripcion: String,
        portal: Portal? = null,
        motivo: String? = null,
        entidadId: Long? = null,
        entidadTipo: String? = null
    ) {
        val notificacion = Notificacion(
            usuario = usuario,
            tipo = tipo,
            titulo = titulo,
            descripcion = descripcion,
            portal = portal,
            motivo = motivo,
            entidadId = entidadId,
            entidadTipo = entidadTipo
        )

        notificacionRepository.save(notificacion)
        notificacionRepository.flush()
    }

    fun getNotificaciones(email: String): List<NotificacionResponse> {
        val usuario = usuarioRepository.findByEmail(email)
            ?: throw IllegalArgumentException("Usuario no encontrado")

        return notificacionRepository.findByUsuarioOrderByFechaCreacionDesc(usuario)
            .map { toResponse(it) }
    }

    @Transactional
    fun marcarComoLeida(email: String, notificacionId: UUID) {
        val usuario = usuarioRepository.findByEmail(email)
            ?: throw IllegalArgumentException("Usuario no encontrado")

        val notificacion = notificacionRepository.findById(notificacionId)
            .orElseThrow { IllegalArgumentException("Notificación no encontrada") }

        if (notificacion.usuario.id != usuario.id) {
            throw IllegalArgumentException("No tienes permiso para modificar esta notificación")
        }

        notificacion.leida = true
        notificacionRepository.save(notificacion)
    }

    @Transactional
    fun marcarTodasComoLeidas(email: String) {
        val usuario = usuarioRepository.findByEmail(email)
            ?: throw IllegalArgumentException("Usuario no encontrado")

        val notificaciones = notificacionRepository.findByUsuarioAndLeidaFalseOrderByFechaCreacionDesc(usuario)
        notificaciones.forEach { it.leida = true }
        notificacionRepository.saveAll(notificaciones)
    }

    @Transactional
    fun eliminarNotificacion(email: String, notificacionId: UUID) {
        val usuario = usuarioRepository.findByEmail(email)
            ?: throw IllegalArgumentException("Usuario no encontrado")

        val notificacion = notificacionRepository.findById(notificacionId)
            .orElseThrow { IllegalArgumentException("Notificación no encontrada") }

        if (notificacion.usuario.id != usuario.id) {
            throw IllegalArgumentException("No tienes permiso para eliminar esta notificación")
        }

        notificacionRepository.delete(notificacion)
    }

    @Transactional
    fun eliminarTodasLeidas(email: String) {
        val usuario = usuarioRepository.findByEmail(email)
            ?: throw IllegalArgumentException("Usuario no encontrado")

        notificacionRepository.deleteByUsuarioAndLeidaTrue(usuario)
    }

    private fun toResponse(notificacion: Notificacion): NotificacionResponse {
        return NotificacionResponse(
            id = notificacion.id!!,
            tipo = notificacion.tipo,
            titulo = notificacion.titulo,
            descripcion = notificacion.descripcion,
            portalNombre = notificacion.portal?.carrera, //O COMO SEA !!!
            leida = notificacion.leida,
            fechaCreacion = notificacion.fechaCreacion,
            entidadId = notificacion.entidadId
        )
    }
}