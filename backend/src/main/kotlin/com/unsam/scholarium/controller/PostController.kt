package com.unsam.scholarium.controller

import com.unsam.scholarium.dto.CrearPostRequest
import com.unsam.scholarium.dto.CrearRespuestaRequest
import com.unsam.scholarium.dto.PostResponse
import com.unsam.scholarium.service.PostService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api")
class PostController(private val postService: PostService) {

    @PostMapping("/foros/{tableroId}/posts")
    fun crearPost(
        @PathVariable tableroId: UUID,
        @Valid @RequestBody request: CrearPostRequest,
        authentication: Authentication
    ): ResponseEntity<PostResponse> {
        val email = authentication.name
        val post = postService.crearPost(tableroId, email, request)
        return ResponseEntity.status(HttpStatus.CREATED).body(post)
    }

    @GetMapping("/foros/{tableroId}/posts")
    fun listarPosts(
        @PathVariable tableroId: UUID,
        authentication: Authentication
    ): ResponseEntity<List<PostResponse>> {
        val email = authentication.name
        val posts = postService.listarPostsDeTablero(tableroId, email)
        return ResponseEntity.ok(posts)
    }

    @PostMapping("/posts/{postId}/respuestas")
    fun responderPost(
        @PathVariable postId: UUID,
        @Valid @RequestBody request: CrearRespuestaRequest,
        authentication: Authentication
    ): ResponseEntity<PostResponse> {
        val email = authentication.name
        val respuesta = postService.responderPost(postId, email, request)
        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta)
    }

    @GetMapping("/posts/{postId}/respuestas")
    fun listarRespuestas(
        @PathVariable postId: UUID,
        authentication: Authentication
    ): ResponseEntity<List<PostResponse>> {
        val email = authentication.name
        val respuestas = postService.listarRespuestasDePost(postId, email)
        return ResponseEntity.ok(respuestas)
    }
}