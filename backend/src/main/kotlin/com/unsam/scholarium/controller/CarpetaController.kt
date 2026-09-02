package com.unsam.scholarium.controller

import com.unsam.scholarium.dto.CarpetaResponse
import com.unsam.scholarium.dto.CrearMateriaRequest
import com.unsam.scholarium.dto.MateriaResponse
import com.unsam.scholarium.dto.MoverCarpetaBodyRequestDTO
import com.unsam.scholarium.service.CarpetaService
import com.unsam.scholarium.service.MateriaService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/carpetas")
class CarpetaController(
    private val carpetaService: CarpetaService,
    private val materiaService: MateriaService
) {

    @DeleteMapping("/{carpetaId}")
    fun eliminarCarpeta(@PathVariable carpetaId: UUID): ResponseEntity<Void> {
        val email = SecurityContextHolder.getContext().authentication.name
        carpetaService.eliminarCarpeta(carpetaId, email)
        return ResponseEntity.noContent().build()
    }

    @PatchMapping("/{carpetaId}/mover")
    fun moverCarpeta(
        @PathVariable carpetaId: UUID,
        @RequestBody request: MoverCarpetaBodyRequestDTO,
        authentication: Authentication
    ): ResponseEntity<CarpetaResponse> {
        val email = authentication.name

        val carpeta = carpetaService.moverCarpeta(
            carpetaId = carpetaId,
            nuevoPadreId = request.carpetaPadre,
            emailAdmin = email
        )

        return ResponseEntity.noContent().build()
    }

    @PostMapping("/{carpetaId}/materias")
    fun crearMateria(
        @PathVariable carpetaId: UUID,
        @RequestBody request: CrearMateriaRequest,
        authentication: Authentication
    ): ResponseEntity<MateriaResponse> {

        val email = authentication.name

        val materiaCreada = materiaService.crearMateria(carpetaId, email, request)

        val response = MateriaResponse(
            id = materiaCreada.id!!,
            nombre = materiaCreada.nombre,
            descripcion = materiaCreada.descripcion,
            carpetaId = materiaCreada.carpeta.id!!,
            orden = materiaCreada.orden,
            updatedAt = materiaCreada.updatedAt!!.toInstant()
        )

        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }
}