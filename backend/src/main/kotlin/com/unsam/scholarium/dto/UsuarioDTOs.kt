package com.unsam.scholarium.dto

import com.unsam.scholarium.model.AccionAdmin
import com.unsam.scholarium.model.RolMembresia
import com.unsam.scholarium.model.TipoAccionAdmin
import com.unsam.scholarium.model.TipoNotificacion
import java.time.Instant
import java.time.LocalDateTime
import java.util.UUID

data class ActualizarPerfilRequest(
    val nombre: String
)

data class UsuarioMeResponse(
    val id: Long,
    val nombre: String,
    val email: String,
    val fotoPerfil: String?,
    val createdAt: LocalDateTime,
    val cantidadPortales: Int,
    val cantidadMaterialSubido: Long
)

data class UsuarioPortalResponse(
    val id: Long,
    val universidad: String,
    val carrera: String,
    val descripcion: String?,
    val logoUrl: String?,
    val iconoPortal: String?,
    val colorPortal: String?,
    val rol: RolMembresia,
    val cantidadMiembros: Long,
    val cantidadMaterias: Long
)

/**
 * DTO de un miembro del portal para el Panel de Administración.
 * Expone id de usuario, nombre, email, rol y fecha de registro en el portal.
 */
data class MiembroResponse(
    val usuarioId: Long,
    val membresiaId: Long,
    val nombre: String,
    val email: String,
    val rol: RolMembresia,
    val fechaRegistro: LocalDateTime,
    val fotoPerfil: String?
)

data class AccionAdminResponse(
    val id: Long,
    val tipo: TipoAccionAdmin,
    val adminId: Long,
    val adminNombre: String,
    val adminFotoPerfil: String?,
    val entidadId: String?,
    val entidadDescripcion: String?,
    val motivo: String?,
    val createdAt: Instant,
) {
    companion object {
        fun fromEntity(a: AccionAdmin) = AccionAdminResponse(
            id                  = a.id!!,
            tipo                = a.tipo,
            adminId             = a.admin.id!!,
            adminNombre         = a.admin.nombre,
            adminFotoPerfil     = a.admin.fotoPerfil,
            entidadId           = a.entidadId,
            entidadDescripcion  = a.entidadDescripcion,
            motivo              = a.motivo,
            createdAt           = a.createdAt!!,
        )
    }
}

data class NotificacionResponse(
    val id: UUID,
    val tipo: TipoNotificacion,
    val titulo: String,
    val descripcion: String,
    val portalNombre: String?,
    val leida: Boolean,
    val fechaCreacion: LocalDateTime,
    val entidadId: Long?,
    val entidadTipo: String?
)

data class MembresiaResponse(
    val membresiaId: Long,
    val usuarioId: Long,
    val portalId: Long,
    val rol: RolMembresia
)
