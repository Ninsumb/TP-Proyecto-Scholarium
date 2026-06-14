package com.unsam.scholarium.service

import com.unsam.scholarium.dto.CrearPostRequest
import com.unsam.scholarium.dto.CrearRespuestaRequest
import com.unsam.scholarium.dto.AutorDTO
import com.unsam.scholarium.dto.EditarPostRequest
import com.unsam.scholarium.dto.PostResponse
import com.unsam.scholarium.exception.BusinessException
import com.unsam.scholarium.exception.ElementDoesNotExistException
import com.unsam.scholarium.exception.NotAdminException
import com.unsam.scholarium.exception.UnauthorizedException
import com.unsam.scholarium.model.Post
import com.unsam.scholarium.model.PostRevision
import com.unsam.scholarium.model.RolMembresia
import com.unsam.scholarium.model.TipoAcceso
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

    // ── Helpers privados ──────────────────────────────────────────────────────

    private fun resolverUsuario(email: String) =
        usuarioRepository.findByEmail(email)
            ?: throw ElementDoesNotExistException("El usuario autenticado no existe")

    private fun resolverTablero(tableroId: UUID) =
        foroRepository.findById(tableroId)
            .orElseThrow { ElementDoesNotExistException("El tablero no existe") }

    /**
     * Acceso de LECTURA: pasa si es miembro/admin, o si el portal es ABIERTO.
     */
    private fun validarAccesoLectura(usuarioId: Long, portalId: Long) {
        val membresia = membresiaRepository.findByUsuarioIdAndPortalId(usuarioId, portalId)
        if (membresia != null && membresia.rol in listOf(RolMembresia.MIEMBRO, RolMembresia.ADMIN)) return

        // No es miembro — revisar tipoAcceso
        val tablero = foroRepository.findByPortalId(portalId).firstOrNull()
        val portal = tablero?.portal
            ?: throw ElementDoesNotExistException("Portal no encontrado")

        if (portal.tipoAcceso != TipoAcceso.ABIERTO) {
            throw UnauthorizedException("No sos miembro de este portal")
        }
    }

    /**
     * Acceso de LECTURA desde un post (ya tenemos el portal por el tablero).
     */
    private fun validarAccesoLecturaDesdePortalId(usuarioId: Long, portalId: Long, portal: com.unsam.scholarium.model.Portal) {
        val membresia = membresiaRepository.findByUsuarioIdAndPortalId(usuarioId, portalId)
        if (membresia != null && membresia.rol in listOf(RolMembresia.MIEMBRO, RolMembresia.ADMIN)) return
        if (portal.tipoAcceso != TipoAcceso.ABIERTO) {
            throw UnauthorizedException("No sos miembro de este portal")
        }
    }

    /**
     * Acceso de ESCRITURA: siempre requiere membresía activa.
     */
    private fun validarAccesoEscritura(usuarioId: Long, portalId: Long) {
        val esMiembro = membresiaRepository.existsByUsuarioIdAndPortalIdAndRol(
            usuarioId, portalId, RolMembresia.MIEMBRO
        ) || membresiaRepository.existsByUsuarioIdAndPortalIdAndRol(
            usuarioId, portalId, RolMembresia.ADMIN
        )
        if (!esMiembro) throw UnauthorizedException("No tenés permisos para operar en este portal")
    }

    private fun toResponse(post: Post): PostResponse {
        val cantidadRespuestas = postRepository.countAllRespuestasRecursivas(post.id!!)
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
                autor = AutorDTO(
                    id = post.autor.id!!,
                    nombre = post.autor.nombre,
                    fotoPerfil = post.autor.fotoPerfil
                ),
                postPadreId = post.postPadre?.id,
                cantidadRespuestas = cantidadRespuestas,
                eliminado = false,
                createdAt = post.createdAt!!.toInstant(),
                updatedAt = post.updatedAt!!.toInstant()
            )
        }
    }

    // ── Casos de uso ──────────────────────────────────────────────────────────

    @Transactional
    fun crearPost(tableroId: UUID, email: String, request: CrearPostRequest): PostResponse {
        val usuario = resolverUsuario(email)
        val tablero = resolverTablero(tableroId)
        // Crear posts siempre requiere ser miembro
        validarAccesoEscritura(usuario.id!!, tablero.portal.id!!)

        val post = Post(
            titulo = request.titulo,
            contenido = request.contenido,
            tablero = tablero,
            autor = usuario
        )
        return toResponse(postRepository.save(post))
    }

    @Transactional(readOnly = true)
    fun listarPostsDeTablero(tableroId: UUID, email: String): List<PostResponse> {
        val usuario = resolverUsuario(email)
        val tablero = resolverTablero(tableroId)
        validarAccesoLecturaDesdePortalId(usuario.id!!, tablero.portal.id!!, tablero.portal)

        return postRepository
            .findByTableroIdAndPostPadreIsNullAndEliminadoFalseOrderByCreatedAtDesc(tableroId)
            .map { toResponse(it) }
    }

    @Transactional
    fun responderPost(postPadreId: UUID, email: String, request: CrearRespuestaRequest): PostResponse {
        val usuario = resolverUsuario(email)
        val postPadre = postRepository.findById(postPadreId)
            .orElseThrow { ElementDoesNotExistException("El post no existe") }

        if (postPadre.eliminado) throw BusinessException("No se puede responder a un post eliminado")

        // Responder siempre requiere membresía
        validarAccesoEscritura(usuario.id!!, postPadre.tablero.portal.id!!)

        val respuesta = Post(
            titulo = null,
            contenido = request.contenido,
            tablero = postPadre.tablero,
            autor = usuario,
            postPadre = postPadre
        )
        return toResponse(postRepository.save(respuesta))
    }

    @Transactional(readOnly = true)
    fun listarRespuestasDePost(postId: UUID, email: String): List<PostResponse> {
        val usuario = resolverUsuario(email)
        val post = postRepository.findById(postId)
            .orElseThrow { ElementDoesNotExistException("El post no existe") }

        validarAccesoLecturaDesdePortalId(usuario.id!!, post.tablero.portal.id!!, post.tablero.portal)

        return postRepository.findAllRespuestasRecursivas(postId).map { toResponse(it) }
    }

    @Transactional
    fun editarPost(postId: UUID, email: String, request: EditarPostRequest): PostResponse {
        val usuario = resolverUsuario(email)
        val post = postRepository.findById(postId)
            .orElseThrow { ElementDoesNotExistException("El post no existe") }

        if (post.eliminado) throw ElementDoesNotExistException("El post no existe")
        if (post.autor.id != usuario.id) throw NotAdminException("No tenés permisos para editar este post")

        if (post.contenido == request.contenido && post.titulo == request.titulo) {
            return toResponse(post)
        }

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

    @Transactional(readOnly = true)
    fun buscarPostsEnTablero(tableroId: UUID, email: String, q: String): List<PostResponse> {
        if (q.isBlank()) return emptyList()

        val usuario = resolverUsuario(email)
        val tablero = resolverTablero(tableroId)
        validarAccesoLecturaDesdePortalId(usuario.id!!, tablero.portal.id!!, tablero.portal)

        return postRepository.buscarPostsEnTablero(tableroId, q.trim())
            .map { toResponse(it) }
    }
}