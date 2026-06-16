// src/main/kotlin/com/unsam/scholarium/service/AccionAdminService.kt
package com.unsam.scholarium.service

import com.unsam.scholarium.dto.AccionAdminResponse
import com.unsam.scholarium.exception.ElementDoesNotExistException
import com.unsam.scholarium.exception.NotAdminException
import com.unsam.scholarium.exception.UnauthorizedException
import com.unsam.scholarium.model.AccionAdmin
import com.unsam.scholarium.model.Portal
import com.unsam.scholarium.model.RolMembresia
import com.unsam.scholarium.model.TipoAccionAdmin
import com.unsam.scholarium.model.Usuario
import com.unsam.scholarium.repository.AccionAdminRepository
import com.unsam.scholarium.repository.MembresiaRepository
import com.unsam.scholarium.repository.PortalRepository
import com.unsam.scholarium.repository.UsuarioRepository
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import kotlin.jvm.optionals.getOrNull

@Service
class AccionAdminService(
    private val accionAdminRepository: AccionAdminRepository,
    private val portalRepository: PortalRepository,
    private val usuarioRepository: UsuarioRepository,
    private val membresiaRepository: MembresiaRepository,
) {

    /**
     * Registra una acción en el historial.
     *
     * Usa REQUIRES_NEW para que el log persista incluso si la transacción
     * llamante hace rollback por algún motivo ajeno al registro. Si no querés
     * ese comportamiento, cambiá por Propagation.REQUIRED.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    fun registrar(
        portal: Portal,
        admin: Usuario,
        tipo: TipoAccionAdmin,
        entidadId: String? = null,
        entidadDescripcion: String? = null,
        motivo: String? = null,
    ): AccionAdmin {
        val accion = AccionAdmin(
            portal = portal,
            admin = admin,
            tipo = tipo,
            entidadId = entidadId,
            entidadDescripcion = entidadDescripcion,
            motivo = motivo,
        )
        return accionAdminRepository.save(accion)
    }

    /**
     * Devuelve el historial paginado de un portal.
     * Solo miembros/admins del portal pueden consultarlo.
     */
    @Transactional(readOnly = true)
    fun getHistorial(
        portalId: Long,
        email: String,
        page: Int = 0,
        size: Int = 30,
    ): org.springframework.data.domain.Page<AccionAdminResponse> {
        val portal = portalRepository.findById(portalId).getOrNull()
            ?: throw ElementDoesNotExistException("Portal no encontrado")

        val usuario = usuarioRepository.findByEmail(email)
            ?: throw ElementDoesNotExistException("Usuario no encontrado")

        val membresia = membresiaRepository.findByUsuarioIdAndPortalId(usuario.id!!, portalId)
            ?: throw UnauthorizedException("No sos miembro de este portal")

        if (membresia.rol != RolMembresia.ADMIN)
            throw NotAdminException("Solo los administradores pueden ver el historial")

        return accionAdminRepository
            .findByPortalId(portalId, PageRequest.of(page, size))
            .map { AccionAdminResponse.fromEntity(it) }
    }
}