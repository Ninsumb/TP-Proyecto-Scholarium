package com.unsam.scholarium.dto

import com.unsam.scholarium.model.Block
import com.unsam.scholarium.model.RolMembresia
import com.unsam.scholarium.model.TipoAcceso
import java.time.LocalDateTime
import java.util.UUID

/**
 * DTO para la creación de un Portal.
 *
 * Reemplaza el anti-patrón actual de recibir la entidad Portal directamente
 * en el controller (@RequestBody portal: Portal). Recibir la entidad expone
 * campos que el cliente no debería poder setear (id, fechaRegistro, activo,
 * membresias, etc.) y acopla el contrato HTTP al modelo de dominio.
 *
 * La imagen subida (logoUrl) llega como una URL ya resuelta de Cloudinary:
 * el front sube la imagen a Cloudinary directamente y nos manda la URL resultante.
 * Esto es consistente con cómo manejan fotos de perfil y materiales.
 */
data class CrearPortalRequest(
    // Obligatorios
    val universidad: String,
    val carrera: String,

    // Opcionales
    val unidadAcademica: String? = null,
    val descripcion: String? = null,

    // Identidad visual — mutuamente excluyentes desde el front,
    // pero el back no valida exclusividad: si llegan los dos, logoUrl tiene prioridad
    // (el front ya lo controla; no tiene sentido duplicar esa lógica acá).
    val logoUrl: String? = null,
    val iconoPortal: String? = null,
    val colorPortal: String? = null,
    val tipoAcceso: String = "ABIERTO"
)

/**
 * Respuesta devuelta al crear un Portal exitosamente.
 * El front necesita el id para poder redirigir al usuario
 * directamente a su portal recién creado.
 */
data class CrearPortalResponse(
    val id: Long,
    val universidad: String,
    val carrera: String,
)

/**
 * Request para actualizar los campos de identidad y visual del portal
 * que NO requieren votación: unidadAcademica, descripcion, iconoPortal, colorPortal, logoUrl.
 *
 * Universidad y carrera NO están acá porque esos campos requieren votación de admins
 * y se manejan por el sistema de VotacionAdmin (tipo CAMBIO_INFO_PORTAL).
 */
data class ActualizarPortalRequest(
    val unidadAcademica: String?,
    val descripcion: String?,
    val iconoPortal: String?,
    val colorPortal: String?,
    val logoUrl: String?,
    val tipoAcceso: TipoAcceso? = null,
)

// PortalResponse: usado para la vista de detalle del portal (/portales/{id})
data class PortalResponse(
    var id: Long?,
    var universidad: String,
    var carrera: String,
    var unidadAcademica: String?,
    var descripcion: String?,
    var logoUrl: String?,
    var iconoPortal: String?,
    var colorPortal: String?,
    var cantidadMiembros: Int = 0,
    var cantidadMaterias: Int = 0,
    var cantidadMaterialPublicado: Int = 0,
    val rolUsuarioAutenticado: String?,
    var fechaRegistro: LocalDateTime,
    var activo: Boolean,
    val tipoAcceso: TipoAcceso? = null,
)

// PortalBusquedaDTO: usado para las cards en la vista de búsqueda (/portales/buscar)
data class PortalBusquedaDTO(
    val id: Long?,
    val universidad: String,
    val carrera: String,
    val unidadAcademica: String?,
    val descripcion: String?,
    val estudiantes: Int,
    // Identidad visual
    val logoUrl: String?,
    val iconoPortal: String?,
    val colorPortal: String?,
    val tipoAcceso: TipoAcceso? = null
)

data class PortalBusquedaResponse(
    val portales: List<PortalBusquedaDTO>,
    val page: Int,
    val total: Int,
)

data class PortalUserResponse(
    val id: Long,
    val universidad: String,
    val carrera: String,
    val rol: RolMembresia
)

data class CambiarTipoAccesoRequest(
    val nuevoTipoAcceso: TipoAcceso,
    val motivo: String
)

data class DenunciaPortalRequest(
    val motivo: String,
    val comentarios: String? = null
)

data class PortalEstructuraDTO(
    val portalId: Long,
    val carpetas: List<CarpetaArbolDTO>
)

data class CarpetaArbolDTO(
    val id: UUID,
    val nombre: String,
    val carpetaPadreId: UUID?,
    val orden: Int,
    val subcarpetas: MutableList<CarpetaArbolDTO> = mutableListOf(),
    val materias: List<MateriaArbolDTO> = emptyList()
)

data class MateriaArbolDTO(
    val id: UUID,
    val nombre: String,
    val foroId: UUID?,
    val orden: Int
)

data class BlocksResponse(
    val blocks: List<Block>,
    val error: String? = null
)

data class UpdateBlocksRequest(
    val blocks: List<Block>
)
