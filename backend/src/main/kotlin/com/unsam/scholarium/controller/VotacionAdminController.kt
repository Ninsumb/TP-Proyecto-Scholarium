package com.unsam.scholarium.controller

import com.unsam.scholarium.dto.CrearVotacionRequest
import com.unsam.scholarium.dto.VotacionResponse
import com.unsam.scholarium.dto.VotarRequest
import com.unsam.scholarium.model.EstadoVotacion
import com.unsam.scholarium.service.VotacionAdminService
import jakarta.validation.Valid
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

/**
 * Endpoints del sistema de votaciones de admins.
 *
 * Mapping mixto: usa /api como prefijo y cada método declara su path completo
 * porque tenemos dos "raíces" distintas (/portales/... y /votaciones/...).
 */
@RestController
@RequestMapping("/api")
class VotacionAdminController(
    private val votacionAdminService: VotacionAdminService,
) {

    /** Propone una nueva votación en el portal. El proponente queda con voto a favor. */
    @PostMapping("/portales/{portalId}/votaciones")
    fun crearVotacion(
        @PathVariable portalId: Long,
        @Valid @RequestBody request: CrearVotacionRequest,
        authentication: Authentication,
    ): ResponseEntity<VotacionResponse> {
        val votacion = votacionAdminService.crearVotacion(
            portalId = portalId,
            tipo = request.tipo!!,
            motivo = request.motivo!!,
            entidadId = request.entidadId,
            metadatos = request.metadatos,
            emailProponente = authentication.name,
        )
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(votacionAdminService.toResponse(votacion, authentication.name))
    }

    /** Registra el voto de un admin. Si se alcanza mayoría, ejecuta la acción asociada. */
    @PostMapping("/votaciones/{votacionId}/votar")
    fun votar(
        @PathVariable votacionId: Long,
        @Valid @RequestBody request: VotarRequest,
        authentication: Authentication,
    ): ResponseEntity<VotacionResponse> {
        val votacion = votacionAdminService.registrarVoto(
            votacionId = votacionId,
            aprueba = request.aprueba!!,
            emailAdmin = authentication.name,
        )
        return ResponseEntity.ok(votacionAdminService.toResponse(votacion, authentication.name))
    }

    /**
     * Lista las votaciones del portal en el estado dado. Default: ABIERTA.
     * Cualquier miembro o admin del portal puede consultarlas.
     */
    @GetMapping("/portales/{portalId}/votaciones")
    fun listarPorEstado(
        @PathVariable portalId: Long,
        @RequestParam(defaultValue = "ABIERTA") estado: EstadoVotacion,
        authentication: Authentication,
    ): ResponseEntity<List<VotacionResponse>> {
        val votaciones = votacionAdminService.listarPorEstado(
            portalId = portalId,
            estado = estado,
            emailUsuario = authentication.name,
        )
        return ResponseEntity.ok(votaciones.map { votacionAdminService.toResponse(it, authentication.name) })
    }

    /** Historial paginado de votaciones cerradas del portal. */
    @GetMapping("/portales/{portalId}/votaciones/historial")
    fun listarHistorial(
        @PathVariable portalId: Long,
        pageable: Pageable,
        authentication: Authentication,
    ): ResponseEntity<Page<VotacionResponse>> {
        val page = votacionAdminService.listarHistorial(
            portalId = portalId,
            pageable = pageable,
            emailUsuario = authentication.name,
        )
        return ResponseEntity.ok(page.map { votacionAdminService.toResponse(it, authentication.name) })
    }
}