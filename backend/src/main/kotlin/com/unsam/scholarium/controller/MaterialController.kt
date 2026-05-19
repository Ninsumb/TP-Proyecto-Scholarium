package com.unsam.scholarium.controller

import com.unsam.scholarium.dto.MaterialResponse
import com.unsam.scholarium.dto.RechazarMaterialRequest
import com.unsam.scholarium.model.TipoMaterial
import com.unsam.scholarium.service.MaterialService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import java.util.UUID

@RestController
@RequestMapping("/api/material")
class MaterialController(private val materialService: MaterialService) {

    @PutMapping("/{materialId}/aprobar")
    fun aprobarMaterial(
        @PathVariable materialId: UUID,
        authentication: Authentication
    ): ResponseEntity<MaterialResponse> {

        val email = authentication.name

        val material = materialService.aprobarMaterial(materialId, email)

        val response = MaterialResponse.fromEntity(material)

        return ResponseEntity.ok(response)
    }

    @PostMapping("/materias/{materiaId}/material")
    fun subirMaterial(
        @PathVariable materiaId: UUID,
        @RequestParam("archivo") archivo: MultipartFile,
        @RequestParam("nombre") nombre: String,
        @RequestParam("descripcion", required = false) descripcion: String?,
        @RequestParam("tipo") tipo: String,
        authentication: Authentication
    ): ResponseEntity<MaterialResponse> {
        val email = authentication.name

        val material = materialService.subirMaterial(
            materiaId,
            archivo,
            nombre,
            descripcion,
            tipo,
            email
        )

        return ResponseEntity.status(HttpStatus.CREATED).body(material)
    }

    @PutMapping("/{materialId}/rechazar")
    fun rechazarMaterial(
        @PathVariable materialId: UUID,
        @Valid @RequestBody request: RechazarMaterialRequest,
        authentication: Authentication
    ): ResponseEntity<MaterialResponse> {
        val email = authentication.name

        val material = materialService.rechazarMaterial(materialId, email, request.motivoRechazo)

        val response = MaterialResponse.fromEntity(material)
        return ResponseEntity.ok(response)
    }
}