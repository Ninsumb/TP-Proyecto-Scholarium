package com.unsam.scholarium.controller

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.http.ResponseEntity
import org.springframework.http.HttpStatus
import org.springframework.security.core.Authentication
import java.util.UUID
import com.unsam.scholarium.service.MaterialService
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.ModelAttribute
import com.unsam.scholarium.dto.SubirMaterialRequest



@RestController
@RequestMapping("/api")
class MaterialController(
    private val materialService: MaterialService
) {

    @PostMapping("/materias/{materiaId}/material", consumes = ["multipart/form-data"])
    fun subirMaterial(
        @PathVariable materiaId: Long,
        @ModelAttribute request: SubirMaterialRequest,
        authentication: Authentication
        ): ResponseEntity<Void> {

      val email = authentication.name      
       
       materialService.subirMaterial(materiaId, request, email)
       
       return ResponseEntity.status(HttpStatus.CREATED).build()

    }
}