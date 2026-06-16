package com.unsam.scholarium.service

import com.unsam.scholarium.dto.ActualizarPerfilRequest
import com.unsam.scholarium.dto.UsuarioMeResponse
import com.unsam.scholarium.dto.UsuarioPortalResponse
import com.unsam.scholarium.exception.BusinessException
import com.unsam.scholarium.exception.ElementDoesNotExistException
import com.unsam.scholarium.model.RolMembresia
import com.unsam.scholarium.repository.CarpetaRepository
import com.unsam.scholarium.repository.MateriaRepository
import com.unsam.scholarium.repository.MaterialRepository
import com.unsam.scholarium.repository.MembresiaRepository
import com.unsam.scholarium.repository.UsuarioRepository
import jakarta.transaction.Transactional
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile

@Service
class UsuarioService(
    private val usuarioRepository: UsuarioRepository,
    private val membresiaRepository: MembresiaRepository,
    private val materiaRepository: MateriaRepository,
    private val materialRepository: MaterialRepository,
    private val cloudinaryService: CloudinaryFileStorageService
) {

    fun getMisPortales(email: String): List<UsuarioPortalResponse> {
        val usuario = usuarioRepository.findByEmail(email)
            ?: throw ElementDoesNotExistException("Usuario no encontrado")

        val membresias = membresiaRepository.findPortalesActivosOAdmin(usuario)

        return membresias
            .map { membresia ->
            val portal = membresia.portal
                ?: throw IllegalStateException("La membresía no tiene portal")

            val cantidadMiembros = membresiaRepository.countByPortal(portal)
            val cantidadMaterias = materiaRepository.countByPortal(portal)

            UsuarioPortalResponse(
                id = portal.id!!,
                universidad = portal.universidad,
                carrera = portal.carrera,
                descripcion = portal.descripcion,
                logoUrl = portal.logoUrl,
                rol = membresia.rol,
                cantidadMiembros = cantidadMiembros,
                cantidadMaterias = cantidadMaterias
            )
        }
    }

    fun getMiPerfil(email: String): UsuarioMeResponse {
        val usuario = usuarioRepository.findByEmail(email)
            ?: throw ElementDoesNotExistException("Usuario no encontrado")

        val cantidadPortales = membresiaRepository.findByUsuarioId(usuario.id!!).size
        val cantidadMaterial = materialRepository.countByUsuarioId(usuario.id)

        return UsuarioMeResponse(
            id = usuario.id,
            nombre = usuario.nombre,
            email = usuario.email,
            fotoPerfil = usuario.fotoPerfil,
            createdAt = usuario.fechaRegistro,
            cantidadPortales = cantidadPortales,
            cantidadMaterialSubido = cantidadMaterial
        )
    }

    @Transactional
    fun actualizarPerfil(email: String, request: ActualizarPerfilRequest): UsuarioMeResponse {
        val usuario = usuarioRepository.findByEmail(email)
            ?: throw ElementDoesNotExistException("Usuario no encontrado")

        if (request.nombre.isBlank() || request.nombre.length < 2)
            throw BusinessException("El nombre debe tener al menos 2 caracteres")

        usuario.nombre = request.nombre
        usuarioRepository.save(usuario)

        return getMiPerfil(email)
    }

    @Transactional
    fun actualizarFotoPerfil(email: String, archivo: MultipartFile): String {
        val usuario = usuarioRepository.findByEmail(email)
            ?: throw ElementDoesNotExistException("El usuario no existe")

        val url = cloudinaryService.uploadFotoPerfil(archivo, usuario.id!!)
        usuario.fotoPerfil = url
        usuarioRepository.save(usuario)

        return url
    }

    @Transactional
    fun eliminarCuenta(email: String) {
        val usuario = usuarioRepository.findByEmail(email)
            ?: throw ElementDoesNotExistException("Usuario no encontrado")

        usuarioRepository.delete(usuario)
    }
}