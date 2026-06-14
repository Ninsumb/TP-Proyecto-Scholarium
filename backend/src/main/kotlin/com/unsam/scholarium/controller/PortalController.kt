package com.unsam.scholarium.controller

import com.unsam.scholarium.dto.ActualizarPlantillaSolicitudRequest
import com.unsam.scholarium.dto.CarpetaRequest
import com.unsam.scholarium.dto.CarpetaResponse
import com.unsam.scholarium.dto.CrearPortalRequest
import com.unsam.scholarium.dto.CrearPortalResponse
import com.unsam.scholarium.dto.MaterialPendienteDTO
import com.unsam.scholarium.dto.MembresiaResponse
import com.unsam.scholarium.dto.PortalBusquedaResponse
import com.unsam.scholarium.dto.PortalEstructuraDTO
import com.unsam.scholarium.dto.PortalResponse
import com.unsam.scholarium.dto.SolicitudRequest
import com.unsam.scholarium.dto.SolicitudResponse
import com.unsam.scholarium.dto.MiembroResponse
import com.unsam.scholarium.dto.ActualizarPortalRequest
import com.unsam.scholarium.dto.CambiarTipoAccesoRequest
import com.unsam.scholarium.dto.VotacionResponse
import com.unsam.scholarium.mapper.PortalMapper
import com.unsam.scholarium.model.Portal
import com.unsam.scholarium.service.MaterialService
import com.unsam.scholarium.service.PortalService
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
class PortalController(
    private val portalService: PortalService,
    private val materialService: MaterialService
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


    @GetMapping("/{id}/estructura")
    fun obtenerEstructuraPortal(
        @PathVariable id: Long,
        authentication: Authentication
    ): ResponseEntity<PortalEstructuraDTO> {
        val email = authentication.name

        return ResponseEntity.ok(
            portalService.getEstructuraPortal(id, email)
        )
    }

    @GetMapping("/{id}/material/pendiente")
    fun obtenerMaterialPendiente(
        @PathVariable id: Long,
        authentication: Authentication
    ): List<MaterialPendienteDTO> {
        val email = authentication.name
        return materialService.getMaterialPendiente(id, email)
    }

    /**
     * Crea un Portal nuevo.
     * Devuelve 201 con el id del portal creado en el body,
     * para que el front pueda redirigir al usuario directamente a /portal/{id}.
     */
    @PostMapping
    fun crearPortal(
        @RequestBody request: CrearPortalRequest,
        authentication: Authentication
    ): ResponseEntity<CrearPortalResponse> {
        val email = authentication.name
        val portalCreado = portalService.createPortal(request, email)
        return ResponseEntity.status(HttpStatus.CREATED).body(PortalMapper.toCrearPortalResponse(portalCreado))
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
        return ResponseEntity.status(HttpStatus.OK).body("Carpeta renombrada a $nuevoNombre")
    }

    @PutMapping("/{idPortal}/tipo-acceso")
    fun cambiarTipoAcceso(
        @PathVariable idPortal: Long,
        @RequestBody request: CambiarTipoAccesoRequest,
        authentication: Authentication
    ): ResponseEntity<VotacionResponse> {
        val email = authentication.name

        val votacion = portalService.solicitarCambioTipoAcceso(idPortal, email, request)

        return ResponseEntity.accepted().body(votacion)
    }

    @PutMapping("/{id}/plantilla-solicitud")
    fun actualizarPlantillaSolicitud(
        @PathVariable id: Long,
        @RequestBody request: ActualizarPlantillaSolicitudRequest,
        authentication: Authentication
    ): ResponseEntity<Void> {
        val email = authentication.name

        portalService.actualizarPlantillaSolicitud(id, email, request)

        return ResponseEntity.ok().build()
    }

    @PatchMapping
    fun patchPortal(
        @RequestBody portal: Portal
    ) {
        portalService.patch(portal)
    }

    @GetMapping("/buscar")
    fun buscarPortales(
        @RequestParam(required = false) universidad: String?,
        @RequestParam(required = false) carrera: String?,
        @RequestParam(required = false) pagina: Int = 0
    ): ResponseEntity<PortalBusquedaResponse> {
        return ResponseEntity.ok(portalService.buscarPortales(universidad, carrera, pagina))
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

    @PutMapping("/{portalId}/miembros/{usuarioId}/promover")
    fun promoverAdmin(
        @PathVariable portalId: Long,
        @PathVariable usuarioId: Long,
        authentication: Authentication
    ): ResponseEntity<MembresiaResponse> {
        val email = authentication.name
        return ResponseEntity.ok(
            portalService.promoverAdmin(
                portalId,
                usuarioId,
                email)
        )
    }

    @PutMapping("/{portalId}/miembros/{usuarioId}/degradar")
    fun degradarAdmin(
        @PathVariable portalId: Long,
        @PathVariable usuarioId: Long,
        authentication: Authentication
    ): ResponseEntity<MembresiaResponse> {
        val email = authentication.name
        return ResponseEntity.ok(
            portalService.degradarAdmin(
                portalId,
                usuarioId,
                email)
        )
    }

    /**
     * Lista todos los miembros activos del portal.
     * Solo admins.
     * GET /api/portales/{portalId}/miembros
     */
    @GetMapping("/{portalId}/miembros")
    fun getMiembros(
        @PathVariable portalId: Long,
        authentication: Authentication,
    ): ResponseEntity<List<MiembroResponse>> {
        val email = authentication.name
        return ResponseEntity.ok(portalService.getMiembros(portalId, email))
    }

    /**
     * Actualiza los campos no-votables del portal (descripcion, unidadAcademica, iconoPortal,
     * colorPortal, logoUrl).
     * Solo admins.
     * PATCH /api/portales/{portalId}
     */
    @PatchMapping("/{portalId}")
    fun actualizarPortal(
        @PathVariable portalId: Long,
        @RequestBody request: ActualizarPortalRequest,
        authentication: Authentication,
    ): ResponseEntity<PortalResponse> {
        val email = authentication.name
        portalService.actualizarPortal(portalId, email, request)
        val detalleData = portalService.getDetalleById(portalId, email)
        return ResponseEntity.ok(PortalMapper.toDetalleDTO(detalleData))
    }

    @DeleteMapping("/{id}/bloqueos/{userId}")
    fun levantarBloqueo(
        @PathVariable id: Long,
        @PathVariable userId: Long,
        authentication: Authentication
    ): ResponseEntity<Void> {
        val email = authentication.name

        portalService.levantarBloqueo(id, userId, email)

        return ResponseEntity.noContent().build()
    }
}