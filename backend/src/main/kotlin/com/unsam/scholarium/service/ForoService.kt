package com.unsam.scholarium.service

import com.unsam.scholarium.dto.ForoResponse
import com.unsam.scholarium.dto.EtiquetaSimpleResponse
import com.unsam.scholarium.exception.ElementDoesNotExistException
import com.unsam.scholarium.exception.NotAdminException
import com.unsam.scholarium.exception.UnauthorizedException
import com.unsam.scholarium.model.RolMembresia
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
    private val membresiaRepository: MembresiaRepository
) {

    @Transactional(readOnly = true)
    fun obtenerForosDePortal(
        portalId: Long,
        emailUsuario: String,
        etiquetaNombre: String? = null
    ): List<ForoResponse> {

        
        val portal = portalRepository.findById(portalId)
            .orElseThrow { ElementDoesNotExistException("El portal no existe") }


        val usuario = usuarioRepository.findByEmail(emailUsuario)
            ?: throw ElementDoesNotExistException("El usuario autenticado no existe")

        val membresia = membresiaRepository.findByUsuarioIdAndPortalId(usuario.id!!, portal.id!!)
            ?: throw UnauthorizedException("No sos miembro de este portal")

        if (membresia.rol !in listOf(RolMembresia.MIEMBRO, RolMembresia.ADMIN)) {
            throw UnauthorizedException("No tenés permisos para visualizar las conversaciones del foro de este portal")
        }


        val foros = foroRepository.findByPortalIdWithEtiqueta(portalId, etiquetaNombre)


        return foros.map { foro ->
            ForoResponse(
                id = foro.id!!,
                nombre = foro.nombre,
                etiqueta = EtiquetaSimpleResponse(
                    id = foro.etiqueta.id!!,
                    nombre = foro.etiqueta.nombre
                ),
                createdAt = foro.createdAt!!.toInstant(),
                updatedAt = foro.updatedAt?.toInstant()
            )
        }
    }
}