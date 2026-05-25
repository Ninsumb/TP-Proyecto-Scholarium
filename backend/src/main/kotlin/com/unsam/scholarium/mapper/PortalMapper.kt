package com.unsam.scholarium.mapper

import com.unsam.scholarium.dto.PortalBusquedaResponse
import com.unsam.scholarium.dto.PortalResponse
import com.unsam.scholarium.model.Portal
import com.unsam.scholarium.model.RolMembresia

object PortalMapper {
    fun toDetalleDTO(data: Triple<Portal, RolMembresia?, List<Int>>): PortalResponse {
        val (portal, rol, stats) = data

        return PortalResponse(
            portal.id!!,
            portal.universidad,
            portal.carrera,
            portal.descripcion,
            portal.logoUrl,
            stats[0],
            stats[1],
            stats[2],
            rol?.name,
            portal.fechaRegistro,
            portal.activo
        )
    }

    fun toBusquedaResponse(portal: Portal): PortalBusquedaResponse {
        return PortalBusquedaResponse(
            id = portal.id,
            universidad = portal.universidad,
            carrera = portal.carrera,
            descripcion = portal.descripcion,
            estudiantes = portal.membresias.size,
            logoUrl = portal.logoUrl
        )
    }
}