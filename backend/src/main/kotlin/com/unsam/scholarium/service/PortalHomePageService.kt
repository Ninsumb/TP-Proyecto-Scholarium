package com.unsam.scholarium.service

import com.unsam.scholarium.dto.UpdateBlocksRequest
import com.unsam.scholarium.exception.BusinessException
import com.unsam.scholarium.exception.ElementDoesNotExistException
import com.unsam.scholarium.exception.NotAdminException
import com.unsam.scholarium.model.Block
import com.unsam.scholarium.model.Portal
import com.unsam.scholarium.model.PortalHomePage
import com.unsam.scholarium.model.RolMembresia
import com.unsam.scholarium.repository.MembresiaRepository
import com.unsam.scholarium.repository.PortalHomePageRepository
import com.unsam.scholarium.repository.PortalRepository
import com.unsam.scholarium.repository.UsuarioRepository
import jakarta.transaction.Transactional
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import kotlin.jvm.optionals.getOrNull

@Service
class PortalHomePageService(
    private val portalHomePageRepository: PortalHomePageRepository,
    private val portalRepository: PortalRepository,
    private val usuarioRepository: UsuarioRepository,
    private val membresiaRepository: MembresiaRepository
) {

    fun getBlocks(portalId: Long): List<Block> {
        val portal = portalRepository.findById(portalId).getOrNull()
            ?: throw ElementDoesNotExistException("Portal $portalId no encontrado")

        val homePage = portalHomePageRepository.findByPortalId(portalId)

        return homePage?.blocks ?: getDefaultBlocks(portal)
    }

    @Transactional(rollbackOn = [Exception::class])
    fun updateBlocks(
        portalId: Long,
        email: String,
        request: UpdateBlocksRequest
    ): PortalHomePage {
        // Validaciones
        val portal = portalRepository.findById(portalId).getOrNull()
            ?: throw ElementDoesNotExistException("Portal $portalId no encontrado")

        val usuario = usuarioRepository.findByEmail(email)
            ?: throw ElementDoesNotExistException("Usuario no encontrado")

        val membresia = membresiaRepository.findByUsuarioIdAndPortalId(usuario.id!!, portalId)
            ?: throw NotAdminException("No sos miembro del portal")

        if (membresia.rol != RolMembresia.ADMIN) {
            throw NotAdminException("Solo los administradores pueden editar la página")
        }

        // Validaciones de negocio
        if (request.blocks.isEmpty()) {
            throw BusinessException("Debe haber al menos un bloque")
        }

        if (request.blocks.size > 30) {
            throw BusinessException("Máximo 30 bloques permitidos")
        }

        // Actualizar o crear
        val existingHomePage = portalHomePageRepository.findByPortalId(portalId)

        return if (existingHomePage != null) {
            val updated = existingHomePage.copy(
                blocks = request.blocks,
                updatedAt = LocalDateTime.now(),
                updatedBy = usuario.id
            )
            portalHomePageRepository.save(updated)
        } else {
            val newHomePage = PortalHomePage(
                portalId = portalId,
                blocks = request.blocks,
                updatedBy = usuario.id
            )
            portalHomePageRepository.save(newHomePage)
        }
    }

    private fun getDefaultBlocks(portal: Portal): List<Block> {
        return listOf(
            Block(
                type = "header",
                id = "default-1",
                data = mapOf(
                    "title" to portal.carrera,
                    "description" to (portal.descripcion ?: "Descripción del portal académico")
                )
            ),
            Block(
                type = "textSection",
                id = "default-2",
                data = mapOf(
                    "title" to "🎉 ¡Tu portal está listo!",
                    "content" to """
                        Este portal recién salió del horno. Ahora podés personalizarlo completamente:
                        
                        • Agregá bloques de estadísticas
                        • Incluí información de contacto
                        • Subí imágenes y contenido enriquecido
                        • Organizá todo como prefieras
                        
                        Presioná el botón "Editar Página" en la esquina superior derecha para comenzar.
                    """.trimIndent()
                )
            )
        )
    }
}