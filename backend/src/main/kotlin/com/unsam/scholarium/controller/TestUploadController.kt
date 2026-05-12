package com.unsam.scholarium.controller

import com.unsam.scholarium.service.FileStorageService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/test")
class TestUploadController(
    private val fileStorageService: FileStorageService
) {

    @PostMapping("/upload")
    fun upload(
        @RequestParam("file") file: MultipartFile
    ): ResponseEntity<Map<String, String>> {

        val url = fileStorageService.upload(file)

        return ResponseEntity.ok(
            mapOf("url" to url)
        )
    }

    @DeleteMapping("/delete")
    fun delete(
        @RequestParam("url") fileUrl: String
    ): ResponseEntity<Map<String, Any>> {

        val deleted = fileStorageService.delete(fileUrl)

        return if (deleted) {
            ResponseEntity.ok(mapOf("message" to "Archivo eliminado correctamente"))
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(mapOf("message" to "No se pudo eliminar el archivo o no existe"))
        }
    }
}