package com.unsam.scholarium.dto

import com.unsam.scholarium.model.*

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

data class VotacionAbiertaEvent(
    val votacion: VotacionAdmin,
    val portal: Portal,
    val proponente: Usuario
)

data class VotacionAprobadaEvent(
    val votacion: VotacionAdmin,
    val portal: Portal,
    val proponente: Usuario
)

data class VotacionRechazadaEvent(
    val votacion: VotacionAdmin,
    val portal: Portal,
    val proponente: Usuario
)

data class MaterialAceptadoEvent(
    val material: Material,
    val portal: Portal
)

data class MaterialRechazadoEvent(
    val material: Material,
    val portal: Portal,
    val motivo: String
)

data class PostOcultadoEvent(
    val post: Post,
    val portal: Portal,
    val motivo: String
)