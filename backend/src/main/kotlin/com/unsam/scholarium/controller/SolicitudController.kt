package com.unsam.scholarium.controller

import com.unsam.scholarium.service.SolicitudService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/solicitudes")
class SolicitudController(
    private val solicitudService: SolicitudService
) {

    @PutMapping("/{solicitudId}/aprobar")
    fun aprobarSolicitud(@PathVariable solicitudId: Long) : ResponseEntity<Void>{
        val email = SecurityContextHolder
            .getContext()
            .authentication
            .name

        solicitudService.aprobarSolicitud(solicitudId, email)
        return ResponseEntity.ok().build()
    }

    @PutMapping("/{solicitudId}/rechazar")
    fun rechazarSolicitud(@PathVariable solicitudId: Long) : ResponseEntity<Void>{
        val email = SecurityContextHolder
            .getContext()
            .authentication
            .name

        solicitudService.rechazarSolicitud(solicitudId, email)
        return ResponseEntity.ok().build()
    }
}