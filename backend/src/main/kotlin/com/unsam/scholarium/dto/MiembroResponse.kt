package com.unsam.scholarium.dto

import com.unsam.scholarium.model.RolMembresia
import java.time.LocalDateTime

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