package com.unsam.scholarium.mapper

import com.unsam.scholarium.dto.CrearPortalResponse
import com.unsam.scholarium.dto.PortalBusquedaDTO
import com.unsam.scholarium.dto.PortalBusquedaResponse
import com.unsam.scholarium.dto.PortalResponse
import com.unsam.scholarium.model.Portal
import com.unsam.scholarium.model.RolMembresia

object PortalMapper {

    fun toDetalleDTO(data: Triple<Portal, RolMembresia?, List<Int>>): PortalResponse {
        val (portal, rol, stats) = data
        return PortalResponse(
            id = portal.id!!,
            universidad = portal.universidad,
            carrera = portal.carrera,
            unidadAcademica = portal.unidadAcademica,
            descripcion = portal.descripcion,
            logoUrl = portal.logoUrl,
            iconoPortal = portal.iconoPortal,
            colorPortal = portal.colorPortal,
            cantidadMiembros = stats[0],
            cantidadMaterias = stats[1],
            cantidadMaterialPublicado = stats[2],
            rolUsuarioAutenticado = rol?.name,
            fechaRegistro = portal.fechaRegistro,
            activo = portal.activo
        )
    }

    fun toBusquedaDTO(portal: Portal): PortalBusquedaDTO {
        return PortalBusquedaDTO(
            id = portal.id,
            universidad = portal.universidad,
            carrera = portal.carrera,
            unidadAcademica = portal.unidadAcademica,
            descripcion = portal.descripcion,
            estudiantes = portal.membresias.size,
            logoUrl = portal.logoUrl,
            iconoPortal = portal.iconoPortal,
            colorPortal = portal.colorPortal,
        )
    }

    fun toCrearPortalResponse(portal: Portal): CrearPortalResponse {
        return CrearPortalResponse(
            id = portal.id!!,
            universidad = portal.universidad,
            carrera = portal.carrera,
        )
    }
}