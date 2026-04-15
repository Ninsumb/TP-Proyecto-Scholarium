package com.unsam.scholarium.service

import com.unsam.scholarium.dto.PortalUserResponse
import com.unsam.scholarium.exception.BusinessException
import com.unsam.scholarium.exception.ElementDoesNotExistException
import com.unsam.scholarium.exception.NotAdminException
import com.unsam.scholarium.model.Membresia
import com.unsam.scholarium.model.Portal
import com.unsam.scholarium.model.RolMembresia
import com.unsam.scholarium.repository.MembresiaRepository
import com.unsam.scholarium.repository.PortalRepository
import com.unsam.scholarium.repository.UsuarioRepository
import jakarta.transaction.Transactional
import org.springframework.stereotype.Service
import kotlin.jvm.optionals.getOrNull

@Service
class PortalService (
    private val portalRepository: PortalRepository,
    private val membresiaRepository: MembresiaRepository,
    private val usuarioRepository: UsuarioRepository
) {
    fun getById(id: Long): Portal {
        val portal = portalRepository.findById(id).getOrNull()
            ?: throw ElementDoesNotExistException("Portal $id no encontrado")

        return portal
    }

    fun getPortalesByUser(email: String): List<PortalUserResponse> {
        val membresias = membresiaRepository.findAllByUsuarioEmail(email)

        return membresias.map { membresia ->
            val p = membresia.portal!!
            PortalUserResponse(
                id = p.id!!,
                universidad = p.universidad,
                carrera = p.carrera,
                rol = membresia.rol
            )
        }
    }

    @Transactional(rollbackOn = [Exception::class])
    fun create(portal: Portal, email: String) {
        portal.validar()

        if (portalRepository.existsByUniversidadAndCarrera(portal.universidad, portal.carrera)) {
            throw BusinessException("Ya existe un portal para esa universidad y carrera")
        }

        val usuario = usuarioRepository.findByEmail(email)
            ?: throw ElementDoesNotExistException("Usuario no encontrado")

        val membresiaAdmin = Membresia(
            usuario = usuario,
            portal = portal,
            rol = RolMembresia.ADMIN
        )

        portal.addMembresia(membresiaAdmin)

        portalRepository.save(portal)
    }

    @Transactional(rollbackOn = [Exception::class])
    fun patch(portal: Portal, adminId: Long) {
        portal.validar()
        portalRepository.save(portal)
    }
}