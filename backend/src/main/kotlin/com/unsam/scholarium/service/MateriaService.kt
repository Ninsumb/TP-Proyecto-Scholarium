package com.unsam.scholarium.service

import com.unsam.scholarium.dto.CrearMateriaRequest
import com.unsam.scholarium.exception.BusinessException
import com.unsam.scholarium.exception.ElementDoesNotExistException
import com.unsam.scholarium.exception.NotAdminException
import com.unsam.scholarium.model.Materia
import com.unsam.scholarium.model.RolMembresia
import com.unsam.scholarium.repository.CarpetaRepository
import com.unsam.scholarium.repository.MateriaRepository
import com.unsam.scholarium.repository.MembresiaRepository
import com.unsam.scholarium.repository.UsuarioRepository
import jakarta.transaction.Transactional
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class MateriaService(
    private val materiaRepository: MateriaRepository,
    private val usuarioRepository: UsuarioRepository,
    private val membresiaRepository: MembresiaRepository,
    private val carpetaRepository: CarpetaRepository
) {

    @Transactional(rollbackOn = [Exception::class])
    fun crearMateria(carpetaId: UUID, email: String, request: CrearMateriaRequest): Materia {
        val usuario = usuarioRepository.findByEmail(email)
            ?: throw ElementDoesNotExistException("Usuario no encontrado")

        val carpeta = carpetaRepository.findById(carpetaId)
            .orElseThrow { ElementDoesNotExistException("La carpeta no existe") }

        val portal = carpeta.portal

        val esAdmin = membresiaRepository
            .existsByUsuarioAndPortalAndRol(usuario, portal, RolMembresia.ADMIN)
        if (!esAdmin) {
            throw NotAdminException("No tenés permisos para crear materias en este portal")
        }

        // Calcular el siguiente orden
        val materiasEnCarpeta = materiaRepository.findByCarpetaId(carpetaId)
        val nuevoOrden = (materiasEnCarpeta.maxOfOrNull { it.orden } ?: -1) + 1

        val nuevaMateria = Materia(
            nombre = request.nombre,
            carpeta = carpeta,
            orden = nuevoOrden
        )

        return materiaRepository.save(nuevaMateria)
    }

    fun actualizarNombreMateria(
        materiaId: UUID,
        nuevoNombre: String,
        email: String
    ): Materia {

        val materia = materiaRepository.findById(materiaId)
            .orElseThrow { ElementDoesNotExistException("Materia no encontrada") }

        if (nuevoNombre.isBlank()) {
            throw BusinessException("El nombre no puede estar vacío")
        }

        if (nuevoNombre.length > 150) {
            throw BusinessException("El nombre no puede superar los 150 caracteres")
        }

        val usuario = usuarioRepository.findByEmail(email)
            ?: throw ElementDoesNotExistException("Usuario no encontrado")

        val portal = materia.carpeta!!.portal

        val esAdmin = membresiaRepository
            .existsByUsuarioAndPortalAndRol(usuario, portal, RolMembresia.ADMIN)
        if (!esAdmin) {
            throw NotAdminException("No tenés permisos para editar esta materia")
        }

        materia.nombre = nuevoNombre

        return materiaRepository.save(materia)
    }
}