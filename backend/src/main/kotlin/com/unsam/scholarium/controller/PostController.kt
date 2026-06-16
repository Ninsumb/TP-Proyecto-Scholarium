package com.unsam.scholarium.controller

import com.unsam.scholarium.dto.CrearPostRequest
import com.unsam.scholarium.dto.CrearRespuestaRequest
import com.unsam.scholarium.dto.EditarPostRequest
import com.unsam.scholarium.dto.OcultarPostRequest
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

    @GetMapping("/foros/{tableroId}/posts/buscar")
    fun buscarPosts(
        @PathVariable tableroId: UUID,
        @RequestParam q: String,
        authentication: Authentication
    ): ResponseEntity<List<PostResponse>> {
        val email = authentication.name
        val posts = postService.buscarPostsEnTablero(tableroId, email, q)
        return ResponseEntity.ok(posts)
    }

    @PutMapping("/posts/{postId}")
    fun editarPost(
        @PathVariable postId: UUID,
        @Valid @RequestBody request: EditarPostRequest,
        authentication: Authentication
    ): ResponseEntity<PostResponse> {
        val email = authentication.name
        val post = postService.editarPost(postId, email, request)
        return ResponseEntity.ok(post)
    }

    @DeleteMapping("/posts/{postId}")
    fun eliminarPost(
        @PathVariable postId: UUID,
        authentication: Authentication
    ): ResponseEntity<Void> {
        val email = authentication.name
        postService.eliminarPost(postId, email)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/posts/{postId}/ocultar")
    fun ocultarPost(
        @PathVariable postId: UUID,
        @Valid @RequestBody request: OcultarPostRequest,
        authentication: Authentication,
    ): ResponseEntity<PostResponse> {
        val post = postService.ocultarPost(postId, authentication.name, request.motivo)
        return ResponseEntity.ok(post)
    }

    @PostMapping("/posts/{postId}/develar")
    fun develarPost(
        @PathVariable postId: UUID,
        authentication: Authentication,
    ): ResponseEntity<PostResponse> {
        val post = postService.develarPost(postId, authentication.name)
        return ResponseEntity.ok(post)
    }
}