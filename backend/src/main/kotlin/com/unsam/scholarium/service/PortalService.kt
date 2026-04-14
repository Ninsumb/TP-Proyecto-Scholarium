package com.unsam.scholarium.service

import com.unsam.scholarium.exception.ElementDoesNotExistException
import com.unsam.scholarium.exception.NotAdminException
import com.unsam.scholarium.model.Portal
import com.unsam.scholarium.dto.PortalResponse
import com.unsam.scholarium.mapper.PortalMapper
import com.unsam.scholarium.repository.PortalRepository
import jakarta.transaction.Transactional
import org.springframework.stereotype.Service
import kotlin.jvm.optionals.getOrNull

@Service
class PortalService (
    private val portalRepository: PortalRepository,
    private val usuarioService: UsuarioService
) {
    fun getById(id: Long): PortalResponse {
        val portal = portalRepository.findById(id).getOrNull()
            ?: throw ElementDoesNotExistException("Portal $id no encontrado")

        return PortalMapper.toDTO(portal)
    }

    @Transactional(rollbackOn = [Exception::class])
    fun create(portal: Portal, adminId: Long) {
        portal.validar()
        val admin = usuarioService.buscar(adminId)

        if (portal.usuarioPuedeCrear(admin)) {
            portalRepository.save(portal)
        } else {
            throw NotAdminException("Faltan permisos de administrador")
        }
    }

    @Transactional(rollbackOn = [Exception::class])
    fun patch(portal: Portal, adminId: Long) {
        portal.validar()
        portalRepository.save(portal)
    }
}