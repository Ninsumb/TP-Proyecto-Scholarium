package com.unsam.scholarium.dto

import com.unsam.scholarium.model.*

/*
data class ComentarioEnPostEvent(
    val post: Post,
    val comentario: Comentario,
    val autorComentario: Usuario
)
*/

data class SolicitudAprobadaEvent(
    val solicitud: Solicitud,
    val portal: Portal
)

data class SolicitudRechazadaEvent(
    val solicitud: Solicitud,
    val portal: Portal,
    val motivo: String
)

data class UsuarioExpulsadoEvent(
    val usuario: Usuario,
    val portal: Portal,
    val motivo: String // Ej: "Expulsado por bloqueo del portal" o motivo manual
)

/*
data class VotacionAbiertaEvent(
    val votacion: Votacion,
    val portal: Portal,
    val admins: List<Usuario> // notificar a todos los admins del portal
)

data class VotacionAprobadaEvent(
    val votacion: Votacion,
    val portal: Portal,
    val admins: List<Usuario>
)
*/

data class PostOcultadoEvent(
    val post: Post,
    val portal: Portal,
    val motivo: String
)