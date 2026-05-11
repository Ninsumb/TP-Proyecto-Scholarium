package com.unsam.scholarium.controller

import com.unsam.scholarium.dto.MaterialResponse
import com.unsam.scholarium.service.MaterialService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
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

        val response = MaterialResponse(
            id = material.id!!,
            nombre = material.nombre,
            estado = material.estado,
            updatedAt = material.updatedAt
        )

        return ResponseEntity.ok(response)
    }
}