package com.unsam.scholarium.controller

import com.unsam.scholarium.dto.PortalResponse
import com.unsam.scholarium.dto.PortalUserResponse
import com.unsam.scholarium.dto.SolicitudRequest
import com.unsam.scholarium.dto.SolicitudResponse
import com.unsam.scholarium.mapper.PortalMapper
import com.unsam.scholarium.model.Portal
import com.unsam.scholarium.service.PortalService
import org.springframework.security.core.Authentication
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
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
    fun obtenerPortal(@PathVariable id: Long): PortalResponse {
        val portal = portalService.getById(id)

        return PortalMapper.toDTO(portal)
    }

    @GetMapping()
    fun listarMisPortales(): List<PortalUserResponse> {
        val emailMock = "test@test.com"
        return portalService.getPortalesByUser(emailMock)
    }

    @GetMapping("/{portalId}/solicitudes")
fun obtenerSolicitudesPendientes(
        @PathVariable portalId: Long,
        authentication: Authentication
    ): List<SolicitudResponse> {
        val email = authentication.name

        return portalService.getSolicitudesPendientes(portalId, email)
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

    @PatchMapping
    fun patchPortal(
        @RequestBody portal: Portal,
        @RequestParam adminId: Long
    ) {
        portalService.patch(portal, adminId)
    }
}