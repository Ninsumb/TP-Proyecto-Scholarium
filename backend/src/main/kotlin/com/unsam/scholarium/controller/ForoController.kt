package com.unsam.scholarium.controller

import com.unsam.scholarium.dto.CrearTableroRequest
import com.unsam.scholarium.dto.EditarTableroRequest
import com.unsam.scholarium.dto.TableroResponse
import com.unsam.scholarium.service.ForoService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/portales/{portalId}/foros")
class ForoController(
    private val foroService: ForoService
) {

    @PostMapping                                          // POST /api/portales/{portalId}/foros
    fun crearTablero(
        @PathVariable portalId: Long,
        @Valid @RequestBody request: CrearTableroRequest,
        authentication: Authentication
    ): ResponseEntity<TableroResponse> {
        val email = authentication.name
        val tablero = foroService.crearTablero(
            portalId = portalId,
            emailUsuario = email,
            request = request
        )
        return ResponseEntity.status(HttpStatus.CREATED).body(tablero)
    }

    @GetMapping
    fun obtenerTableros(
        @PathVariable portalId: Long,
        @RequestParam(required = false) etiqueta: String?,
        authentication: Authentication
    ): ResponseEntity<List<TableroResponse>> {

        val email = authentication.name

        val tableros = foroService.obtenerTablerosDePortal(
            portalId = portalId,
            emailUsuario = email,
            etiquetaNombre = etiqueta
        )

        return ResponseEntity.ok(tableros)
    }

    @PutMapping("/{tableroId}")   // PUT /api/portales/{portalId}/foros/{tableroId}
    fun editarTablero(
        @PathVariable portalId: Long,
        @PathVariable tableroId: UUID,
        @Valid @RequestBody request: EditarTableroRequest,
        authentication: Authentication,
    ): ResponseEntity<TableroResponse> {
        val tablero = foroService.editarTablero(portalId, tableroId, authentication.name, request)
        return ResponseEntity.ok(tablero)
    }
}