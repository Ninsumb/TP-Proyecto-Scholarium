// src/main/kotlin/com/unsam/scholarium/dto/AccionAdminResponse.kt
package com.unsam.scholarium.dto

import com.unsam.scholarium.model.AccionAdmin
import com.unsam.scholarium.model.TipoAccionAdmin
import java.time.Instant

data class AccionAdminResponse(
    val id: Long,
    val tipo: TipoAccionAdmin,
    val adminId: Long,
    val adminNombre: String,
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
            entidadId           = a.entidadId,
            entidadDescripcion  = a.entidadDescripcion,
            motivo              = a.motivo,
            createdAt           = a.createdAt!!,
        )
    }
}