package com.unsam.scholarium.controller

import com.unsam.scholarium.service.CarpetaService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/carpetas")
class CarpetaController(
    private val carpetaService: CarpetaService
) {

    @DeleteMapping("/{carpetaId}")
    fun eliminarCarpeta(@PathVariable carpetaId: UUID): ResponseEntity<Void> {
        val email = SecurityContextHolder.getContext().authentication.name
        carpetaService.eliminarCarpeta(carpetaId, email)
        return ResponseEntity.noContent().build()
    }
}