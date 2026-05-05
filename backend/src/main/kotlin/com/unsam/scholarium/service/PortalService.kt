package com.unsam.scholarium.service

import com.unsam.scholarium.dto.CarpetaRequest
import com.unsam.scholarium.dto.PortalBusquedaResponse
import com.unsam.scholarium.dto.PortalResponse
import com.unsam.scholarium.dto.PortalUserResponse
import com.unsam.scholarium.dto.SolicitudRequest
import com.unsam.scholarium.dto.SolicitudResponse
import com.unsam.scholarium.dto.UsuarioResumenDTO
import com.unsam.scholarium.exception.BusinessException
import com.unsam.scholarium.exception.ElementDoesNotExistException
import com.unsam.scholarium.exception.NotAdminException
import com.unsam.scholarium.model.Carpeta
import com.unsam.scholarium.model.Estado
import com.unsam.scholarium.model.Membresia
import com.unsam.scholarium.model.Portal
import com.unsam.scholarium.model.RolMembresia
import com.unsam.scholarium.model.Solicitud
import com.unsam.scholarium.repository.CarpetaRepository
import com.unsam.scholarium.repository.MateriaRepository
import com.unsam.scholarium.repository.MaterialRepository
import com.unsam.scholarium.repository.MembresiaRepository
import com.unsam.scholarium.repository.PortalRepository
import com.unsam.scholarium.repository.SolicitudRepository
import com.unsam.scholarium.repository.UsuarioRepository
import com.unsam.scholarium.mapper.PortalMapper
import jakarta.transaction.Transactional
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Service
import kotlin.jvm.optionals.getOrNull

@Service
class PortalService (
    private val portalRepository: PortalRepository,
    private val materiaRepository: MateriaRepository,
    private val materialRepository: MaterialRepository,
    private val carpetaRepository: CarpetaRepository,
    private val membresiaRepository: MembresiaRepository,
    private val usuarioRepository: UsuarioRepository,
    private val solicitudRepository: SolicitudRepository
) {
    fun getDetalleById(id: Long, email: String): Triple<Portal, RolMembresia?, List<Int>> {
        val portal = portalRepository.findById(id).getOrNull()
            ?: throw ElementDoesNotExistException("Portal $id no encontrado")

        val usuario = usuarioRepository.findByEmail(email)
            ?: throw ElementDoesNotExistException("Usuario no encontrado")

        val membresia = membresiaRepository
            .findByUsuarioIdAndPortalId(usuario.id!!, id)

        val stats = listOf(
            membresiaRepository.countByPortalId(id),
            materiaRepository.countByPortalId(id),
            materialRepository.countByPortalId(id)
        )

        return Triple(portal, membresia?.rol, stats)
    }

    fun getPortalesByUser(email: String): List<PortalUserResponse> {
        val membresias = membresiaRepository.findAllByUsuarioEmail(email)

        return membresias.map { membresia ->
            val p = membresia.portal!!
            PortalUserResponse(
                id = p.id!!,
                universidad = p.universidad,
                carrera = p.carrera,
                rol = membresia.rol
            )
        }
    }

    fun getSolicitudesPendientes(idPortal: Long, email: String): List<SolicitudResponse> {
        portalRepository.findById(idPortal).getOrNull()
            ?: throw ElementDoesNotExistException("Portal $idPortal no encontrado")

        val usuario = usuarioRepository.findByEmail(email)
            ?: throw ElementDoesNotExistException("Usuario no encontrado")

        val membresia = membresiaRepository.findByUsuarioIdAndPortalId(usuario.id!!, idPortal)
            ?: throw NotAdminException("No sos miembro del portal")

        if (membresia.rol != RolMembresia.ADMIN) throw NotAdminException("No sos ADMIN del portal")

        val solicitudes = solicitudRepository.findAllByEstadoAndPortalId(Estado.PENDIENTE, idPortal)

        return solicitudes.map { solicitud ->
            SolicitudResponse(
                solicitud.id!!,
                UsuarioResumenDTO(
                    solicitud.usuario.id!!,
                    solicitud.usuario.nombre,
                    solicitud.usuario.email
                ),
                solicitud.fechaSolicitud.toString()
            )
        }
    }

    @Transactional(rollbackOn = [Exception::class])
    fun createPortal(portal: Portal, email: String) {
        if (portalRepository.existsByUniversidadAndCarrera(portal.universidad, portal.carrera)) {
            throw BusinessException("Ya existe un portal para esa universidad y carrera")
        }

        val usuario = usuarioRepository.findByEmail(email)
            ?: throw ElementDoesNotExistException("Usuario no encontrado")

        val membresiaAdmin = Membresia(
            usuario = usuario,
            portal = portal,
            rol = RolMembresia.ADMIN
        )

        portal.addMembresia(membresiaAdmin)

        portalRepository.save(portal)
    }

    @Transactional(rollbackOn = [Exception::class])
    fun createSolicitud(idPortal: Long, email: String, request: SolicitudRequest) {
        val portal = portalRepository.findById(idPortal).getOrNull()
            ?: throw ElementDoesNotExistException("Portal no encontrado")

        val usuario = usuarioRepository.findByEmail(email)
            ?: throw ElementDoesNotExistException("Usuario no encontrado")

        val esMiembro = membresiaRepository.existsByUsuarioIdAndPortalId(usuario.id!!, idPortal)
        if (esMiembro) throw BusinessException("Ya sos miembro del portal")

        val tienePendiente = solicitudRepository.existsByUsuarioAndPortalAndEstado(usuario, portal, Estado.PENDIENTE)
        if (tienePendiente) throw BusinessException("Ya tenés una solicitud pendiente")

        val solicitud = Solicitud(
            usuario = usuario,
            portal = portal,
            titulo = request.titulo,
            descripcion = request.descripcion,
            estado = Estado.PENDIENTE
        )

        solicitudRepository.save(solicitud)
    }

    @Transactional(rollbackOn = [Exception::class])
    fun createCarpeta(idPortal: Long, email: String, request: CarpetaRequest): Carpeta {
        val portal = portalRepository.findById(idPortal).getOrNull()
            ?: throw ElementDoesNotExistException("Portal no encontrado")

        val usuario = usuarioRepository.findByEmail(email)
            ?: throw ElementDoesNotExistException("Usuario no encontrado")

        val membresia = membresiaRepository.findByUsuarioIdAndPortalId(usuario.id!!, idPortal)
        if (membresia?.rol != RolMembresia.ADMIN) throw NotAdminException("Solo los administradores pueden crear carpetas")

        val padre = request.carpetaPadreId?.let {
            val carpetaEncontrada = carpetaRepository.findById(it).getOrNull()
                ?: throw ElementDoesNotExistException("La carpeta padre no existe")

            if (carpetaEncontrada.portal != portal) throw BusinessException("La carpeta padre no pertenece a este portal")

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

    @Transactional(rollbackOn = [Exception::class])
    fun patch(portal: Portal, adminId: Long) {
        portalRepository.save(portal)
    }

    fun buscarPortales(universidad: String?, carrera: String?): List<PortalBusquedaResponse> {

        val resultados = portalRepository.buscarPortales(
            universidad?.takeIf { it.isNotBlank() },
            carrera?.takeIf { it.isNotBlank() }
        )

        return resultados.map { portal ->
            PortalMapper.toBusquedaResponse(portal)
        }
    }
}