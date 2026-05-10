package com.unsam.scholarium.controller

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.multipart.MultipartFile
import org.springframework.http.ResponseEntity
import org.springframework.http.HttpStatus
import org.springframework.security.core.Authentication
import java.util.UUID
import com.unsam.scholarium.service.MaterialService



@RestController
@RequestMapping("/api")
class MaterialController {

    @PostMapping("/materias/{materiaId}/material")
    fun subirMaterial(
        @PathVariable materiaId: Long,
        @RequestParam("file") file: MultipartFile,
        authentication: Authentication
        ): ResponseEntity<Void> {

      val email = authentication.name      
       
       materialService.subirMaterial(materiaId, file, email)
       
       return ResponseEntity.status(HttpStatus.CREATED).build()

    }
}