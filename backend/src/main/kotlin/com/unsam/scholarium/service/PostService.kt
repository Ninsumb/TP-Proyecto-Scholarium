package com.unsam.scholarium.service

import com.unsam.scholarium.dto.CrearPostRequest
import com.unsam.scholarium.dto.CrearRespuestaRequest
import com.unsam.scholarium.dto.AutorDTO
import com.unsam.scholarium.dto.EditarPostRequest
import com.unsam.scholarium.dto.PostResponse
import com.unsam.scholarium.exception.BusinessException
import com.unsam.scholarium.exception.ElementDoesNotExistException
import com.unsam.scholarium.exception.NotAdminException
import com.unsam.scholarium.model.Post
import com.unsam.scholarium.model.PostRevision
import com.unsam.scholarium.model.RolMembresia
import com.unsam.scholarium.repository.ForoRepository
import com.unsam.scholarium.repository.MembresiaRepository
import com.unsam.scholarium.repository.PostRepository
import com.unsam.scholarium.repository.PostRevisionRepository
import com.unsam.scholarium.repository.UsuarioRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID


@Service
class PostService(
    private val postRepository: PostRepository,
    private val foroRepository: ForoRepository,
    private val usuarioRepository: UsuarioRepository,
    private val membresiaRepository: MembresiaRepository,
    private val postRevisionRepository: PostRevisionRepository
) {

    // ── helpers privados ──────────────────────────────────────────────────────

    private fun resolverUsuario(email: String) =
        usuarioRepository.findByEmail(email)
            ?: throw ElementDoesNotExistException("El usuario autenticado no existe")

    private fun resolverTablero(tableroId: UUID) =
        foroRepository.findById(tableroId)
            .orElseThrow { ElementDoesNotExistException("El tablero no existe") }

    private fun validarMembresía(usuarioId: Long, portalId: Long) {
        val esMiembro = membresiaRepository.existsByUsuarioIdAndPortalIdAndRol(
            usuarioId, portalId, RolMembresia.MIEMBRO
        ) || membresiaRepository.existsByUsuarioIdAndPortalIdAndRol(
            usuarioId, portalId, RolMembresia.ADMIN
        )

        if (!esMiembro) throw NotAdminException("No tenés permisos para operar en este portal")
    }

    private fun toResponse(post: Post): PostResponse {
        val cantidadRespuestas = postRepository.countByPostPadreId(post.id!!)
        return if (post.eliminado) {
            PostResponse(
                id = post.id,
                titulo = null,
                contenido = null,
                tableroId = post.tablero.id!!,
                autor = null,
                postPadreId = post.postPadre?.id,
                cantidadRespuestas = cantidadRespuestas,
                eliminado = true,
                createdAt = post.createdAt!!.toInstant(),
                updatedAt = post.updatedAt!!.toInstant()
            )
        } else {
            PostResponse(
                id = post.id,
                titulo = post.titulo,
                contenido = post.contenido,
                tableroId = post.tablero.id!!,
                autor = AutorDTO(id = post.autor.id!!, nombre = post.autor.nombre),
                postPadreId = post.postPadre?.id,
                cantidadRespuestas = cantidadRespuestas,
                eliminado = false,
                createdAt = post.createdAt!!.toInstant(),
                updatedAt = post.updatedAt!!.toInstant()
            )
        }
    }

    // ── casos de uso ──────────────────────────────────────────────────────────

    @Transactional
    fun crearPost(tableroId: UUID, email: String, request: CrearPostRequest): PostResponse {
        val usuario = resolverUsuario(email)
        val tablero = resolverTablero(tableroId)

        validarMembresía(usuario.id!!, tablero.portal.id!!)

        val post = Post(
            titulo = request.titulo,
            contenido = request.contenido,
            tablero = tablero,
            autor = usuario
        )

        val guardado = postRepository.save(post)
        return toResponse(guardado)
    }

    @Transactional(readOnly = true)
    fun listarPostsDeTablero(tableroId: UUID, email: String): List<PostResponse> {
        val usuario = resolverUsuario(email)
        val tablero = resolverTablero(tableroId)

        validarMembresía(usuario.id!!, tablero.portal.id!!)

        return postRepository
            .findByTableroIdAndPostPadreIsNullAndEliminadoFalseOrderByCreatedAtDesc(tableroId)
            .map { toResponse(it) }
    }

    @Transactional
    fun responderPost(postPadreId: UUID, email: String, request: CrearRespuestaRequest): PostResponse {
        val usuario = resolverUsuario(email)

        val postPadre = postRepository.findById(postPadreId)
            .orElseThrow { ElementDoesNotExistException("El post no existe") }

        if (postPadre.eliminado) {
            throw BusinessException("No se puede responder a un post eliminado")
        }

        // Solo 1 nivel de threading
        if (postPadre.postPadre != null) {
            throw BusinessException("No se puede responder a una respuesta. Solo se permite un nivel de threading.")
        }

        validarMembresía(usuario.id!!, postPadre.tablero.portal.id!!)

        val respuesta = Post(
            titulo = null,
            contenido = request.contenido,
            tablero = postPadre.tablero,
            autor = usuario,
            postPadre = postPadre
        )

        val guardada = postRepository.save(respuesta)
        return toResponse(guardada)
    }

    @Transactional(readOnly = true)
    fun listarRespuestasDePost(postId: UUID, email: String): List<PostResponse> {
        val usuario = resolverUsuario(email)

        val post = postRepository.findById(postId)
            .orElseThrow { ElementDoesNotExistException("El post no existe") }

        // Si el post padre está eliminado, técnicamente podés consultar
        // sus respuestas igual. No lo bloqueás, pero tampoco lo exponés desde la UI.
        // Si querés bloquearlo completamente, descomentás esto:
        // if (post.eliminado) throw ElementDoesNotExistException("El post no existe")

        validarMembresía(usuario.id!!, post.tablero.portal.id!!)

        return postRepository
            .findByPostPadreId(postId)
            .map { toResponse(it) }
    }

    @Transactional
    fun editarPost(postId: UUID, email: String, request: EditarPostRequest): PostResponse {
        val usuario = resolverUsuario(email)

        val post = postRepository.findById(postId)
            .orElseThrow { ElementDoesNotExistException("El post no existe") }

        if (post.eliminado) throw ElementDoesNotExistException("El post no existe")
        if (post.autor.id != usuario.id) throw NotAdminException("No tenés permisos para editar este post")

        if (post.contenido == request.contenido && post.titulo == request.titulo) {
            return toResponse(post) // Nada cambia, retorna sin guardar revisión ni tocar updatedAt
        }

        // Guardar revisión del contenido anterior ANTES de modificar
        //TODO: Evaluar que quizás lo podemos hacer con un script sql
        val revision = PostRevision(
            postId = post.id!!,
            oldContent = post.contenido,
            editedAt = Instant.now(),
            editedBy = usuario
        )
        postRevisionRepository.save(revision)

        post.contenido = request.contenido
        request.titulo?.let { post.titulo = it }

        return toResponse(postRepository.save(post))
    }

    @Transactional
    fun eliminarPost(postId: UUID, email: String) {
        val usuario = resolverUsuario(email)

        val post = postRepository.findById(postId)
            .orElseThrow { ElementDoesNotExistException("El post no existe") }

        if (post.eliminado) throw ElementDoesNotExistException("El post no existe")

        val esAutor = post.autor.id == usuario.id
        val esAdmin = membresiaRepository.existsByUsuarioIdAndPortalIdAndRol(
            usuario.id!!, post.tablero.portal.id!!, RolMembresia.ADMIN
        )

        if (!esAutor && !esAdmin) throw NotAdminException("No tenés permisos para eliminar este post")

        post.eliminado = true
        postRepository.save(post)
    }
}