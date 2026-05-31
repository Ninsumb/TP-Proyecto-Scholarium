package com.unsam.scholarium.service

import com.unsam.scholarium.dto.CarpetaArbolDTO
import com.unsam.scholarium.dto.CarpetaRequest

import com.unsam.scholarium.dto.MateriaArbolDTO
import com.unsam.scholarium.dto.CrearPortalRequest
import com.unsam.scholarium.dto.PortalEstructuraDTO
import com.unsam.scholarium.dto.CarpetaResponse
import com.unsam.scholarium.dto.MembresiaResponse
import com.unsam.scholarium.dto.PortalBusquedaResponse
import com.unsam.scholarium.dto.PortalResponse
import com.unsam.scholarium.exception.BusinessException
import com.unsam.scholarium.exception.ElementDoesNotExistException
import com.unsam.scholarium.exception.ItemConflictException
import com.unsam.scholarium.exception.NotAdminException
import com.unsam.scholarium.exception.UnauthorizedException
import com.unsam.scholarium.mapper.PortalMapper
import com.unsam.scholarium.model.Carpeta
import com.unsam.scholarium.model.Etiqueta
import com.unsam.scholarium.model.Membresia
import com.unsam.scholarium.model.PlantillaSolicitud
import com.unsam.scholarium.model.Portal
import com.unsam.scholarium.model.RolMembresia
import com.unsam.scholarium.model.Usuario
import com.unsam.scholarium.repository.CarpetaRepository
import com.unsam.scholarium.repository.EtiquetaRepository
import com.unsam.scholarium.repository.MateriaRepository
import com.unsam.scholarium.repository.MaterialRepository
import com.unsam.scholarium.repository.MembresiaRepository
import com.unsam.scholarium.repository.PlantillaSolicitudRepository
import com.unsam.scholarium.repository.PortalRepository
import com.unsam.scholarium.repository.UsuarioRepository
import jakarta.transaction.Transactional
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import java.util.UUID
import kotlin.jvm.optionals.getOrNull

@Service
class PortalService(
    private val portalRepository: PortalRepository,
    private val materiaRepository: MateriaRepository,
    private val materialRepository: MaterialRepository,
    private val carpetaRepository: CarpetaRepository,
    private val membresiaRepository: MembresiaRepository,
    private val usuarioRepository: UsuarioRepository,
    private val etiquetaRepository: EtiquetaRepository,
    private val plantillaSolicitudRepository: PlantillaSolicitudRepository,
) {
    fun getDetalleById(id: Long, email: String): Triple<Portal, RolMembresia?, List<Int>> {
        val portal = portalRepository.findById(id).getOrNull()
            ?: throw ElementDoesNotExistException("Portal $id no encontrado")

        val usuario = usuarioRepository.findByEmail(email)
            ?: throw ElementDoesNotExistException("Usuario no encontrado")

        val membresia = membresiaRepository.findByUsuarioIdAndPortalId(usuario.id!!, id)

        val stats = listOf(
            membresiaRepository.countByPortalId(id),
            materiaRepository.countByPortalId(id),
            materialRepository.countByPortalId(id)
        )

        return Triple(portal, membresia?.rol, stats)
    }




    fun getEstructuraPortal(id: Long, email: String): PortalEstructuraDTO {
        val portal = portalRepository.findById(id)
            .orElseThrow { ElementDoesNotExistException("Portal no encontrado") }

        val membresia = membresiaRepository
            .findByUsuarioEmailAndPortalId(email, id)
            ?: throw UnauthorizedException("No pertenece al portal")

        if (membresia.rol != RolMembresia.ADMIN &&
            membresia.rol != RolMembresia.MIEMBRO)
            throw UnauthorizedException("No tenés permisos para visualizar esta estructura")

        val carpetas = carpetaRepository
            .findAllByPortalIdWithPadre(id)

        val materias = materiaRepository
            .findAllByPortalIdWithCarpeta(id)

        val materiasPorCarpeta = materias.groupBy { it.carpeta.id }

        val carpetasMap = carpetas.associate { carpeta ->

            carpeta.id!! to CarpetaArbolDTO(
                id = carpeta.id,
                nombre = carpeta.nombre,
                carpetaPadreId = carpeta.carpetaPadre?.id,
                orden = carpeta.orden,
                materias = materiasPorCarpeta[carpeta.id]
                    ?.sortedBy { it.orden }
                    ?.map {
                        MateriaArbolDTO(
                            id = it.id!!,
                            nombre = it.nombre,
                            foroId = null, // o it.foro?.id cuando esté implementado en materia
                            orden = it.orden
                        )
                    }
                    ?: emptyList()
            )
        }

        val carpetasRaiz = mutableListOf<CarpetaArbolDTO>()

        carpetas.sortedBy { it.orden }.forEach { carpeta ->

            val dto = carpetasMap[carpeta.id]!!

            val padreId = carpeta.carpetaPadre?.id

            if (padreId == null) {
                carpetasRaiz.add(dto)
            } else {
                carpetasMap[padreId]
                    ?.subcarpetas
                    ?.add(dto)
            }
        }

        return PortalEstructuraDTO(
            portalId = portal.id!!,
            carpetas = carpetasRaiz.sortedBy { it.orden }
        )
    }


    /**
     * Crea un Portal nuevo y retorna la entidad persistida.
     *
     * Flujo (todo en una sola transacción):
     * 1. Normalizar y validar unicidad de universidad+carrera.
     * 2. Crear el Portal.
     * 3. Crear la Membresia del creador como ADMIN.
     * 4. Crear la Etiqueta "GENERAL" por defecto.
     * 5. Crear la PlantillaSolicitud con estado abierta=true y requisitos por defecto.
     */
    @Transactional(rollbackOn = [Exception::class])
    fun createPortal(request: CrearPortalRequest, email: String): Portal {
        val universidadNormalizada = Portal.normalizarParaUnicidad(request.universidad)
        val carreraNormalizada = Portal.normalizarParaUnicidad(request.carrera)

        if (portalRepository.existePortalConValoresNormalizados(universidadNormalizada, carreraNormalizada)) {
            throw BusinessException("Ya existe un portal para esa universidad y carrera")
        }

        val usuario = usuarioRepository.findByEmail(email)
            ?: throw ElementDoesNotExistException("Usuario no encontrado")

        val portal = Portal(
            universidad = request.universidad.trim(),
            carrera = request.carrera.trim(),
            unidadAcademica = request.unidadAcademica?.trim(),
            descripcion = request.descripcion?.trim(),
            logoUrl = request.logoUrl,
            iconoPortal = request.iconoPortal,
            colorPortal = request.colorPortal,
        )

        val membresiaAdmin = Membresia(
            usuario = usuario,
            portal = portal,
            rol = RolMembresia.ADMIN
        )
        portal.addMembresia(membresiaAdmin)

        val portalGuardado = portalRepository.save(portal)

        // Etiqueta general por defecto
        etiquetaRepository.save(Etiqueta(nombre = "GENERAL", portal = portalGuardado))

        // PlantillaSolicitud: abierta por defecto con mensaje de bienvenida
        plantillaSolicitudRepository.save(
            PlantillaSolicitud(
                portal = portalGuardado,
                requisitos = PlantillaSolicitud.REQUISITOS_DEFAULT,
                abierta = true,
            )
        )

        return portalGuardado
    }

    fun validarPortal(idPortal: Long): Portal =
        portalRepository.findById(idPortal).getOrNull()
            ?: throw ElementDoesNotExistException("Portal no encontrado")

    fun validarUsuario(email: String): Usuario =
        usuarioRepository.findByEmail(email)
            ?: throw ElementDoesNotExistException("Usuario no encontrado")

    fun validarMembresiaUsuario(usuario: Usuario, idPortal: Long, rolMembresia: RolMembresia) {
        val membresia = membresiaRepository.findByUsuarioIdAndPortalId(usuario.id!!, idPortal)
        if (membresia?.rol != rolMembresia) throw NotAdminException("Solo los administradores pueden realizar esta acción")
    }

    @Transactional(rollbackOn = [Exception::class])
    fun createCarpeta(idPortal: Long, email: String, request: CarpetaRequest): Carpeta {
        val portal = validarPortal(idPortal)
        val usuario = validarUsuario(email)
        validarMembresiaUsuario(usuario, idPortal, RolMembresia.ADMIN)

        val padre = request.carpetaPadreId?.let {
            val carpetaEncontrada = carpetaRepository.findById(it).getOrNull()
                ?: throw ElementDoesNotExistException("La carpeta padre no existe")
            if (carpetaEncontrada.portal != portal)
                throw BusinessException("La carpeta padre no pertenece a este portal")
            carpetaEncontrada
        }

        val carpetasHermanas = if (padre == null) {
            carpetaRepository.findByPortalIdAndCarpetaPadreIdIsNull(idPortal)
        } else {
            carpetaRepository.findByCarpetaPadreId(padre.id!!)
        }
        val nuevoOrden = (carpetasHermanas.maxOfOrNull { it.orden } ?: -1) + 1

        val nuevaCarpeta = Carpeta(
            nombre = request.nombre,
            portal = portal,
            carpetaPadre = padre,
            orden = nuevoOrden
        )

        return carpetaRepository.save(nuevaCarpeta)
    }

    fun renameCarpeta(idPortal: Long, idCarpeta: UUID, email: String, nuevoNombre: String) {
        validarPortal(idPortal)
        val usuario = validarUsuario(email)
        validarMembresiaUsuario(usuario, idPortal, RolMembresia.ADMIN)

        if (nuevoNombre.isEmpty())
            throw BusinessException("El nuevo nombre de la carpeta no puede estar vacío")
        if (nuevoNombre.length > 100)
            throw BusinessException("El nuevo nombre no puede pasar de los 100 caracteres")

        val carpeta = carpetaRepository.findById(idCarpeta).getOrNull()
            ?: throw ElementDoesNotExistException("La carpeta $idCarpeta no existe.")

        if (carpetaRepository.findByNombre(nuevoNombre).getOrNull(0) != null)
            throw ItemConflictException("Ya hay una carpeta con el mismo nombre")

        carpeta.nombre = nuevoNombre
        carpetaRepository.save(carpeta)
    }

    @Transactional(rollbackOn = [Exception::class])
    fun patch(portal: Portal, adminId: Long) {
        portalRepository.save(portal)
    }

    fun buscarPortales(universidad: String?, carrera: String?, pagina: Int = 0): PortalBusquedaResponse {
        val page = PageRequest.of(pagina, 6)
        val resultado = portalRepository.buscarPortales(
            universidad?.takeIf { it.isNotBlank() },
            carrera?.takeIf { it.isNotBlank() },
            page
        )
        return PortalBusquedaResponse(
            portales = resultado.content.map { PortalMapper.toBusquedaDTO(it) },
            page = resultado.number,
            total = resultado.totalPages
        )
    }

    @Transactional(rollbackOn = [Exception::class])
    fun removerMiembro(portalId: Long, usuarioObjetivoId: Long, emailAdmin: String) {
        val portal = validarPortal(portalId)
        val admin = validarUsuario(emailAdmin)

        val membresiaAdmin = membresiaRepository.findByUsuarioIdAndPortalId(admin.id!!, portalId)
        if (membresiaAdmin?.rol != RolMembresia.ADMIN)
            throw NotAdminException("Solo los administradores pueden remover miembros")

        val usuarioObjetivo = usuarioRepository.findById(usuarioObjetivoId).getOrNull()
            ?: throw ElementDoesNotExistException("Usuario no encontrado")

        if (admin.id == usuarioObjetivo.id)
            throw BusinessException("No podés removerte a vos mismo del portal")

        val membresiaObjetivo = membresiaRepository.findByUsuarioIdAndPortalId(usuarioObjetivoId, portalId)
            ?: throw ElementDoesNotExistException("El usuario no es miembro de este portal")

        membresiaRepository.delete(membresiaObjetivo)
    }

    @Transactional(rollbackOn = [Exception::class])
    fun degradarAdmin(portalId: Long, usuarioObjetivoId: Long, emailAdmin: String): MembresiaResponse {
        val portal = validarPortal(portalId)
        val admin = validarUsuario(emailAdmin)

        val membresiaAdmin = membresiaRepository.findByUsuarioIdAndPortalId(admin.id!!, portalId)
        if (membresiaAdmin?.rol != RolMembresia.ADMIN)
            throw NotAdminException("Solo los administradores pueden degradar miembros")

        val usuarioObjetivo = usuarioRepository.findById(usuarioObjetivoId).getOrNull()
            ?: throw ElementDoesNotExistException("Usuario no encontrado")

        if (admin.id == usuarioObjetivo.id)
            throw BusinessException("No podés degradarte a vos mismo")

        val membresiaObjetivo = membresiaRepository.findByUsuarioIdAndPortalId(usuarioObjetivoId, portalId)
            ?: throw ElementDoesNotExistException("El usuario no es miembro de este portal")

        if (membresiaObjetivo.rol != RolMembresia.ADMIN)
            throw BusinessException("El usuario objetivo no es ADMIN")

        membresiaObjetivo.rol = RolMembresia.MIEMBRO
        membresiaRepository.save(membresiaObjetivo)

        return MembresiaResponse(
            membresiaId = membresiaObjetivo.id!!,
            usuarioId = usuarioObjetivo.id!!,
            portalId = portalId,
            rol = membresiaObjetivo.rol
        )
    }
}