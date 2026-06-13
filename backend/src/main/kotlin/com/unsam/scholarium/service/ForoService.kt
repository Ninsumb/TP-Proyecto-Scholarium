package com.unsam.scholarium.service

import com.unsam.scholarium.dto.CrearTableroRequest
import com.unsam.scholarium.dto.TableroResponse
import com.unsam.scholarium.dto.EtiquetaSimpleResponse
import com.unsam.scholarium.exception.ElementDoesNotExistException
import com.unsam.scholarium.exception.NotAdminException
import com.unsam.scholarium.exception.UnauthorizedException
import com.unsam.scholarium.model.RolMembresia
import com.unsam.scholarium.model.Tablero
import com.unsam.scholarium.model.TipoAcceso
import com.unsam.scholarium.repository.EtiquetaRepository
import com.unsam.scholarium.repository.ForoRepository
import com.unsam.scholarium.repository.MembresiaRepository
import com.unsam.scholarium.repository.PortalRepository
import com.unsam.scholarium.repository.UsuarioRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ForoService(
    private val foroRepository: ForoRepository,
    private val portalRepository: PortalRepository,
    private val usuarioRepository: UsuarioRepository,
    private val membresiaRepository: MembresiaRepository,
    private val etiquetaRepository: EtiquetaRepository
) {

    // ── Helpers de autorización ───────────────────────────────────────────────

    /**
     * Verifica acceso de LECTURA al foro:
     * - Miembro/Admin: siempre.
     * - No-miembro: solo si el portal es ABIERTO.
     */
    private fun validarAccesoLectura(usuarioId: Long, portalId: Long) {
        val membresia = membresiaRepository.findByUsuarioIdAndPortalId(usuarioId, portalId)
        if (membresia != null && membresia.rol in listOf(RolMembresia.MIEMBRO, RolMembresia.ADMIN)) return

        // No es miembro → solo puede pasar si el portal es ABIERTO
        val portal = portalRepository.findById(portalId)
            .orElseThrow { ElementDoesNotExistException("El portal no existe") }

        if (portal.tipoAcceso != TipoAcceso.ABIERTO) {
            throw UnauthorizedException("No sos miembro de este portal")
        }
    }

    /**
     * Verifica acceso de ESCRITURA (crear tableros):
     * Siempre requiere ser ADMIN, sin excepción de tipoAcceso.
     */
    private fun validarAdmin(usuarioId: Long, portalId: Long) {
        val membresia = membresiaRepository.findByUsuarioIdAndPortalId(usuarioId, portalId)
        if (membresia?.rol != RolMembresia.ADMIN) {
            throw NotAdminException("Solo los administradores pueden crear tableros")
        }
    }

    // ── Casos de uso ──────────────────────────────────────────────────────────

    @Transactional
    fun crearTablero(
        portalId: Long,
        emailUsuario: String,
        request: CrearTableroRequest
    ): TableroResponse {
        val portal = portalRepository.findById(portalId)
            .orElseThrow { ElementDoesNotExistException("El portal no existe") }

        val usuario = usuarioRepository.findByEmail(emailUsuario)
            ?: throw ElementDoesNotExistException("El usuario autenticado no existe")

        validarAdmin(usuario.id!!, portalId)

        val etiqueta = etiquetaRepository.findByNombreAndPortal(request.etiqueta, portal)
            ?: throw ElementDoesNotExistException("La etiqueta '${request.etiqueta}' no existe en este portal")

        val tablero = foroRepository.saveAndFlush(
            Tablero(
                nombre = request.nombre,
                descripcion = request.descripcion,
                etiqueta = etiqueta,
                portal = portal
            )
        )

        return toTableroResponse(tablero)
    }

    @Transactional(readOnly = true)
    fun obtenerTablerosDePortal(
        portalId: Long,
        emailUsuario: String,
        etiquetaNombre: String? = null
    ): List<TableroResponse> {
        val portal = portalRepository.findById(portalId)
            .orElseThrow { ElementDoesNotExistException("El portal no existe") }

        val usuario = usuarioRepository.findByEmail(emailUsuario)
            ?: throw ElementDoesNotExistException("El usuario autenticado no existe")

        validarAccesoLectura(usuario.id!!, portalId)

        return foroRepository.findByPortalIdWithEtiqueta(portalId, etiquetaNombre)
            .map { toTableroResponse(it) }
    }

    private fun toTableroResponse(tablero: Tablero) = TableroResponse(
        id = tablero.id!!,
        nombre = tablero.nombre,
        descripcion = tablero.descripcion,
        etiqueta = EtiquetaSimpleResponse(
            id = tablero.etiqueta.id!!,
            nombre = tablero.etiqueta.nombre
        ),
        createdAt = tablero.createdAt!!.toInstant(),
        updatedAt = tablero.updatedAt?.toInstant()
    )
}