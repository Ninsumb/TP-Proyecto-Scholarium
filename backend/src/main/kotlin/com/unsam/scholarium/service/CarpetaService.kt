package com.unsam.scholarium.service

import com.unsam.scholarium.exception.BusinessException
import com.unsam.scholarium.exception.ElementDoesNotExistException
import com.unsam.scholarium.exception.NotAdminException
import com.unsam.scholarium.model.Carpeta
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
    @Transactional
    fun moverCarpeta(carpetaId: UUID, nuevoPadreId: UUID?, emailAdmin: String) {
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
            throw NotAdminException("No tenés permisos para mover esta carpeta")
        }

        if (nuevoPadreId == null) {
            carpeta.carpetaPadre = null
        } else {
            val nuevoPadre = carpetaRepository.findById(nuevoPadreId)
                .orElseThrow { ElementDoesNotExistException("La carpeta padre no existe") }

            if (carpeta.portal.id != nuevoPadre.portal.id) {
                throw BusinessException("No se puede mover una carpeta entre portales diferentes")
            }

            if (creariaciclo(carpeta, nuevoPadre)) {
                throw BusinessException(
                    "No se puede mover la carpeta: se crearía un ciclo en la jerarquía. " +
                            "Una carpeta no puede ser movida dentro de sí misma o de sus descendientes."
                )
            }

            carpeta.carpetaPadre = nuevoPadre
        }

        carpetaRepository.save(carpeta)
    }

    private fun creariaciclo(carpeta: Carpeta, nuevoPadre: Carpeta): Boolean {
        // Caso trivial: intentar hacer que una carpeta sea su propio padre
        if (carpeta.id == nuevoPadre.id) return true

        // Recorrer la cadena de ancestros del nuevo padre
        // Si en algún momento encontramos que la carpeta que queremos mover
        // YA es ancestro del nuevo padre, entonces crear esta relación formaría un ciclo
        var ancestroActual: Carpeta? = nuevoPadre

        while (ancestroActual != null) {
            if (ancestroActual.id == carpeta.id) {
                return true
            }
            ancestroActual = ancestroActual.carpetaPadre
        }

        return false
    }
}