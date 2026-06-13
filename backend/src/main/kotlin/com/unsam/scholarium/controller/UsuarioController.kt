package com.unsam.scholarium.controller

import com.unsam.scholarium.dto.ActualizarPerfilRequest
import com.unsam.scholarium.dto.ChangePasswordRequest
import com.unsam.scholarium.dto.UsuarioMeResponse
import com.unsam.scholarium.dto.UsuarioPortalResponse
import com.unsam.scholarium.service.AuthService
import com.unsam.scholarium.service.UsuarioService
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestPart
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/usuarios")
class UsuarioController (
    private val usuarioService: UsuarioService,
    private val authService: AuthService
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

    @PutMapping("/me/password")
    fun cambiarPassword(
        @RequestBody request: ChangePasswordRequest,
        authentication: Authentication
    ): ResponseEntity<Void> {
        val email = authentication.name

        authService.changePassword(email, request)

        return ResponseEntity.noContent().build()
    }

    @PatchMapping(
        "/me/foto-perfil",
        consumes = [MediaType.MULTIPART_FORM_DATA_VALUE]
    )
    fun actualizarFotoPerfil(
        @RequestPart("foto") foto: MultipartFile,
        authentication: Authentication
    ): ResponseEntity<Map<String, String>> {
        val email = authentication.name
        val url = usuarioService.actualizarFotoPerfil(email, foto)
        return ResponseEntity.ok(mapOf("fotoPerfil" to url))
    }

    @DeleteMapping("/me")
    fun eliminarCuenta(authentication: Authentication): ResponseEntity<Void> {
        val email = authentication.name
        usuarioService.eliminarCuenta(email)
        return ResponseEntity.noContent().build()
    }
}