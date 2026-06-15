package com.unsam.scholarium.listener

import com.unsam.scholarium.dto.PostOcultadoEvent
import com.unsam.scholarium.dto.SolicitudAprobadaEvent
import com.unsam.scholarium.dto.SolicitudRechazadaEvent
import com.unsam.scholarium.dto.UsuarioExpulsadoEvent
import com.unsam.scholarium.model.TipoNotificacion
import com.unsam.scholarium.service.NotificacionService
import org.springframework.stereotype.Component
import org.springframework.transaction.PlatformTransactionManager
import org.springframework.transaction.annotation.Transactional
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener
import org.springframework.transaction.support.TransactionSynchronizationManager
import org.springframework.transaction.support.TransactionTemplate

@Component
class NotificacionEventListener(
    private val notificacionService: NotificacionService
) {

    /*
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    fun onComentarioEnPost(event: ComentarioEnPostEvent) {
        notificacionService.crearNotificacion(
            usuario = event.post.autor,
            tipo = TipoNotificacion.COMENTARIO_POST,
            titulo = "Nuevo comentario en tu post",
            descripcion = "${event.autorComentario.nombre} comentó en tu post \"${event.post.titulo}\"",
            portal = event.portal,
            entidadId = event.post.id,
            entidadTipo = "POST"
        )
    }
     */

    @TransactionalEventListener(phase = TransactionPhase.BEFORE_COMMIT)
    fun onSolicitudAprobada(event: SolicitudAprobadaEvent) {
        notificacionService.crearNotificacion(
            usuario = event.solicitud.usuario,
            tipo = TipoNotificacion.SOLICITUD_APROBADA,
            titulo = "Solicitud aprobada",
            descripcion = "Tu solicitud al portal \"${event.portal.carrera}\" fue aprobada.",
            portal = event.portal,
            entidadId = event.solicitud.id,
            entidadTipo = "SOLICITUD_APROBADA"
        )
    }

    @TransactionalEventListener(phase = TransactionPhase.BEFORE_COMMIT)
    fun onSolicitudRechazada(event: SolicitudRechazadaEvent) {
        notificacionService.crearNotificacion(
            usuario = event.solicitud.usuario,
            tipo = TipoNotificacion.SOLICITUD_RECHAZADA,
            titulo = "Solicitud rechazada",
            descripcion = "Tu solicitud al portal \"${event.portal.carrera}\" fue rechazada.",
            portal = event.portal,
            motivo = event.motivo,
            entidadId = event.solicitud.id,
            entidadTipo = "SOLICITUD_RECHAZADA"
        )
    }

    @TransactionalEventListener(phase = TransactionPhase.BEFORE_COMMIT)
    fun onUsuarioExpulsado(event: UsuarioExpulsadoEvent) {
        notificacionService.crearNotificacion(
            usuario = event.usuario,
            tipo = TipoNotificacion.EXPULSION,
            titulo = "Fuiste expulsado de un portal",
            descripcion = "Fuiste expulsado del portal \"${event.portal.carrera}\".",
            portal = event.portal,
            motivo = event.motivo,
            entidadTipo = "USUARIO_EXPULSADO"
        )
    }

    /*
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    fun onVotacionAbierta(event: VotacionAbiertaEvent) {
        // Notificar a TODOS los admins del portal
        event.admins.forEach { admin ->
            notificacionService.crearNotificacion(
                usuario = admin,
                tipo = TipoNotificacion.VOTACION_ABIERTA,
                titulo = "Nueva votación abierta",
                descripcion = "Se abrió una votación en el portal \"${event.portal.nombre}\": \"${event.votacion.titulo}\".",
                portal = event.portal,
                entidadId = event.votacion.id,
                entidadTipo = "VOTACION"
            )
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    fun onVotacionAprobada(event: VotacionAprobadaEvent) {
        event.admins.forEach { admin ->
            notificacionService.crearNotificacion(
                usuario = admin,
                tipo = TipoNotificacion.VOTACION_APROBADA,
                titulo = "Votación aprobada",
                descripcion = "La votación \"${event.votacion.titulo}\" en el portal \"${event.portal.nombre}\" fue aprobada.",
                portal = event.portal,
                entidadId = event.votacion.id,
                entidadTipo = "VOTACION"
            )
        }
    }
     */

    /*
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    fun onPostOcultado(event: PostOcultadoEvent) {
        notificacionService.crearNotificacion(
            usuario = event.post.autor,
            tipo = TipoNotificacion.POST_OCULTADO,
            titulo = "Tu post fue ocultado",
            descripcion = "Un administrador marcó tu post \"${event.post.titulo}\" como inapropiado en el portal \"${event.portal.nombre}\".",
            portal = event.portal,
            motivo = event.motivo,
            entidadId = event.post.id,
            entidadTipo = "POST"
        )
    }
     */
}