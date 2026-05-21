package com.unsam.scholarium.service

import com.unsam.scholarium.dto.CrearTableroRequest
import com.unsam.scholarium.dto.TableroResponse
import com.unsam.scholarium.dto.EtiquetaSimpleResponse
import com.unsam.scholarium.exception.ElementDoesNotExistException
import com.unsam.scholarium.exception.NotAdminException
import com.unsam.scholarium.exception.UnauthorizedException
import com.unsam.scholarium.model.RolMembresia
import com.unsam.scholarium.model.Tablero
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

        val membresia = membresiaRepository.findByUsuarioIdAndPortalId(usuario.id!!, portal.id!!)
            ?: throw UnauthorizedException("No sos miembro de este portal")

        if (membresia.rol != RolMembresia.ADMIN) {
            throw NotAdminException("Solo los administradores pueden crear tableros")
        }

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

        return TableroResponse(
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

        val membresia = membresiaRepository.findByUsuarioIdAndPortalId(usuario.id!!, portal.id!!)
            ?: throw UnauthorizedException("No sos miembro de este portal")

        if (membresia.rol !in listOf(RolMembresia.MIEMBRO, RolMembresia.ADMIN)) {
            throw UnauthorizedException("No tenés permisos para visualizar las conversaciones del foro de este portal")
        }


        val tableros = foroRepository.findByPortalIdWithEtiqueta(portalId, etiquetaNombre)


        return tableros.map { tablero ->
            TableroResponse(
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
    }
}