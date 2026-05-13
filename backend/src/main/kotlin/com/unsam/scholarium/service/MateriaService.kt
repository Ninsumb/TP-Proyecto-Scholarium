package com.unsam.scholarium.service

import com.unsam.scholarium.exception.BusinessException
import com.unsam.scholarium.exception.ElementDoesNotExistException
import com.unsam.scholarium.exception.NotAdminException
import com.unsam.scholarium.model.Materia
import com.unsam.scholarium.model.RolMembresia
import com.unsam.scholarium.repository.MateriaRepository
import com.unsam.scholarium.repository.MembresiaRepository
import com.unsam.scholarium.repository.UsuarioRepository
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class MateriaService(
    private val materiaRepository: MateriaRepository,
    private val usuarioRepository: UsuarioRepository,
    private val membresiaRepository: MembresiaRepository
) {

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

        val portal = materia.carpeta.portal

        val esAdmin = membresiaRepository
            .existsByUsuarioAndPortalAndRol(usuario, portal, RolMembresia.ADMIN)
        if (!esAdmin) {
            throw NotAdminException("No tenés permisos para editar esta materia")
        }

        materia.nombre = nuevoNombre

        return materiaRepository.save(materia)
    }

    fun moverMateria(
        materiaId: UUID,
        nuevaMateriaId: UUID,
        email: String
    ) {
        val materia = materiaRepository.findById(materiaId)
            .orElseThrow { ElementDoesNotExistException("Materia no encontrada") }

        val usuario = usuarioRepository.findByEmail(email)
            ?: throw ElementDoesNotExistException("Usuario no encontrado")

        
    }
}