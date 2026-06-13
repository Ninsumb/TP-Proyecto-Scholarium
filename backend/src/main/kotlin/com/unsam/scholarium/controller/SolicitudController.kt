package com.unsam.scholarium.controller

import com.unsam.scholarium.dto.PlantillaSolicitudResponse
import com.unsam.scholarium.dto.RechazarSolicitudRequest
import com.unsam.scholarium.dto.SolicitudRequest
import com.unsam.scholarium.dto.SolicitudResponse
import com.unsam.scholarium.service.SolicitudService
import com.unsam.scholarium.dto.ActualizarPlantillaRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

/**
 * Endpoints de Solicitud.
 *
 * Rutas bajo /api/portales/{portalId}/solicitudes:
 *   POST   /                  → crear solicitud (usuario no-miembro)
 *   GET    /                  → listar solicitudes PENDIENTES (admin)
 *   GET    /historial         → historial completo de solicitudes (admin)
 *   GET    /mi-solicitud      → solicitud más reciente del usuario autenticado
 *   GET    /plantilla         → requisitos y estado de apertura (público)
 *   PUT    /{id}/aprobar      → aprobar solicitud (admin)
 *   PUT    /{id}/rechazar     → rechazar con motivo (admin)
 */
@RestController
@RequestMapping("/api/portales/{portalId}/solicitudes")
class SolicitudController(
    private val solicitudService: SolicitudService,
) {

    /** Crea una nueva solicitud de membresía para el portal. */
    @PostMapping
    fun crearSolicitud(
        @PathVariable portalId: Long,
        @RequestBody request: SolicitudRequest,
        authentication: Authentication,
    ): ResponseEntity<Void> {
        solicitudService.createSolicitud(portalId, authentication.name, request)
        return ResponseEntity.status(HttpStatus.CREATED).build()
    }

    /** Lista las solicitudes PENDIENTES del portal. Solo admins. */
    @GetMapping
    fun getSolicitudesPendientes(
        @PathVariable portalId: Long,
        authentication: Authentication,
    ): List<SolicitudResponse> =
        solicitudService.getSolicitudesPendientes(portalId, authentication.name)

    /** Historial completo de solicitudes (todas). Solo admins. */
    @GetMapping("/historial")
    fun getHistorial(
        @PathVariable portalId: Long,
        authentication: Authentication,
    ): List<SolicitudResponse> =
        solicitudService.getHistorialSolicitudes(portalId, authentication.name)

    /**
     * Devuelve la solicitud más reciente del usuario autenticado para este portal.
     * Usado por el front para mostrar la página de estado.
     * Devuelve 204 si no existe ninguna solicitud.
     */
    @GetMapping("/mi-solicitud")
    fun getMiSolicitud(
        @PathVariable portalId: Long,
        authentication: Authentication,
    ): ResponseEntity<SolicitudResponse> {
        val solicitud = solicitudService.getMiSolicitud(portalId, authentication.name)
        return if (solicitud != null) ResponseEntity.ok(solicitud)
        else ResponseEntity.noContent().build()
    }

    /**
     * Devuelve los requisitos y el estado de apertura del portal.
     * Accesible sin ser miembro; se muestra al usuario antes del formulario.
     */
    @GetMapping("/plantilla")
    fun getPlantilla(
        @PathVariable portalId: Long,
    ): PlantillaSolicitudResponse =
        solicitudService.getPlantilla(portalId)

    /** Aprueba una solicitud PENDIENTE. Solo admins. */
    @PutMapping("/{solicitudId}/aprobar")
    fun aprobarSolicitud(
        @PathVariable portalId: Long,
        @PathVariable solicitudId: Long,
        authentication: Authentication,
    ): ResponseEntity<Void> {
        solicitudService.aprobarSolicitud(solicitudId, authentication.name)
        return ResponseEntity.ok().build()
    }

    /**
     * Rechaza una solicitud PENDIENTE con motivo obligatorio. Solo admins.
     * El motivo queda guardado y visible para el usuario solicitante.
     */
    @PutMapping("/{solicitudId}/rechazar")
    fun rechazarSolicitud(
        @PathVariable portalId: Long,
        @PathVariable solicitudId: Long,
        @RequestBody request: RechazarSolicitudRequest,
        authentication: Authentication,
    ): ResponseEntity<Void> {
        solicitudService.rechazarSolicitud(solicitudId, authentication.name, request)
        return ResponseEntity.ok().build()
    }


// EN SolicitudController — agregar los siguientes imports y métodos:
//
// Import adicionales:
//
//

    /**
     * Actualiza la PlantillaSolicitud del portal (requisitos y/o estado abierta).
     * Solo admins.
     * PATCH /api/portales/{portalId}/solicitudes/plantilla
     */
    @PatchMapping("/plantilla")
    fun actualizarPlantilla(
        @PathVariable portalId: Long,
        @RequestBody request: ActualizarPlantillaRequest,
        authentication: Authentication,
    ): ResponseEntity<PlantillaSolicitudResponse> {
        val resultado = solicitudService.actualizarPlantilla(portalId, authentication.name, request)
        return ResponseEntity.ok(resultado)
    }
}