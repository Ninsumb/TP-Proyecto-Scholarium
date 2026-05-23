package com.unsam.scholarium.repository

import com.unsam.scholarium.model.Post
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.util.UUID

interface PostRepository : JpaRepository<Post, UUID> {

    // Posts principales de un foro (no respuestas)
    fun findByTableroIdAndPostPadreIsNull(tableroId: UUID): List<Post>

    // Respuestas de un post específico
    fun findByPostPadreId(postPadreId: UUID): List<Post>

    // Todos los posts de un foro ordenados por fecha descendente
    fun findByTableroIdOrderByCreatedAtDesc(tableroId: UUID): List<Post>

    // Contar respuestas de un post (útil para el response DTO)
    fun countByPostPadreId(postPadreId: UUID): Long

    fun findByTableroIdAndPostPadreIsNullAndEliminadoFalseOrderByCreatedAtDesc(tableroId: UUID): List<Post>

    @Query(
        value = """
        WITH RECURSIVE hilo AS (
            -- Caso base: respuestas directas al post raíz
            SELECT p.* FROM posts p
            WHERE p.post_padre_id = :postId

            UNION ALL

            -- Caso recursivo: respuestas a respuestas
            SELECT p.* FROM posts p
            INNER JOIN hilo h ON p.post_padre_id = h.id
        )
        SELECT * FROM hilo ORDER BY created_at ASC
    """,
        nativeQuery = true
    )
    fun findAllRespuestasRecursivas(postId: UUID): List<Post>
}