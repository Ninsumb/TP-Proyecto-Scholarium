package com.unsam.scholarium.controller

import com.unsam.scholarium.dto.ActualizarMateriaRequest
import com.unsam.scholarium.dto.MateriaResponse
import com.unsam.scholarium.service.MateriaService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/materias")
class MateriaController(
    private val materiaService: MateriaService
) {

    @PutMapping("/{materiaId}")
    fun actualizarMateria(
        @PathVariable materiaId: UUID,
        @RequestBody request: ActualizarMateriaRequest,
        authentication: Authentication
    ): ResponseEntity<MateriaResponse> {

        val email = authentication.name

        val materiaActualizada = materiaService.actualizarNombreMateria(
            materiaId,
            request.nombre,
            email
        )

        val response = MateriaResponse(
            id = materiaActualizada.id!!,
            nombre = materiaActualizada.nombre,
            carpetaId = materiaActualizada.carpeta.id!!,
            orden = materiaActualizada.orden,
            createdAt = materiaActualizada.createdAt!!.toInstant()
        )

        return ResponseEntity.ok(response)
    }
}