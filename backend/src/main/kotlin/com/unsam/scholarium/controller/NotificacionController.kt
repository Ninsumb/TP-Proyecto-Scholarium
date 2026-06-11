package com.unsam.scholarium.controller

import com.unsam.scholarium.dto.NotificacionResponse
import com.unsam.scholarium.service.NotificacionService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/notificaciones")
class NotificacionController(
    private val notificacionService: NotificacionService
) {

    @GetMapping
    fun getNotificaciones(authentication: Authentication): ResponseEntity<List<NotificacionResponse>> {
        val email = authentication.name
        val notificaciones = notificacionService.getNotificaciones(email)
        return ResponseEntity.ok(notificaciones)
    }

    @PatchMapping("/{notificacionId}/leer")
    fun marcarComoLeida(
        @PathVariable notificacionId: UUID,
        authentication: Authentication
    ): ResponseEntity<Void> {
        val email = authentication.name
        notificacionService.marcarComoLeida(email, notificacionId)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/leer-todas")
    fun marcarTodasComoLeidas(authentication: Authentication): ResponseEntity<Void> {
        val email = authentication.name
        notificacionService.marcarTodasComoLeidas(email)
        return ResponseEntity.noContent().build()
    }

    @DeleteMapping("/{notificacionId}")
    fun eliminarNotificacion(
        @PathVariable notificacionId: UUID,
        authentication: Authentication
    ): ResponseEntity<Void> {
        val email = authentication.name
        notificacionService.eliminarNotificacion(email, notificacionId)
        return ResponseEntity.noContent().build()
    }

    @DeleteMapping("/leidas")
    fun eliminarTodasLeidas(authentication: Authentication): ResponseEntity<Void> {
        val email = authentication.name
        notificacionService.eliminarTodasLeidas(email)
        return ResponseEntity.noContent().build()
    }
}