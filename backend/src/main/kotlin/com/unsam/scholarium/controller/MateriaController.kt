package com.unsam.scholarium.controller

import com.unsam.scholarium.dto.ActualizarMateriaRequest
import com.unsam.scholarium.dto.MateriaResponse
import com.unsam.scholarium.dto.MoverMateriaRequest
import com.unsam.scholarium.dto.MaterialPublicadoResponse
import com.unsam.scholarium.service.MateriaService
import com.unsam.scholarium.service.MaterialService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/materias")
class MateriaController(
    private val materiaService: MateriaService,
    private val materialService: MaterialService
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
            request,
            email
        )

        val response = MateriaResponse(
            id = materiaActualizada.id!!,
            nombre = materiaActualizada.nombre,
            descripcion = materiaActualizada.descripcion,
            carpetaId = materiaActualizada.carpeta.id!!,
            orden = materiaActualizada.orden,
            updatedAt = materiaActualizada.updatedAt!!.toInstant()
        )

        return ResponseEntity.ok(response)
    }

    @PutMapping("/{materiaId}/mover")
    fun moverMateria(
        @PathVariable materiaId: UUID,
        @RequestBody request: MoverMateriaRequest,
        authentication: Authentication
    ): ResponseEntity<MateriaResponse> {
        val email = authentication.name

        val materiaActualizada = materiaService.moverMateria(
            materiaId,
            request.nuevaCarpetaId,
            email
        )

        val response = MateriaResponse(
            id = materiaActualizada.id!!,
            descripcion = materiaActualizada.descripcion,
            nombre = materiaActualizada.nombre,
            carpetaId = materiaActualizada.carpeta.id!!,
            orden = materiaActualizada.orden,
            updatedAt = materiaActualizada.updatedAt!!.toInstant()
        )

        return ResponseEntity.ok(response)
    }

    @GetMapping("/{materiaId}/material")
    fun listarMaterialPublicado(
        @PathVariable materiaId: UUID,
        authentication: Authentication
    ): ResponseEntity<List<MaterialPublicadoResponse>> {
        val email = authentication.name
        val materiales = materialService.listarMaterialPublicado(materiaId, email)
        return ResponseEntity.ok(materiales)
    }

    @GetMapping("/{materiaId}/material/buscar")
    fun buscarMaterialPublicado(
        @PathVariable materiaId: UUID,
        @RequestParam("nombre") nombre: String,
    authentication: Authentication
    ): ResponseEntity<List<MaterialPublicadoResponse>> {
        val email = authentication.name
        val materiales = materialService.buscarMaterialPublicado(materiaId, nombre, email)
        return ResponseEntity.ok(materiales)
    }

    @GetMapping("/{materiaId}")
    fun obtenerMateria(
        @PathVariable materiaId: UUID,
        authentication: Authentication
    ): ResponseEntity<MateriaResponse> {
        val email = authentication.name
        val materia = materiaService.obtenerMateria(materiaId, email)
        return ResponseEntity.ok(materia)
    }

    @DeleteMapping("/{materiaId}")
    fun eliminarMateria(
        @PathVariable materiaId: UUID,
        authentication: Authentication
    ): ResponseEntity<Void> {
        val email = authentication.name
        materiaService.eliminarMateria(materiaId, email)
        return ResponseEntity.noContent().build()
    }
}