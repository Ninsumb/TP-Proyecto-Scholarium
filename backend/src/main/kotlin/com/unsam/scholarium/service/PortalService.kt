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
import com.unsam.scholarium.model.TipoAccionAdmin
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
import com.unsam.scholarium.dto.SolicitudAprobadaEvent
import com.unsam.scholarium.dto.UsuarioExpulsadoEvent
import com.unsam.scholarium.dto.VotacionResponse
import com.unsam.scholarium.model.TipoAcceso
import com.unsam.scholarium.model.TipoVotacion
import com.unsam.scholarium.repository.PortalBloqueoRepository
import jakarta.transaction.Transactional
import org.springframework.context.ApplicationEventPublisher
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
    private val portalBloqueoRepository: PortalBloqueoRepository,
    private val applicationEventPublisher: ApplicationEventPublisher,
    private val accionAdminService: AccionAdminService,
    private val mailService: MailService
) {

    // ── Helpers ────────────────────────────────────────────────────────────

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

    // ── Queries (sin cambios) ──────────────────────────────────────────────

    fun getDetalleById(id: Long, email: String): Triple<Portal, RolMembresia?, List<Int>> {
        val portal = portalRepository.findById(id).getOrNull()
            ?: throw ElementDoesNotExistException("Portal $id no encontrado")
        if (!portal.activo) {
            val membresiaTemporal = membresiaRepository.findByUsuarioIdAndPortalId(
                usuarioRepository.findByEmail(email)?.id ?: throw ElementDoesNotExistException("Usuario no encontrado"),
                id
            )
            if (membresiaTemporal?.rol != RolMembresia.ADMIN) {
                throw UnauthorizedException("Este portal está archivado")
            }
        }

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
                    ?.map { MateriaArbolDTO(id = it.id!!, nombre = it.nombre, foroId = null, orden = it.orden) }
                    ?: emptyList()
            )
        }
        val carpetasRaiz = mutableListOf<CarpetaArbolDTO>()
        carpetas.sortedBy { it.orden }.forEach { carpeta ->
            val dto = carpetasMap[carpeta.id]!!
            if (carpeta.carpetaPadre?.id == null) carpetasRaiz.add(dto)
            else carpetasMap[carpeta.carpetaPadre?.id]?.subcarpetas?.add(dto)
        }
        return PortalEstructuraDTO(portalId = portal.id!!, carpetas = carpetasRaiz.sortedBy { it.orden })
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
            tipoAcceso = TipoAcceso.valueOf(request.tipoAcceso)
        )

        val membresiaAdmin = Membresia(usuario = usuario, portal = portal, rol = RolMembresia.ADMIN)
        portal.addMembresia(membresiaAdmin)

        val portalGuardado = portalRepository.save(portal)

        // Etiqueta general por defecto
        etiquetaRepository.save(Etiqueta(nombre = "General", portal = portalGuardado))

        // PlantillaSolicitud: abierta por defecto con mensaje de bienvenida
        plantillaSolicitudRepository.save(
            PlantillaSolicitud(portal = portalGuardado, requisitos = PlantillaSolicitud.REQUISITOS_DEFAULT, abierta = true)
        )

        return portalGuardado
        // No registramos acción acá: el creador no es "admin actuando sobre el portal",
        // es la creación inicial. Si querés loguearla igual, agregá registrar() acá.
    }

    @Transactional(rollbackOn = [Exception::class])
    fun createCarpeta(idPortal: Long, email: String, request: CarpetaRequest): Carpeta {
        val portal = validarPortal(idPortal)
        val usuario = validarUsuario(email)
        validarMembresiaUsuario(usuario, idPortal, RolMembresia.ADMIN)

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

        val nuevaCarpeta = Carpeta(nombre = request.nombre, portal = portal, carpetaPadre = padre, orden = nuevoOrden)
        val guardada = carpetaRepository.save(nuevaCarpeta)

        accionAdminService.registrar(
            portal             = portal,
            admin              = usuario,
            tipo               = TipoAccionAdmin.CARPETA_CREADA,
            entidadId          = guardada.id.toString(),
            entidadDescripcion = guardada.nombre,
        )

        return guardada
    }

    fun renameCarpeta(idPortal: Long, idCarpeta: UUID, email: String, nuevoNombre: String) {
        validarPortal(idPortal)
        val usuario = validarUsuario(email)
        validarMembresiaUsuario(usuario, idPortal, RolMembresia.ADMIN)
        val portal = validarPortal(idPortal)

        if (nuevoNombre.isEmpty()) throw BusinessException("El nuevo nombre de la carpeta no puede estar vacío")
        if (nuevoNombre.length > 100) throw BusinessException("El nuevo nombre no puede pasar de los 100 caracteres")

        val carpeta = carpetaRepository.findById(idCarpeta).getOrNull()
            ?: throw ElementDoesNotExistException("La carpeta $idCarpeta no existe.")

        if (carpetaRepository.findByNombre(nuevoNombre).getOrNull(0) != null)
            throw ItemConflictException("Ya hay una carpeta con el mismo nombre")

        val nombreAnterior = carpeta.nombre
        carpeta.nombre = nuevoNombre
        carpetaRepository.save(carpeta)

        accionAdminService.registrar(
            portal             = portal,
            admin              = usuario,
            tipo               = TipoAccionAdmin.CARPETA_RENOMBRADA,
            entidadId          = idCarpeta.toString(),
            entidadDescripcion = nuevoNombre,
            motivo             = "Nombre anterior: $nombreAnterior",
        )
    }

    @Transactional(rollbackOn = [Exception::class])
    fun cambiarTipoAcceso(portalId: Long, nuevoTipo: TipoAcceso) {
        val portal = portalRepository.findById(portalId).getOrNull()
            ?: throw ElementDoesNotExistException("Portal no encontrado")
        val tipoAnterior = portal.tipoAcceso
        portal.tipoAcceso = nuevoTipo
        portalRepository.save(portal)
        // El admin que ejecuta la acción es el proponente de la votación aprobada.
        // La instrumentación se hace en VotacionAdminService.ejecutarAccion()
        // para tener acceso al proponente. No dupliques acá.
    }

    @Transactional(rollbackOn = [Exception::class])
    fun actualizarPlantillaSolicitud(idPortal: Long, email: String, request: ActualizarPlantillaSolicitudRequest) {
        val usuario = validarUsuario(email)
        validarMembresiaUsuario(usuario, idPortal, RolMembresia.ADMIN)
        val portal = validarPortal(idPortal)

        val plantilla = plantillaSolicitudRepository.findByPortalId(idPortal)
            ?: throw ElementDoesNotExistException("Plantilla de solicitud no encontrada")

        val requisitos = request.requisitos.trim()
        if (requisitos.isBlank()) throw BusinessException("Los requisitos no pueden estar vacíos")
        if (requisitos.length > 1000) throw BusinessException("Los requisitos son demasiado largos")

        val abiertaAnterior = plantilla.abierta
        plantilla.requisitos = requisitos
        plantilla.abierta = request.abierta
        plantillaSolicitudRepository.save(plantilla)

        // Acción de estado (abierta/cerrada) — solo si cambió
        if (plantilla.abierta != abiertaAnterior) {
            accionAdminService.registrar(
                portal             = portal,
                admin              = usuario,
                tipo               = TipoAccionAdmin.SOLICITUDES_ESTADO_CAMBIADO,
                entidadDescripcion = if (plantilla.abierta) "Portal abierto a nuevas solicitudes" else "Portal cerrado a nuevas solicitudes",
            )
        }

        // Acción de requisitos — siempre que se guarde (el endpoint lo hace explícitamente)
        accionAdminService.registrar(
            portal             = portal,
            admin              = usuario,
            tipo               = TipoAccionAdmin.PLANTILLA_SOLICITUD_ACTUALIZADA,
            entidadDescripcion = "Texto de requisitos de solicitud actualizado",
        )
    }

    @Transactional(rollbackOn = [Exception::class])
    fun patch(portal: Portal) {
        portalRepository.save(portal)
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

        val portal = membresiaObjetivo.portal!! //xD
        membresiaRepository.delete(membresiaObjetivo)

        applicationEventPublisher.publishEvent(
            UsuarioExpulsadoEvent(
                usuario = usuarioObjetivo,
                portal = membresiaObjetivo.portal!!,
                motivo = "" //Hardcodeado, agregar luego que se pueda poner motivo
            )
        )
        
        accionAdminService.registrar(
            portal             = portal,
            admin              = admin,
            tipo               = TipoAccionAdmin.MIEMBRO_EXPULSADO,
            entidadId          = usuarioObjetivoId.toString(),
            entidadDescripcion = usuarioObjetivo.nombre,
        )
    }

    fun promoverAdmin(portalId: Long, usuarioObjetivoId: Long, emailAdmin: String): MembresiaResponse {
        val portal = validarPortal(portalId)
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

        accionAdminService.registrar(
            portal             = portal,
            admin              = admin,
            tipo               = TipoAccionAdmin.MIEMBRO_ASCENDIDO,
            entidadId          = usuarioObjetivoId.toString(),
            entidadDescripcion = usuarioObjetivo.nombre,
        )

        return MembresiaResponse(
            membresiaId = membresiaObjetivo.id!!,
            usuarioId   = usuarioObjetivo.id!!,
            portalId    = portalId,
            rol         = membresiaObjetivo.rol
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

        accionAdminService.registrar(
            portal             = portal,
            admin              = admin,
            tipo               = TipoAccionAdmin.MIEMBRO_DEGRADADO,
            entidadId          = usuarioObjetivoId.toString(),
            entidadDescripcion = usuarioObjetivo.nombre,
        )

        return MembresiaResponse(
            membresiaId = membresiaObjetivo.id!!,
            usuarioId   = usuarioObjetivo.id!!,
            portalId    = portalId,
            rol         = membresiaObjetivo.rol
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
                usuarioId     = membresia.usuario.id!!,
                membresiaId   = membresia.id!!,
                nombre        = membresia.usuario.nombre,
                email         = membresia.usuario.email,
                rol           = membresia.rol,
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

        val cambios = mutableListOf<String>()

        request.unidadAcademica?.let {
            val nuevo = it.trim().takeIf { v -> v.isNotBlank() }
            if (portal.unidadAcademica != nuevo) {
                cambios.add("Unidad académica: \"${portal.unidadAcademica ?: "—"}\" → \"${nuevo ?: "—"}\"")
                portal.unidadAcademica = nuevo
            }
        }
        request.descripcion?.let {
            val nuevo = it.trim().takeIf { v -> v.isNotBlank() }
            if (portal.descripcion != nuevo) {
                cambios.add("Descripción actualizada")
                portal.descripcion = nuevo
            }
        }
        val nuevoIcono = request.iconoPortal?.trim()?.takeIf { it.isNotBlank() }
        if (portal.iconoPortal != nuevoIcono) {
            cambios.add("Ícono: \"${portal.iconoPortal ?: "—"}\" → \"${nuevoIcono ?: "—"}\"")
            portal.iconoPortal = nuevoIcono
        }

        val nuevoColor = request.colorPortal?.trim()?.takeIf { it.isNotBlank() }
        if (portal.colorPortal != nuevoColor) {
            cambios.add("Color: \"${portal.colorPortal ?: "—"}\" → \"${nuevoColor ?: "—"}\"")
            portal.colorPortal = nuevoColor
        }

        val nuevoLogo = request.logoUrl?.trim()?.takeIf { it.isNotBlank() }
        if (portal.logoUrl != nuevoLogo) {
            cambios.add("Logo actualizado")
            portal.logoUrl = nuevoLogo
        }

        val guardado = portalRepository.save(portal)

        if (cambios.isNotEmpty()) {
            accionAdminService.registrar(
                portal             = portal,
                admin              = usuario,
                tipo               = TipoAccionAdmin.PORTAL_ACTUALIZADO,
                entidadDescripcion = cambios.joinToString(" · "),
            )
        }

        return guardado
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

        accionAdminService.registrar(
            portal             = portal,
            admin              = admin,
            tipo               = TipoAccionAdmin.BLOQUEO_LEVANTADO,
            entidadId          = userId.toString(),
            entidadDescripcion = usuarioObjetivo.nombre,
        )
    }

    @Transactional(rollbackOn = [Exception::class])
    fun cambiarUniversidad(portalId: Long, nuevaUniversidad: String) {
        val portal = portalRepository.findById(portalId).getOrNull()
            ?: throw ElementDoesNotExistException("Portal no encontrado")
        val universidadNormalizada = Portal.normalizarParaUnicidad(nuevaUniversidad)
        val carreraNormalizada = Portal.normalizarParaUnicidad(portal.carrera)
        if (portalRepository.existePortalConValoresNormalizados(universidadNormalizada, carreraNormalizada)) {
            throw BusinessException("Ya existe un portal con esa universidad y carrera")
        }
        portal.universidad = nuevaUniversidad.trim()
        portal.universidadNormalizada = universidadNormalizada
        portalRepository.save(portal)
        // Acción registrada en VotacionAdminService.ejecutarAccion()
    }

    @Transactional(rollbackOn = [Exception::class])
    fun cambiarCarrera(portalId: Long, nuevaCarrera: String) {
        val portal = portalRepository.findById(portalId).getOrNull()
            ?: throw ElementDoesNotExistException("Portal no encontrado")
        val universidadNormalizada = Portal.normalizarParaUnicidad(portal.universidad)
        val carreraNormalizada = Portal.normalizarParaUnicidad(nuevaCarrera)
        if (portalRepository.existePortalConValoresNormalizados(universidadNormalizada, carreraNormalizada)) {
            throw BusinessException("Ya existe un portal con esa universidad y carrera")
        }
        portal.carrera = nuevaCarrera.trim()
        portal.carreraNormalizada = carreraNormalizada
        portalRepository.save(portal)
        // Acción registrada en VotacionAdminService.ejecutarAccion()
    }

    @Transactional(rollbackOn = [Exception::class])
    fun archivarPortal(portalId: Long) {
        val portal = portalRepository.findById(portalId).getOrNull()
            ?: throw ElementDoesNotExistException("Portal no encontrado")
        portal.activo = false
        portalRepository.save(portal)
        // Acción registrada en VotacionAdminService.ejecutarAccion()
    }

    @Transactional(rollbackOn = [Exception::class])
    fun activarPortal(portalId: Long) {
        val portal = portalRepository.findById(portalId).getOrNull()
            ?: throw ElementDoesNotExistException("Portal no encontrado")
        portal.activo = true
        portalRepository.save(portal)
    }

   @Transactional(rollbackOn = [Exception::class])
fun bloquearMiembro(portalId: Long, usuarioObjetivoId: Long, emailAdmin: String) {
    val admin = validarUsuario(emailAdmin)

    val membresiaAdmin = membresiaRepository.findByUsuarioIdAndPortalId(admin.id!!, portalId)
    if (membresiaAdmin?.rol != RolMembresia.ADMIN) {
        throw NotAdminException("Solo los administradores pueden bloquear miembros")
    }

    val usuarioObjetivo = usuarioRepository.findById(usuarioObjetivoId).getOrNull()
        ?: throw ElementDoesNotExistException("Usuario no encontrado")

    if (admin.id == usuarioObjetivo.id) {
        throw BusinessException("No podés bloquearte a vos mismo")
    }

    
    val membresiaObjetivo = membresiaRepository.findByUsuarioIdAndPortalId(usuarioObjetivoId, portalId)
    
    
    val portal = membresiaObjetivo?.portal ?: portalRepository.findById(portalId).getOrNull()
        ?: throw ElementDoesNotExistException("Portal no encontrado")

    
    if (membresiaObjetivo != null) {
        membresiaRepository.delete(membresiaObjetivo)
        membresiaRepository.flush() 
    }

    val estaBloqueado = portalBloqueoRepository.existsByPortalAndUsuario(portal, usuarioObjetivo)
    if (!estaBloqueado) {
        portalBloqueoRepository.save(
            com.unsam.scholarium.model.PortalBloqueo(portal = portal, usuario = usuarioObjetivo)
        )
    }

    applicationEventPublisher.publishEvent(
        UsuarioExpulsadoEvent(
            usuario = usuarioObjetivo,
            portal = portal,
            motivo = "Bloqueo por decisión administrativa" 
        )
    )

    accionAdminService.registrar(
        portal             = portal,
        admin              = admin,
        tipo               = TipoAccionAdmin.MIEMBRO_BLOQUEADO,
        entidadId          = usuarioObjetivoId.toString(),
        entidadDescripcion = usuarioObjetivo.nombre,
    )
}

    @Transactional(rollbackOn = [Exception::class])
    fun denunciarPortal(portalId: Long, emailUsuario: String, request: com.unsam.scholarium.dto.DenunciaPortalRequest) {
        val portal = validarPortal(portalId)
        val usuario = validarUsuario(emailUsuario)

        val staffEmail = "support.scholarium@gmail.com" 
        
        val asunto = "🚨 Nueva Denuncia de Portal: ${portal.universidad} - ${portal.carrera}"
        
        val cuerpoHtml = """
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px; color: #333;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background-color: #ef4444; color: white; padding: 20px; text-align: center;">
                            <h1 style="margin: 0; font-size: 20px;">🚨 Reporte de Moderación</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px;">
                            <p style="margin-top: 0; color: #4b5563; line-height: 1.5;">Se ha recibido una nueva denuncia para un portal en la plataforma. A continuación, los detalles del caso:</p>
                            
                            <div style="margin-bottom: 25px;">
                                <h2 style="font-size: 16px; font-weight: bold; color: #111827; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px; margin-bottom: 15px;">🏛️ Datos del Portal</h2>
                                <p style="margin: 0 0 10px 0;"><strong>ID:</strong> ${portal.id}</p>
                                <p style="margin: 0 0 10px 0;"><strong>Universidad:</strong> ${portal.universidad}</p>
                                <p style="margin: 0 0 10px 0;"><strong>Carrera:</strong> ${portal.carrera}</p>
                            </div>

                            <div style="margin-bottom: 25px;">
                                <h2 style="font-size: 16px; font-weight: bold; color: #111827; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px; margin-bottom: 15px;">👤 Datos del Denunciante</h2>
                                <p style="margin: 0 0 10px 0;"><strong>ID Usuario:</strong> ${usuario.id}</p>
                                <p style="margin: 0 0 10px 0;"><strong>Nombre:</strong> ${usuario.nombre}</p>
                                <p style="margin: 0 0 10px 0;"><strong>Email:</strong> <a href="mailto:${usuario.email}" style="color: #2563eb; text-decoration: none;">${usuario.email}</a></p>
                            </div>

                            <div style="margin-bottom: 25px;">
                                <h2 style="font-size: 16px; font-weight: bold; color: #111827; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px; margin-bottom: 15px;">⚠️ Detalles de la Denuncia</h2>
                                <p style="margin: 0 0 5px 0;"><strong>Motivo Principal:</strong></p>
                                <div style="padding: 10px; background-color: #fee2e2; color: #991b1b; border-radius: 4px; font-weight: bold; display: inline-block; margin-bottom: 15px;">
                                    ${request.motivo}
                                </div>
                                
                                <p style="margin: 0 0 5px 0;"><strong>Comentarios adicionales:</strong></p>
                                <div style="padding: 15px; background-color: #f9fafb; border-left: 4px solid #d1d5db; color: #4b5563; font-style: italic;">
                                    ${request.comentarios ?: "El usuario no brindó comentarios adicionales."}
                                </div>
                            </div>

                            <div style="text-align: center; margin-top: 35px;">
                                <a href="http://localhost:5173/portal/${portal.id}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; text-transform: uppercase; font-size: 14px;">
                                    Revisar el Portal
                                </a>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb;">
                            Este es un mensaje automático generado por el sistema de moderación de Scholarium.
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        """.trimIndent()

        
        mailService.send(to = staffEmail, subject = asunto, body = cuerpoHtml, isHtml = true)
    }




}