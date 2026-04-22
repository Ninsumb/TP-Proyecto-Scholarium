package com.unsam.scholarium.service

import com.unsam.scholarium.exception.ElementDoesNotExistException
import com.unsam.scholarium.exception.NotAdminException
import com.unsam.scholarium.model.Estado
import com.unsam.scholarium.model.Membresia
import com.unsam.scholarium.model.RolMembresia
import com.unsam.scholarium.model.Usuario
import com.unsam.scholarium.repository.MembresiaRepository
import com.unsam.scholarium.repository.SolicitudRepository
import com.unsam.scholarium.repository.UsuarioRepository
import jakarta.transaction.Transactional
import org.springframework.stereotype.Service

@Service
class SolicitudService(
    val solicitudRepository: SolicitudRepository,
    val membresiaRepository: MembresiaRepository,
    val usuarioRepository: UsuarioRepository
) {

    @Transactional
    fun aprobarSolicitud(solicitudId: Long, emailAdmin: String){
        val solicitud = solicitudRepository.findById(solicitudId)
            .orElseThrow{ ElementDoesNotExistException("La solicitud no existe") }

        val admin = usuarioRepository.findByEmail(emailAdmin)
            ?: throw ElementDoesNotExistException("El usuario no existe")

        val esAdmin = membresiaRepository.existsByUsuarioIdAndPortalIdAndRol(
            admin.id!!,
            solicitud.portal.id!!,
            RolMembresia.ADMIN
        )

        if(!esAdmin){
            throw NotAdminException("No tenes permisos para aprobar esta solicitud")
        }

        solicitud.estado = Estado.ACEPTADA

        val yaEsMiembro = membresiaRepository.existsByUsuarioIdAndPortalId(
            solicitud.usuario.id!!,
            solicitud.portal.id!!
        )

        if(!yaEsMiembro){
            val nuevaMembresia = Membresia(
                usuario = solicitud.usuario,
                portal = solicitud.portal,
                rol= RolMembresia.MIEMBRO
            )
            membresiaRepository.save(nuevaMembresia)
        }

        solicitudRepository.save(solicitud)
    }
}