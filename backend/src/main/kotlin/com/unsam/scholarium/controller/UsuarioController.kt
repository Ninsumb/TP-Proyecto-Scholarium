package com.unsam.scholarium.controller

import com.unsam.scholarium.dto.UsuarioPortalResponse
import com.unsam.scholarium.service.UsuarioService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/usuarios")
class UsuarioController (
    private val usuarioService: UsuarioService
){


    //TODO: ¿Esta función y listarMisPortales en PortalController.kt no son lo mismo?

    @GetMapping("/me/portales")
    fun getMisPortales(authentication: Authentication): ResponseEntity<List<UsuarioPortalResponse>> {

        val email = authentication.name

        val portales = usuarioService.getMisPortales(email)

        return ResponseEntity.ok(portales)
    }
}