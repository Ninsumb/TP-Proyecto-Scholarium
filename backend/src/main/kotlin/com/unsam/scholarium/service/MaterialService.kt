package com.unsam.scholarium.service
 
import com.unsam.scholarium.dto.MaterialResponse
import com.unsam.scholarium.dto.SubirMaterialRequest
import com.unsam.scholarium.dto.MultipartFile
import com.unsam.scholarium.exception.BusinessException
import com.unsam.scholarium.exception.UnauthorizedException
import com.unsam.scholarium.model.EstadoMaterial
import com.unsam.scholarium.model.Material
import com.unsam.scholarium.model.RolMembresia
import com.unsam.scholarium.repository.MateriaRepository
import com.unsam.scholarium.repository.MaterialRepository
import com.unsam.scholarium.repository.MembresiaRepository
import com.unsam.scholarium.repository.UsuarioRepository
import jakarta.persistence.EntityNotFoundException
import jakarta.transaction.Transactional
import org.springframework.stereotype.Service
import java.util.UUID
import kotlin.jvm.optionals.getOrNull

 
@Service
class MaterialService(
    private val materialRepository: MaterialRepository,
    private val materiaRepository: MateriaRepository,
    private val membresiaRepository: MembresiaRepository,
    private val usuarioRepository: UsuarioRepository,
    
) {
 
    @Transactional(rollbackOn = [Exception::class])
    fun subirMaterial(
        materiaId: Long,
        request: MultipartFile,
        email: String,
    ) {
 
        
        val usuario = usuarioRepository.findByEmail(email)
            ?: throw EntityNotFoundException("Usuario no encontrado")
 
        
        val materia = materiaRepository.findById(materiaId).getOrNull()
            ?: throw EntityNotFoundException("Materia no encontrada con id: $materiaId")
 
        
        val portal = materia.carpeta.portal
 
       
        val membresia = requireNotNull(
            membresiaRepository.findByUsuarioIdAndPortalId(usuario.id!!, portal.id!!)
        ) { "No sos miembro de este portal" }

        
        if (membresia.rol !in listOf(RolMembresia.MIEMBRO, RolMembresia.ADMIN)) {
            throw UnauthorizedException("No tenés permisos para subir material en este portal")
        }
 
        // storage con cloudinary o s3
        val archivoSubido = storageService.subirArchivo(request.archivo)
 
        
        val material = Material(
            nombre      = request.nombre,
            descripcion = request.descripcion ?: "",
            tipo        = request.tipo,
            estado      = EstadoMaterial.PENDIENTE,
            url         = archivoSubido.url,
            tamanio     = archivoSubido.tamanio,
            tipoArchivo = archivoSubido.tipoArchivo,
            materia     = materia,
            usuario     = usuario,
        )
 
        materialRepository.save(material)
    }
}
 