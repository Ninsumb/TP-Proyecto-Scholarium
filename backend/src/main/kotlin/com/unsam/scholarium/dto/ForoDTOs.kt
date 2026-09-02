package com.unsam.scholarium.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.Instant
import java.util.UUID

data class TableroResponse(
    val id: UUID,
    val nombre: String,
    val descripcion: String?,
    val etiqueta: EtiquetaSimpleResponse,
    val createdAt: Instant,
    val updatedAt: Instant?
)

data class EtiquetaSimpleResponse(
    val id: UUID,
    val nombre: String
)


data class ObtenerTablerosRequest(
    val portalId: Long,
    val etiquetaNombre: String? = null
)

//TODO: acá podría ir una posible imagen de perfil, no?
data class AutorDTO(
    val id: Long,
    val nombre: String,
    val fotoPerfil: String?
)

data class PostResponse(
    val id: UUID,
    val titulo: String?,
    val contenido: String?,
    val tableroId: UUID,
    val autor: AutorDTO?,
    val postPadreId: UUID?,
    val cantidadRespuestas: Long,
    val eliminado: Boolean,
    val ocultado: Boolean,           // NUEVO
    val ocultadoMotivo: String?,     // NUEVO — solo se puebla para admins
    val createdAt: Instant,
    val updatedAt: Instant,
)

data class CrearPostRequest(
    @field:NotBlank(message = "El título es obligatorio")
    @field:Size(max = 200, message = "El título no puede tener más de 200 caracteres")
    val titulo: String,

    @field:NotBlank(message = "El contenido es obligatorio")
    @field:Size(max = 5000, message = "El contenido no puede tener más de 5000 caracteres")
    val contenido: String
)

data class CrearRespuestaRequest(
    @field:NotBlank(message = "El contenido es obligatorio")
    @field:Size(max = 5000, message = "El contenido no puede tener más de 5000 caracteres")
    val contenido: String
)

data class CrearTableroRequest(
    @field:NotBlank(message = "El nombre del tablero es obligatorio")
    @field:Size(max = 150, message = "El nombre no puede tener más de 150 caracteres")
    val nombre: String,

    @field:NotBlank(message = "La etiqueta es obligatoria")
    @field:Size(max = 30, message = "La etiqueta no puede tener más de 30 caracteres")
    val etiqueta: String,

    @field:Size(max = 500, message = "La descripción no puede tener más de 500 caracteres")
    val descripcion: String? = null
)

data class EditarPostRequest(
    @field:Size(max = 200, message = "El título no puede tener más de 200 caracteres")
    val titulo: String? = null,

    @field:NotBlank(message = "El contenido es obligatorio")
    @field:Size(max = 5000, message = "El contenido no puede tener más de 5000 caracteres")
    val contenido: String
)

data class EditarTableroRequest(
    @field:NotBlank(message = "El nombre es obligatorio")
    @field:Size(max = 150)
    val nombre: String,

    @field:Size(max = 500)
    val descripcion: String? = null,
)

data class OcultarPostRequest(
    @field:NotBlank(message = "El motivo es obligatorio")
    val motivo: String,
)
