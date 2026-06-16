package com.unsam.scholarium.listener

import com.unsam.scholarium.dto.MaterialAceptadoEvent
import com.unsam.scholarium.dto.MaterialRechazadoEvent
import com.unsam.scholarium.dto.PostOcultadoEvent
import com.unsam.scholarium.dto.SolicitudAprobadaEvent
import com.unsam.scholarium.dto.SolicitudRechazadaEvent
import com.unsam.scholarium.dto.UsuarioExpulsadoEvent
import com.unsam.scholarium.dto.VotacionAbiertaEvent
import com.unsam.scholarium.dto.VotacionAprobadaEvent
import com.unsam.scholarium.dto.VotacionRechazadaEvent
import com.unsam.scholarium.model.Portal
import com.unsam.scholarium.model.RolMembresia
import com.unsam.scholarium.model.TipoNotificacion
import com.unsam.scholarium.model.Usuario
import com.unsam.scholarium.repository.MembresiaRepository
import com.unsam.scholarium.service.NotificacionService
import com.unsam.scholarium.service.PortalService
import com.unsam.scholarium.service.UsuarioService
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class NotificacionEventListener(
    private val notificacionService: NotificacionService,
    private val portalService: PortalService,
    private val membresiaRepository: MembresiaRepository,
) {

    /*
    @TransactionalEventListener(phase = TransactionPhase.BEFORE_COMMIT)
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
            entidadTipo = "SOLICITUD"
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
            entidadTipo = "SOLICITUD"
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
            entidadTipo = "USUARIO"
        )
    }


    @TransactionalEventListener(phase = TransactionPhase.BEFORE_COMMIT)
    fun onVotacionAbierta(event: VotacionAbiertaEvent) {
        var admins = obtenerAdmins(event.portal)

        // Notificar a TODOS los admins del portal
        admins.forEach { admin ->
            notificacionService.crearNotificacion(
                usuario = admin,
                tipo = TipoNotificacion.VOTACION_ABIERTA,
                titulo = "Nueva votación abierta",
                descripcion = "Se abrió una votación en el portal \"${event.portal.carrera}\": \"${event.votacion.tipo}\".",
                portal = event.portal,
                entidadId = event.votacion.id,
                entidadTipo = "VOTACION"
            )
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.BEFORE_COMMIT)
    fun onVotacionAprobada(event: VotacionAprobadaEvent) {
        var admins = obtenerAdmins(event.portal)

        admins.forEach { admin ->
            notificacionService.crearNotificacion(
                usuario = admin,
                tipo = TipoNotificacion.VOTACION_APROBADA,
                titulo = "Votación aprobada",
                descripcion = "La votación \"${event.votacion.tipo}\" \"${event.votacion.metadatos}\" en el portal \"${event.portal.carrera}\" fue aprobada.",
                portal = event.portal,
                entidadId = event.votacion.id,
                entidadTipo = "VOTACION"
            )
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.BEFORE_COMMIT)
    fun onVotacionRechazada(event: VotacionRechazadaEvent) {
        var admins = obtenerAdmins(event.portal)

        admins.forEach { admin ->
            notificacionService.crearNotificacion(
                usuario = admin,
                tipo = TipoNotificacion.VOTACION_RECHAZADA,
                titulo = "Votación rechazada",
                descripcion = "La votación \"${event.votacion.tipo}\" \"${event.votacion.metadatos}\" en el portal \"${event.portal.carrera}\" fue rechazada.",
                portal = event.portal,
                entidadId = event.votacion.id,
                entidadTipo = "VOTACION"
            )
        }
    }

    fun obtenerAdmins(portal: Portal): List<Usuario> {
        return membresiaRepository.findByPortalAndRol(
            portal = portal,
            rol = RolMembresia.ADMIN
        ).map {m -> m.usuario }
    }

    @TransactionalEventListener(phase = TransactionPhase.BEFORE_COMMIT)
    fun onPostOcultado(event: PostOcultadoEvent) {
        notificacionService.crearNotificacion(
            usuario = event.post.autor,
            tipo = TipoNotificacion.POST_OCULTADO,
            titulo = "Tu post fue ocultado",
            descripcion = "Un administrador marcó tu post \"${event.post.titulo}\" como inapropiado en el portal \"${event.portal.carrera}\".",
            portal = event.portal,
            motivo = event.motivo,
            entidadId = null, //Hay que ver que onda los IDs
            entidadTipo = "POST"
        )
    }

    @TransactionalEventListener(phase = TransactionPhase.BEFORE_COMMIT)
    fun onMaterialAceptado(event: MaterialAceptadoEvent) {
        notificacionService.crearNotificacion(
            usuario = event.material.usuario,
            tipo = TipoNotificacion.MATERIAL_APROBADO,
            titulo = "Material Aceptado",
            descripcion = "El material \"${event.material.descripcion}\" fue aceptado.",
            portal = event.portal,
            entidadId = null, //Hay que ver que onda los IDs
            entidadTipo = "MATERIAL_ACEPTADO"
        )
    }

    @TransactionalEventListener(phase = TransactionPhase.BEFORE_COMMIT)
    fun onMaterialRechazado(event: MaterialRechazadoEvent) {
        notificacionService.crearNotificacion(
            usuario = event.material.usuario,
            tipo = TipoNotificacion.MATERIAL_RECHAZADO,
            titulo = "Material Rechazado",
            descripcion = "El material \"${event.material.descripcion}\" fue rechazado. Motivo: ${event.material.motivoRechazo}",
            portal = event.portal,
            motivo = event.material.motivoRechazo,
            entidadId = null, //Hay que ver que onda los IDs
            entidadTipo = "MATERIAL_RECHAZADO"
        )
    }
}