package com.unsam.scholarium.service

import com.unsam.scholarium.exception.BusinessException
import com.unsam.scholarium.exception.ElementDoesNotExistException
import com.unsam.scholarium.exception.NotAdminException
import com.unsam.scholarium.model.EstadoMaterial
import com.unsam.scholarium.model.Material
import com.unsam.scholarium.model.RolMembresia
import com.unsam.scholarium.repository.MaterialRepository
import com.unsam.scholarium.repository.MembresiaRepository
import com.unsam.scholarium.repository.UsuarioRepository
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class MaterialService(
    private val materialRepository: MaterialRepository,
    private val usuarioRepository: UsuarioRepository,
    private val membresiaRepository: MembresiaRepository,
) {

    fun aprobarMaterial(materialId: UUID, email: String): Material {

        val material = materialRepository.findById(materialId)
            .orElseThrow { ElementDoesNotExistException("Material no encontrado") }

        if (material.estado == EstadoMaterial.PUBLICADO ||
            material.estado == EstadoMaterial.RECHAZADO
        ) {
            throw BusinessException("El material ya fue procesado")
        }

        val usuario = usuarioRepository.findByEmail(email)
            ?: throw ElementDoesNotExistException("Usuario no encontrado")

        val portal = material.materia.carpeta.portal

        val esAdmin = membresiaRepository
            .existsByUsuarioAndPortalAndRol(usuario, portal, RolMembresia.ADMIN)

        if (!esAdmin) {
            throw NotAdminException("No tenés permisos para aprobar material")
        }

        material.estado = EstadoMaterial.PUBLICADO

        return materialRepository.save(material)
    }
}