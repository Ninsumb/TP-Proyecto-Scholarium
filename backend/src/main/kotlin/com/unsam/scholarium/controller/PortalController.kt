package com.unsam.scholarium.controller

import com.unsam.scholarium.dto.CarpetaRequest
import com.unsam.scholarium.dto.CarpetaResponse
import com.unsam.scholarium.dto.MoverCarpetaBodyRequestDTO
import com.unsam.scholarium.dto.PortalBusquedaResponse
import com.unsam.scholarium.dto.PortalResponse
import com.unsam.scholarium.dto.PortalUserResponse
import com.unsam.scholarium.dto.SolicitudRequest
import com.unsam.scholarium.dto.SolicitudResponse
import com.unsam.scholarium.mapper.PortalMapper
import com.unsam.scholarium.model.Portal
import com.unsam.scholarium.service.PortalService
import org.hibernate.validator.constraints.UUID
import org.springframework.security.core.Authentication
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/portales")
@CrossOrigin(origins = ["http://localhost:5173"])
class PortalController (
    private val portalService: PortalService
) {
    @GetMapping("/{id}")
    fun obtenerPortal(
        @PathVariable id: Long,
        authentication: Authentication
    ): PortalResponse {
        val email = authentication.name

        val detalleData = portalService.getDetalleById(id, email)

        return PortalMapper.toDetalleDTO(detalleData)
    }

    //TODO: ¿Esta función y getMisPortales en UsuarioController.kt no son lo mismo?

    @GetMapping()
    fun listarMisPortales(
        authentication: Authentication
    ): List<PortalUserResponse> {
        val email = authentication.name
        return portalService.getPortalesByUser(email)
    }

    @GetMapping("/{id}/solicitudes")
fun obtenerSolicitudesPendientes(
        @PathVariable id: Long,
        authentication: Authentication
    ): List<SolicitudResponse> {
        val email = authentication.name

        return portalService.getSolicitudesPendientes(id, email)
    }

    @PostMapping
    fun crearPortal(
        @RequestBody portal: Portal,
        authentication: Authentication
    ): ResponseEntity<Void> {
        val email = authentication.name

        portalService.createPortal(portal, email)

        return ResponseEntity.status(HttpStatus.CREATED).build()
    }

    //TODO: 1) ¿Por qué se llama "placeholder"? 2) ¿Dónde deberían ir las request de Solicitud?
    @PostMapping("/{id}/solicitudes")
    fun placeholder(
        @PathVariable id: Long,
        @RequestBody dto: SolicitudRequest,
        authentication: Authentication
    ): ResponseEntity<Void> {
        val email = authentication.name

        portalService.createSolicitud(id, email, dto)

        return ResponseEntity.status(HttpStatus.CREATED).build()
    }

    @PostMapping("/{id}/carpetas")
    fun crearCarpeta(
        @PathVariable id: Long,
        @RequestBody dto: CarpetaRequest,
        authentication: Authentication
    ): ResponseEntity<CarpetaResponse> {

        val email = authentication.name

        val carpeta = portalService.createCarpeta(id, email, dto)

        val response = CarpetaResponse(
            id = carpeta.id!!,
            nombre = carpeta.nombre,
            portalId = carpeta.portal.id!!,
            carpetaPadreId = carpeta.carpetaPadre?.id,
            orden = carpeta.orden,
            createdAt = carpeta.createdAt
        )

        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @PutMapping("/{idPortal}/carpetas/{id}/renombrar")
    fun renombrarCarpeta(
        @PathVariable id: java.util.UUID,
        @PathVariable idPortal: Long,
        @RequestBody nuevoNombre: String,
        authentication: Authentication
    ): ResponseEntity<String> {
        val email = authentication.name
        portalService.renameCarpeta(idPortal, id, email, nuevoNombre)

        return ResponseEntity.status(HttpStatus.OK).body("Carpeta renombrada a ${nuevoNombre}")
    }

    @PutMapping("/{idPortal}/materias/{id}/mover")

    @PatchMapping
    fun patchPortal(
        @RequestBody portal: Portal,
        @RequestParam adminId: Long
    ) {
        portalService.patch(portal, adminId)
    }

    @GetMapping("/buscar")
    fun buscarPortales(
        @RequestParam(required = false) universidad: String?,
        @RequestParam(required = false) carrera: String?
    ): ResponseEntity<List<PortalBusquedaResponse>> {

        return ResponseEntity.ok(
            portalService.buscarPortales(universidad, carrera)
        )
    }

    @DeleteMapping("/{portalId}/miembros/{usuarioId}")
    fun removerMiembro(
        @PathVariable portalId: Long,
        @PathVariable usuarioId: Long,
        authentication: Authentication
    ): ResponseEntity<Void> {
        val email = authentication.name
        portalService.removerMiembro(portalId, usuarioId, email)
        return ResponseEntity.noContent().build()
    }
}