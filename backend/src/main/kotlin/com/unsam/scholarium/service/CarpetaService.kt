package com.unsam.scholarium.service

import com.unsam.scholarium.exception.BusinessException
import com.unsam.scholarium.exception.ElementDoesNotExistException
import com.unsam.scholarium.exception.NotAdminException
import com.unsam.scholarium.model.RolMembresia
import com.unsam.scholarium.repository.CarpetaRepository
import com.unsam.scholarium.repository.MateriaRepository
import com.unsam.scholarium.repository.MembresiaRepository
import com.unsam.scholarium.repository.UsuarioRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class CarpetaService(
    private val carpetaRepository: CarpetaRepository,
    private val materiaRepository: MateriaRepository,
    private val usuarioRepository: UsuarioRepository,
    private val membresiaRepository: MembresiaRepository
) {

    @Transactional
    fun eliminarCarpeta(carpetaId: UUID, emailAdmin: String) {
        val carpeta = carpetaRepository.findById(carpetaId)
            .orElseThrow { ElementDoesNotExistException("La carpeta no existe") }

        val usuario = usuarioRepository.findByEmail(emailAdmin)
            ?: throw ElementDoesNotExistException("El usuario autenticado no existe")

        val esAdmin = membresiaRepository.existsByUsuarioIdAndPortalIdAndRol(
            usuario.id!!,
            carpeta.portal.id!!,
            RolMembresia.ADMIN
        )

        if (!esAdmin) {
            throw NotAdminException("No tenés permisos para eliminar esta carpeta")
        }

        val tieneSubcarpetas = carpetaRepository.existsByCarpetaPadreId(carpeta.id!!)
        val tieneMaterias = materiaRepository.existsByCarpetaId(carpeta.id)

        if (tieneSubcarpetas || tieneMaterias) {
            throw BusinessException(
                "No se puede eliminar una carpeta que contiene subcarpetas o materias. Primero debe moverlas o eliminarlas."
            )
        }

        carpetaRepository.delete(carpeta)
    }
}