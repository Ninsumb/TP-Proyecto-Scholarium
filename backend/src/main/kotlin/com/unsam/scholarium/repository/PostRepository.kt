package com.unsam.scholarium.repository

import com.unsam.scholarium.model.Post
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
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

    @Query(
        value = """
        WITH RECURSIVE hilo AS (
            SELECT p.id FROM posts p
            WHERE p.post_padre_id = :postId

            UNION ALL

            SELECT p.id FROM posts p
            INNER JOIN hilo h ON p.post_padre_id = h.id
        )
        SELECT COUNT(*) FROM hilo
    """,
        nativeQuery = true
    )
    fun countAllRespuestasRecursivas(postId: UUID): Long

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

    @Query(
        value = """
SELECT DISTINCT p.*
FROM posts p
WHERE p.tablero_id = :tableroId
  AND p.post_padre_id IS NULL
  AND p.eliminado = false
  AND p.ocultado = false
  AND (
      EXISTS (
          SELECT 1
          FROM unnest(:tokens) AS token
          WHERE lower(COALESCE(p.titulo, '')) LIKE '%' || lower(token) || '%'
             OR lower(p.contenido)            LIKE '%' || lower(token) || '%'
      )
      OR EXISTS (
          WITH RECURSIVE hilo AS (
              SELECT r.id, r.contenido, r.eliminado, r.ocultado
              FROM posts r
              WHERE r.post_padre_id = p.id
              UNION ALL
              SELECT r2.id, r2.contenido, r2.eliminado, r2.ocultado
              FROM posts r2
              INNER JOIN hilo h ON r2.post_padre_id = h.id
          )
          SELECT 1
          FROM hilo
          CROSS JOIN unnest(:tokens) AS token
          WHERE hilo.eliminado = false
            AND hilo.ocultado = false
            AND lower(hilo.contenido) LIKE '%' || lower(token) || '%'
      )
  )
ORDER BY p.created_at DESC
""",
        nativeQuery = true
    )
    fun buscarPostsEnTablero(
        @Param("tableroId") tableroId: UUID,
        @Param("tokens") tokens: Array<String>
    ): List<Post>
}