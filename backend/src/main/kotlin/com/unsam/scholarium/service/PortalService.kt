package com.unsam.scholarium.service

import com.unsam.scholarium.dto.ActualizarPlantillaSolicitudRequest
import com.unsam.scholarium.dto.CarpetaArbolDTO
import com.unsam.scholarium.dto.CarpetaRequest
import com.unsam.scholarium.dto.MateriaArbolDTO
import com.unsam.scholarium.dto.CrearPortalRequest
import com.unsam.scholarium.dto.PortalEstructuraDTO
import com.unsam.scholarium.dto.MembresiaResponse
import com.unsam.scholarium.dto.PortalBusquedaResponse
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
import com.unsam.scholarium.dto.MiembroResponse
import com.unsam.scholarium.dto.ActualizarPortalRequest
import com.unsam.scholarium.dto.CambiarTipoAccesoRequest
import com.unsam.scholarium.dto.VotacionResponse
import com.unsam.scholarium.model.TipoAcceso
import com.unsam.scholarium.model.TipoVotacion
import com.unsam.scholarium.repository.PortalBloqueoRepository
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
    private val votacionAdminService: VotacionAdminService,
    private val portalBloqueoRepository: PortalBloqueoRepository
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

        val membresia = membresiaRepository.findByUsuarioEmailAndPortalId(email, id)

        val esMiembro = membresia?.rol in listOf(RolMembresia.MIEMBRO, RolMembresia.ADMIN)

        if (!esMiembro) {
            // No es miembro — solo pasa si el portal es ABIERTO
            if (portal.tipoAcceso != TipoAcceso.ABIERTO) {
                throw UnauthorizedException("No pertenece al portal")
            }
        }

        val carpetas = carpetaRepository.findAllByPortalIdWithPadre(id)
        val materias = materiaRepository.findAllByPortalIdWithCarpeta(id)

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
        etiquetaRepository.save(Etiqueta(nombre = "General", portal = portalGuardado))

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
    fun solicitarCambioTipoAcceso(
        portalId: Long,
        email: String,
        request: CambiarTipoAccesoRequest
    ): VotacionResponse {
        val portal = validarPortal(portalId)

        val usuario = validarUsuario(email)

        validarMembresiaUsuario(usuario, portalId, RolMembresia.ADMIN)

        val votacion = votacionAdminService.crearVotacion(
            portalId = portalId,
            tipo = TipoVotacion.CAMBIO_TIPO_ACCESO,
            motivo = request.motivo,
            entidadId = portal.id.toString(),
            metadatos = "nuevoTipoAcceso: ${request.nuevoTipoAcceso}",
            emailProponente = email
        )

        return votacionAdminService.toResponse(votacion)
    }

    @Transactional(rollbackOn = [Exception::class])
    fun actualizarPlantillaSolicitud(
        idPortal: Long,
        email: String,
        request: ActualizarPlantillaSolicitudRequest
    ) {
        val usuario = validarUsuario(email)

        validarMembresiaUsuario(usuario, idPortal, RolMembresia.ADMIN)

        val plantilla = plantillaSolicitudRepository.findByPortalId(idPortal)
            ?: throw ElementDoesNotExistException("Plantilla de solicitud no encontrada")

        val requisitos = request.requisitos.trim()

        if (requisitos.isBlank()) throw BusinessException("Los requisitos no pueden estar vacíos")

        if (requisitos.length > 1000) throw BusinessException("Los requisitos son demasiado largos")

        plantilla.requisitos = requisitos
        plantilla.abierta = request.abierta

        plantillaSolicitudRepository.save(plantilla)
    }

    @Transactional(rollbackOn = [Exception::class])
    fun patch(portal: Portal) {
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

    fun promoverAdmin(portalId: Long, usuarioObjetivoId: Long, emailAdmin: String): MembresiaResponse  {
        validarPortal(portalId)
        val admin = validarUsuario(emailAdmin)

        val membresiaAdmin = membresiaRepository.findByUsuarioIdAndPortalId(admin.id!!, portalId)
        if (membresiaAdmin?.rol != RolMembresia.ADMIN)
            throw NotAdminException("Solo los administradores pueden promover miembros")

        val usuarioObjetivo = usuarioRepository.findById(usuarioObjetivoId).getOrNull()
            ?: throw ElementDoesNotExistException("Usuario no encontrado")

        val membresiaObjetivo = membresiaRepository.findByUsuarioIdAndPortalId(usuarioObjetivoId, portalId)
            ?: throw ElementDoesNotExistException("El usuario no es miembro de este portal")

        if (membresiaObjetivo.rol == RolMembresia.ADMIN)
            throw BusinessException("El usuario objetivo ya es ADMIN")

        membresiaObjetivo.rol = RolMembresia.ADMIN
        membresiaRepository.save(membresiaObjetivo)

        return MembresiaResponse(
            membresiaId = membresiaObjetivo.id!!,
            usuarioId = usuarioObjetivo.id!!,
            portalId = portalId,
            rol = membresiaObjetivo.rol
        )
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

    /**
     * Devuelve todos los miembros activos del portal.
     * Solo accesible por admins del portal.
     */
    fun getMiembros(portalId: Long, email: String): List<MiembroResponse> {
        val portal = validarPortal(portalId)
        val usuario = validarUsuario(email)

        val membresiaAdmin = membresiaRepository.findByUsuarioIdAndPortalId(usuario.id!!, portalId)
            ?: throw NotAdminException("No sos miembro del portal")

        if (membresiaAdmin.rol != RolMembresia.ADMIN)
            throw NotAdminException("Solo los administradores pueden ver la lista de miembros")

        return membresiaRepository.findAllByPortalId(portalId).map { membresia ->
            MiembroResponse(
                usuarioId    = membresia.usuario.id!!,
                membresiaId  = membresia.id!!,
                nombre       = membresia.usuario.nombre,
                email        = membresia.usuario.email,
                rol          = membresia.rol,
                fechaRegistro = membresia.fechaRegistro,
            )
        }
    }

    /**
     * Actualiza los campos de identidad/visual del portal que NO requieren votación:
     * unidadAcademica, descripcion, iconoPortal, colorPortal, logoUrl.
     *
     * Universidad y carrera se cambian vía VotacionAdmin (CAMBIO_INFO_PORTAL).
     * Solo admins del portal pueden invocar este método.
     */
    @Transactional(rollbackOn = [Exception::class])
    fun actualizarPortal(portalId: Long, email: String, request: ActualizarPortalRequest): Portal {
        val portal = validarPortal(portalId)
        val usuario = validarUsuario(email)
        validarMembresiaUsuario(usuario, portalId, RolMembresia.ADMIN)

        request.unidadAcademica?.let { portal.unidadAcademica = it.trim().takeIf { v -> v.isNotBlank() } }
        request.descripcion?.let   { portal.descripcion       = it.trim().takeIf { v -> v.isNotBlank() } }
        request.iconoPortal?.let   { portal.iconoPortal       = it.trim().takeIf { v -> v.isNotBlank() } }
        request.colorPortal?.let   { portal.colorPortal       = it.trim().takeIf { v -> v.isNotBlank() } }
        request.logoUrl?.let       { portal.logoUrl           = it.trim().takeIf { v -> v.isNotBlank() } }
        request.tipoAcceso?.let    { portal.tipoAcceso        = it    }

        return portalRepository.save(portal)
    }

    @Transactional(rollbackOn = [Exception::class])
    fun levantarBloqueo(portalId: Long, userId: Long, emailAdmin: String) {
        val portal = validarPortal(portalId)
        val admin = validarUsuario(emailAdmin)

        validarMembresiaUsuario(admin, portalId, RolMembresia.ADMIN)

        val usuarioObjetivo = usuarioRepository.findById(userId).getOrNull()
            ?: throw ElementDoesNotExistException("Usuario no encontrado")

        val membresia = membresiaRepository.findByUsuarioIdAndPortalId(userId, portalId)

        val estaBloqueado = portalBloqueoRepository.existsByPortalAndUsuario(portal, usuarioObjetivo)

        if (!estaBloqueado) throw BusinessException("El usuario no está bloqueado")

        membresia?.let { membresiaRepository.delete(it) }

        portalBloqueoRepository.deleteByPortalAndUsuario(portal, usuarioObjetivo)
    }
}