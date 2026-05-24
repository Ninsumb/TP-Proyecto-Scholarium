package com.unsam.scholarium.controller

import com.unsam.scholarium.dto.ActualizarPerfilRequest
import com.unsam.scholarium.dto.UsuarioMeResponse
import com.unsam.scholarium.dto.UsuarioPortalResponse
import com.unsam.scholarium.service.UsuarioService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/usuarios")
class UsuarioController (
    private val usuarioService: UsuarioService
){
    @GetMapping("/me/portales")
    fun getMisPortales(authentication: Authentication): ResponseEntity<List<UsuarioPortalResponse>> {

        val email = authentication.name

        val portales = usuarioService.getMisPortales(email)

        return ResponseEntity.ok(portales)
    }

    @GetMapping("/me")
    fun getMiPerfil(authentication: Authentication): ResponseEntity<UsuarioMeResponse> {
        val email = authentication.name
        return ResponseEntity.ok(usuarioService.getMiPerfil(email))
    }

    @PutMapping("/me")
    fun actualizarPerfil(
        @RequestBody request: ActualizarPerfilRequest,
        authentication: Authentication
    ): ResponseEntity<UsuarioMeResponse> {
        val email = authentication.name
        return ResponseEntity.ok(usuarioService.actualizarPerfil(email, request))
    }
}