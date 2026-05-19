package com.unsam.scholarium.service

import com.unsam.scholarium.dto.MaterialPublicadoResponse
import com.unsam.scholarium.dto.MaterialResponse
import com.unsam.scholarium.exception.BusinessException
import com.unsam.scholarium.exception.ElementDoesNotExistException
import com.unsam.scholarium.exception.NotAdminException
import com.unsam.scholarium.exception.UnauthorizedException
import com.unsam.scholarium.model.EstadoMaterial
import com.unsam.scholarium.model.Material
import com.unsam.scholarium.model.RolMembresia
import com.unsam.scholarium.model.TipoMaterial
import com.unsam.scholarium.repository.MateriaRepository
import com.unsam.scholarium.repository.MaterialRepository
import com.unsam.scholarium.repository.MembresiaRepository
import com.unsam.scholarium.repository.UsuarioRepository
import jakarta.persistence.EntityNotFoundException
import jakarta.transaction.Transactional
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.util.UUID
import kotlin.jvm.optionals.getOrNull

@Service
class MaterialService(
    private val storageService: CloudinaryFileStorageService,
    private val materiaRepository: MateriaRepository,
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

    @Transactional(rollbackOn = [Exception::class])
    fun subirMaterial(
        materiaId: UUID,
        archivo: MultipartFile,
        nombre: String,
        descripcion: String?,
        tipo: String,
        email: String,
    ): MaterialResponse {
        val tipo = try {
            TipoMaterial.valueOf(tipo)
        } catch (e: IllegalArgumentException) {
            throw BusinessException("El tipo de material no está permitido")
        }

        val usuario = usuarioRepository.findByEmail(email)
            ?: throw EntityNotFoundException("Usuario no encontrado")

        val materia = materiaRepository.findById(materiaId).getOrNull()
            ?: throw EntityNotFoundException("Materia no encontrada con id: $materiaId")

        val portal = materia.carpeta.portal

        val membresia = membresiaRepository.findByUsuarioIdAndPortalId(usuario.id!!, portal.id!!)
            ?: throw UnauthorizedException("No sos miembro de este portal")

        if (membresia.rol !in listOf(RolMembresia.MIEMBRO, RolMembresia.ADMIN)) {
            throw UnauthorizedException("No tenés permisos para subir material en este portal")
        }

        val archivoSubido = storageService.upload(archivo)

        val material = Material(
            nombre = nombre,
            descripcion = descripcion ?: "",
            tipo = tipo,
            estado = EstadoMaterial.PENDIENTE,
            url = archivoSubido.url,
            publicId = archivoSubido.publicId,
            tamanio = archivoSubido.tamanio,
            tipoArchivo = archivoSubido.tipoArchivo,
            materia = materia,
            usuario = usuario,
        )

        val guardado = materialRepository.save(material)
        return MaterialResponse.fromEntity(guardado)
    }

    fun rechazarMaterial(materialId: UUID, email: String, motivo: String): Material {

        val material = materialRepository.findById(materialId)
            .orElseThrow { ElementDoesNotExistException("Material no encontrado") }

        if(material.estado == EstadoMaterial.PUBLICADO ||
            material.estado == EstadoMaterial.RECHAZADO) {
            throw BusinessException("El material ya fue procesado")
        }

        val usuario = usuarioRepository.findByEmail(email)
        ?: throw ElementDoesNotExistException("Usuario no encontrado")

        val portal = material.materia.carpeta.portal

        val esAdmin = membresiaRepository
            .existsByUsuarioAndPortalAndRol(usuario, portal, RolMembresia.ADMIN)

        if (!esAdmin) {
            throw NotAdminException("No tenés permisos para rechazar material")
        }

        material.estado = EstadoMaterial.RECHAZADO
        material.motivoRechazo = motivo

        return materialRepository.save(material)
    }

    fun listarMaterialPublicado(materiaId: UUID, email: String): List<MaterialPublicadoResponse> {

        val materia = materiaRepository.findById(materiaId).getOrNull()
            ?: throw ElementDoesNotExistException("Materia no encontrada")

        val usuario = usuarioRepository.findByEmail(email)
            ?: throw ElementDoesNotExistException("Usuario no encontrado")

        val portal = materia.carpeta.portal

        val esMiembro = membresiaRepository
            .existsByUsuarioAndPortalAndRol(usuario, portal, RolMembresia.MIEMBRO)

        val esAdmin = membresiaRepository
            .existsByUsuarioAndPortalAndRol(usuario, portal, RolMembresia.ADMIN)

        if (!esMiembro && !esAdmin) {
            throw UnauthorizedException("No sos miembro de este portal")
        }

        return materialRepository
            .findByMateriaIdAndEstadoOrderByCreatedAtDesc(materiaId, EstadoMaterial.PUBLICADO)
            .map { MaterialPublicadoResponse.fromEntity(it) }
    }
}