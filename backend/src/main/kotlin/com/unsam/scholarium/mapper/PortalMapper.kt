package com.unsam.scholarium.mapper

import com.unsam.scholarium.dto.PortalResponse
import com.unsam.scholarium.model.Portal

object PortalMapper {
    fun toDTO(portal: Portal): PortalResponse {
        return PortalResponse(
            portal.id,
            portal.universidad,
            portal.carrera,
            portal.descripcion,
            portal.membresias.size,
            portal.fechaRegistro,
            portal.activo
        )
    }

}