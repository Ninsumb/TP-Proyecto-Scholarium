package com.unsam.scholarium.service

import com.unsam.scholarium.dto.CrearMateriaRequest
import com.unsam.scholarium.exception.BusinessException
import com.unsam.scholarium.exception.ElementDoesNotExistException
import com.unsam.scholarium.exception.NotAdminException
import com.unsam.scholarium.model.Etiqueta
import com.unsam.scholarium.model.Tablero
import com.unsam.scholarium.model.Materia
import com.unsam.scholarium.model.Portal
import com.unsam.scholarium.model.RolMembresia
import com.unsam.scholarium.model.Usuario
import com.unsam.scholarium.repository.*
import jakarta.transaction.Transactional
import org.springframework.stereotype.Service
import java.util.UUID
import kotlin.jvm.optionals.getOrNull

@Service
class MateriaService(
    private val materiaRepository: MateriaRepository,
    private val usuarioRepository: UsuarioRepository,
    private val membresiaRepository: MembresiaRepository,
    private val carpetaRepository: CarpetaRepository,
    private val etiquetaRepository: EtiquetaRepository,
    private val foroRepository: ForoRepository
) {

    fun validarAdmin(usuario: Usuario, portal: Portal){
        val esAdmin = membresiaRepository
            .existsByUsuarioAndPortalAndRol(usuario, portal, RolMembresia.ADMIN)
        if (!esAdmin) {
            throw NotAdminException("No tenés permisos para editar esta materia")
        }
    }

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

        validarEtiqueta(request.etiqueta)

        val materiasEnCarpeta = materiaRepository.findByCarpetaId(carpetaId)
        val nuevoOrden = (materiasEnCarpeta.maxOfOrNull { it.orden } ?: -1) + 1

        val nuevaMateria = Materia(
            nombre = request.nombre,
            carpeta = carpeta,
            orden = nuevoOrden
        )

        val materiaSaved = materiaRepository.save(nuevaMateria)

        val etiqueta = etiquetaRepository.findByNombreAndPortal(request.etiqueta.uppercase(), portal)
            ?: etiquetaRepository.save(
                Etiqueta(
                    nombre = request.etiqueta.uppercase(),
                    portal = portal
                )
            )

        val nuevoTablero = Tablero(
            nombre = request.nombre,
            etiqueta = etiqueta,
            portal = portal
        )

        foroRepository.save(nuevoTablero)

        return materiaSaved
    }

    private fun validarEtiqueta(etiqueta: String) {
        if (etiqueta.isBlank()) {
            throw BusinessException("La etiqueta es obligatoria")
        }
        if (etiqueta.length > 30) {
            throw BusinessException("La etiqueta no puede tener más de 30 caracteres")
        }

        if (!etiqueta.matches(Regex("^[A-Za-z0-9\\-]+$"))) {
            throw BusinessException("La etiqueta solo puede contener letras, números y guiones")
        }
    }

    @Transactional(rollbackOn = [Exception::class])
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

        validarAdmin(usuario, portal)

        materia.nombre = nuevoNombre

        return materiaRepository.save(materia)
    }

    //Mueve la materia a una carpeta
    @Transactional(rollbackOn = [Exception::class])
    fun moverMateria(
        materiaId: UUID,
        nuevaCarpetaId: UUID,
        email: String
    ): Materia {
        val materia = materiaRepository.findById(materiaId)
            .orElseThrow { ElementDoesNotExistException("Materia no encontrada") }

        val usuario = usuarioRepository.findByEmail(email)
            ?: throw ElementDoesNotExistException("Usuario no encontrado")

        val carpeta = carpetaRepository.findById(nuevaCarpetaId).getOrNull()
            ?: throw BusinessException("Carpeta no encontrada")

        val portal = materia.carpeta.portal
        if (materia.carpeta.portal.id != carpeta.portal.id)
            throw BusinessException("La materia y la nueva carpeta no pertenecen al mismo portal")

        validarAdmin(usuario, portal)

        if (materia.carpeta.id == nuevaCarpetaId) {
            throw BusinessException("La materia ya se encuentra en esa carpeta")
        }

        //nuevo orden
        val materiasEnCarpeta = materiaRepository.findByCarpetaId(nuevaCarpetaId)
        val nuevoOrden = (materiasEnCarpeta.maxOfOrNull { it.orden } ?: -1) + 1
        materia.orden = nuevoOrden

        //Ahora si mete la carpeta
        materia.carpeta = carpeta

        return materiaRepository.save(materia)
    }
}