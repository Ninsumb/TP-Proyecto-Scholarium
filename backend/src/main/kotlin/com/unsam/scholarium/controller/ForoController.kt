package com.unsam.scholarium.controller

import com.unsam.scholarium.dto.TableroResponse
import com.unsam.scholarium.service.ForoService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/portales/{portalId}/foros")
class ForoController(
    private val foroService: ForoService
) {


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
}