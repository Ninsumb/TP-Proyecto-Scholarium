package com.unsam.scholarium.repository

import com.unsam.scholarium.model.Post
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface PostRepository : JpaRepository<Post, UUID> {

    // Posts principales de un foro (no respuestas)
    fun findByForoIdAndPostPadreIsNull(foroId: UUID): List<Post>

    // Respuestas de un post específico
    fun findByPostPadreId(postPadreId: UUID): List<Post>

    // Todos los posts de un foro ordenados por fecha descendente
    fun findByForoIdOrderByCreatedAtDesc(foroId: UUID): List<Post>

    // Contar respuestas de un post (útil para el response DTO)
    fun countByPostPadreId(postPadreId: UUID): Long

    fun findByForoIdAndPostPadreIsNullAndEliminadoFalseOrderByCreatedAtDesc(foroId: UUID): List<Post>
}