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

    @PostMapping("/foros/{foroId}/posts")
    fun crearPost(
        @PathVariable foroId: UUID,
        @Valid @RequestBody request: CrearPostRequest,
        authentication: Authentication
    ): ResponseEntity<PostResponse> {
        val email = authentication.name
        val post = postService.crearPost(foroId, email, request)
        return ResponseEntity.status(HttpStatus.CREATED).body(post)
    }

    @GetMapping("/foros/{foroId}/posts")
    fun listarPosts(
        @PathVariable foroId: UUID,
        authentication: Authentication
    ): ResponseEntity<List<PostResponse>> {
        val email = authentication.name
        val posts = postService.listarPostsDeForo(foroId, email)
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
}