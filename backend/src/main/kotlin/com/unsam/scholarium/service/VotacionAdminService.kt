package com.unsam.scholarium.service

import com.unsam.scholarium.dto.SolicitudRechazadaEvent
import com.unsam.scholarium.dto.VotacionAbiertaEvent
import com.unsam.scholarium.dto.VotacionAprobadaEvent
import com.unsam.scholarium.dto.VotacionEmpatadaEvent
import com.unsam.scholarium.dto.VotacionRechazadaEvent
import com.unsam.scholarium.exception.BusinessException
import com.unsam.scholarium.exception.ElementDoesNotExistException
import com.unsam.scholarium.exception.NotAdminException
import com.unsam.scholarium.exception.UnauthorizedException
import com.unsam.scholarium.model.EstadoVotacion
import com.unsam.scholarium.model.RolMembresia
import com.unsam.scholarium.model.TipoAccionAdmin
import com.unsam.scholarium.model.TipoVotacion
import com.unsam.scholarium.model.VotacionAdmin
import com.unsam.scholarium.model.VotoAdmin
import com.unsam.scholarium.repository.MembresiaRepository
import com.unsam.scholarium.repository.PortalRepository
import com.unsam.scholarium.repository.UsuarioRepository
import com.unsam.scholarium.repository.VotacionAdminRepository
import com.unsam.scholarium.repository.VotoAdminRepository
import jakarta.transaction.Transactional
import org.springframework.context.ApplicationEventPublisher
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import kotlin.jvm.optionals.getOrNull
import org.springframework.context.annotation.Lazy
import java.util.UUID

@Service
class VotacionAdminService(
    private val votacionRepository: VotacionAdminRepository,
    private val votoRepository: VotoAdminRepository,
    private val portalRepository: PortalRepository,
    private val usuarioRepository: UsuarioRepository,
    private val membresiaRepository: MembresiaRepository,
    @Lazy private val portalService: PortalService,
    @Lazy private val materiaService: MateriaService,
    @Lazy private val foroService: ForoService,
    private val objectMapper: com.fasterxml.jackson.databind.ObjectMapper,
    private val applicationEventPublisher: ApplicationEventPublisher,
    private val accionAdminService: AccionAdminService,
) {

    companion object {
        private const val DURACION_HORAS = 72L

        // Dentro del companion object de VotacionAdminService:
        private val TipoVotacion_LABEL = mapOf(
            TipoVotacion.DEGRADAR_ADMIN      to "Degradar administrador",
            TipoVotacion.EXPULSION_MIEMBRO   to "Expulsión de miembro",
            TipoVotacion.BLOQUEO_MIEMBRO     to "Bloqueo de miembro",
            TipoVotacion.CAMBIO_TIPO_ACCESO  to "Cambio de tipo de acceso",
            TipoVotacion.CAMBIO_UNIVERSIDAD  to "Cambio de universidad",
            TipoVotacion.CAMBIO_CARRERA      to "Cambio de carrera",
            TipoVotacion.ELIMINAR_MATERIA    to "Eliminación de materia",
            TipoVotacion.ELIMINAR_TABLERO    to "Eliminación de tablero",
            TipoVotacion.ARCHIVAR_PORTAL     to "Archivar portal",
            TipoVotacion.ACTIVAR_PORTAL to "Activar portal",
        )
    }

    /**
     * Crea una votación y registra el voto a favor del proponente automáticamente.
     * Si el proponente es el único admin del portal, la votación se aprueba y ejecuta
     * en el acto (mayoría 1/1).
     */
    @Transactional(rollbackOn = [Exception::class])
    fun crearVotacion(
        portalId: Long,
        tipo: TipoVotacion,
        motivo: String,
        entidadId: String?,
        metadatos: String?,
        emailProponente: String,
    ): VotacionAdmin {
        val portal = portalRepository.findById(portalId).getOrNull()
            ?: throw ElementDoesNotExistException("Portal no encontrado")

        val proponente = usuarioRepository.findByEmail(emailProponente)
            ?: throw ElementDoesNotExistException("Usuario no encontrado")

        if (!membresiaRepository.existsByUsuarioAndPortalAndRol(proponente, portal, RolMembresia.ADMIN)) {
            throw NotAdminException("Solo los admins del portal pueden proponer una votación")
        }

        val duplicada = votacionRepository.findFirstByPortalIdAndTipoAndEstadoAndEntidadId(
            portalId, tipo, EstadoVotacion.ABIERTA, entidadId,
        )
        if (duplicada != null) {
            throw BusinessException("Ya existe una votación abierta del mismo tipo sobre esa entidad")
        }

        val ahora = LocalDateTime.now()
        val votacion = VotacionAdmin(
            portal = portal,
            tipo = tipo,
            proponente = proponente,
            motivo = motivo,
            entidadId = entidadId,
            metadatos = metadatos,
            creadaEn = ahora,
            expiraEn = ahora.plusHours(DURACION_HORAS),
        )
        val guardada = votacionRepository.save(votacion)

        // El proponente queda con voto a favor automáticamente.
        votoRepository.save(
            VotoAdmin(votacion = guardada, admin = proponente, aprueba = true)
        )

        // Si era el único admin, ya hay mayoría 1/1 → resolver + ejecutar en el acto.
        evaluarYResolver(guardada)

        //Notificacion de votacion creada
        applicationEventPublisher.publishEvent(
            VotacionAbiertaEvent(votacion, portal, proponente)
        )
        
        // En crearVotacion(), después de evaluarYResolver(guardada) y antes del return:
        accionAdminService.registrar(
            portal             = portal,
            admin              = proponente,
            tipo               = TipoAccionAdmin.VOTACION_CREADA,
            entidadId          = guardada.id.toString(),
            entidadDescripcion = TipoVotacion_LABEL[tipo] ?: tipo.name,
            motivo             = motivo,
        )

        return guardada
    }

    /**
     * Registra el voto de un admin. Si se alcanza mayoría simple (>50%),
     * resuelve la votación y ejecuta la acción asociada.
     */
    @Transactional(rollbackOn = [Exception::class])
    fun registrarVoto(
        votacionId: Long,
        aprueba: Boolean,
        emailAdmin: String,
    ): VotacionAdmin {
        val votacion = votacionRepository.findById(votacionId).getOrNull()
            ?: throw ElementDoesNotExistException("Votación no encontrada")

        // Expiración perezosa: si ya venció pero seguía marcada como ABIERTA, cerramos.
        chequearExpiracion(votacion)

        if (votacion.estado != EstadoVotacion.ABIERTA) {
            throw BusinessException("La votación ya está cerrada")
        }

        val admin = usuarioRepository.findByEmail(emailAdmin)
            ?: throw ElementDoesNotExistException("Usuario no encontrado")

        if (!membresiaRepository.existsByUsuarioAndPortalAndRol(admin, votacion.portal, RolMembresia.ADMIN)) {
            throw NotAdminException("Solo los admins del portal pueden votar")
        }

        if (votoRepository.existsByVotacionAndAdmin(votacion, admin)) {
            throw BusinessException("Ya votaste en esta votación")
        }

        votoRepository.save(VotoAdmin(votacion = votacion, admin = admin, aprueba = aprueba))

        evaluarYResolver(votacion)

        return votacion
    }

    /**
     * Lista las votaciones del portal en el estado pedido.
     * Si se piden ABIERTAS, primero expira perezosamente las vencidas antes de devolver.
     */
    @Transactional(rollbackOn = [Exception::class])
    fun listarPorEstado(
        portalId: Long,
        estado: EstadoVotacion,
        emailUsuario: String,
    ): List<VotacionAdmin> {
        validarMiembroOAdmin(portalId, emailUsuario)

        if (estado == EstadoVotacion.ABIERTA) {
            votacionRepository
                .findByPortalIdAndEstadoOrderByCreadaEnDesc(portalId, EstadoVotacion.ABIERTA)
                .filter { it.estaVencida() }
                .forEach {
                    it.resolver(EstadoVotacion.EXPIRADA)
                    votacionRepository.save(it)
                }
        }

        return votacionRepository.findByPortalIdAndEstadoOrderByCreadaEnDesc(portalId, estado)
    }

    /** Historial paginado: votaciones cerradas del portal. */
    fun listarHistorial(
        portalId: Long,
        pageable: Pageable,
        emailUsuario: String,
    ): Page<VotacionAdmin> {
        validarMiembroOAdmin(portalId, emailUsuario)
        val cerradas = listOf(
            EstadoVotacion.APROBADA,
            EstadoVotacion.RECHAZADA,
            EstadoVotacion.EXPIRADA,
        )
        return votacionRepository
            .findByPortalIdAndEstadoInOrderByCreadaEnDesc(portalId, cerradas, pageable)
    }

    /**
     * Convierte una VotacionAdmin a su DTO de respuesta, computando los contadores
     * de votos y el total de admins del portal.
     * Se expone como público para que el controller pueda serializar tanto los
     * resultados de las acciones (crear/votar) como los listados.
     */
    fun toResponse(votacion: VotacionAdmin, email: String): com.unsam.scholarium.dto.VotacionResponse {
        val admin = usuarioRepository.findByEmail(email)
            ?: throw ElementDoesNotExistException("Usuario no encontrado")

        val yaVoto = votoRepository.existsByVotacionAndAdmin(votacion, admin)
        val aFavor = votoRepository.countByVotacionAndAprueba(votacion, true)
        val enContra = votoRepository.countByVotacionAndAprueba(votacion, false)
        val totalAdmins = membresiaRepository.countByPortalAndRol(votacion.portal, RolMembresia.ADMIN)
        return com.unsam.scholarium.dto.VotacionResponse.fromEntity(votacion, aFavor, enContra, totalAdmins, yaVoto)
    }

    // Internals

    /**
     * Cuenta los votos y, si hay mayoría simple (>50% de los admins ACTUALES del portal),
     * resuelve la votación. Si quedó APROBADA, ejecuta la acción asociada.
     *
     * La "mayoría simple" usa el padrón actual de admins, no el de cuando se creó la
     * votación: es intencional, así si entran/salen admins durante la votación el quórum
     * se recalcula automáticamente.
     */
    private fun evaluarYResolver(votacion: VotacionAdmin) {
        val totalAdmins = membresiaRepository.countByPortalAndRol(votacion.portal, RolMembresia.ADMIN)
        if (totalAdmins == 0L) return  // Edge case: portal sin admins, nada que decidir

        val aFavor = votoRepository.countByVotacionAndAprueba(votacion, true)
        val enContra = votoRepository.countByVotacionAndAprueba(votacion, false)
        // Mayoría simple: más de la mitad. Con int division: aFavor > totalAdmins/2
        // funciona tanto para totales pares como impares.
        val umbral = totalAdmins / 2

        val totalVotos = aFavor + enContra
        val hayEmpate = aFavor == enContra && totalVotos > 0

        when {
            aFavor > umbral -> {
                votacion.resolver(EstadoVotacion.APROBADA)
                votacionRepository.save(votacion)
                accionAdminService.registrar(
                    portal             = votacion.portal,
                    admin              = votacion.proponente,
                    tipo               = TipoAccionAdmin.VOTACION_APROBADA,
                    entidadId          = votacion.id.toString(),
                    entidadDescripcion = TipoVotacion_LABEL[votacion.tipo] ?: votacion.tipo.name,
                    motivo             = votacion.motivo,
                )
                ejecutarAccion(votacion)

                //Notificacion de votacion aprobada
                applicationEventPublisher.publishEvent(
                    VotacionAprobadaEvent(votacion, votacion.portal, votacion.proponente)
                )
            }
            enContra > umbral -> {
                votacion.resolver(EstadoVotacion.RECHAZADA)
                votacionRepository.save(votacion)

                //Notificacion de votacion rechazada
                applicationEventPublisher.publishEvent(
                    VotacionEmpatadaEvent(votacion, votacion.portal, votacion.proponente)
                )

                accionAdminService.registrar(
                    portal             = votacion.portal,
                    admin              = votacion.proponente,
                    tipo               = TipoAccionAdmin.VOTACION_RECHAZADA,
                    entidadId          = votacion.id.toString(),
                    entidadDescripcion = TipoVotacion_LABEL[votacion.tipo] ?: votacion.tipo.name,
                    motivo             = votacion.motivo,
                )
            }
            hayEmpate -> {
                votacion.resolver(EstadoVotacion.EXPIRADA)
                votacionRepository.save(votacion)
                accionAdminService.registrar(
                    portal             = votacion.portal,
                    admin              = votacion.proponente,
                    tipo               = TipoAccionAdmin.VOTACION_CERRADA,
                    entidadId          = votacion.id.toString(),
                    entidadDescripcion = TipoVotacion_LABEL[votacion.tipo] ?: votacion.tipo.name,
                    motivo             = votacion.motivo,

                )
            }
        }
    }

    /**
     * Ejecuta la acción asociada al tipo de votación aprobada.
     *
     * Los `TODO` corresponden a tickets en los que el service o método aún no existe.
     * Cuando se implementen, basta con descomentar/agregar la llamada acá.
     * Mientras tanto, la votación se marca APROBADA en la DB pero la acción real no se ejecuta.
     */
    private fun ejecutarAccion(votacion: VotacionAdmin) {
        val emailProponente = votacion.proponente.email

        when (votacion.tipo) {

            TipoVotacion.DEGRADAR_ADMIN -> {
                val usuarioId = votacion.entidadId?.toLongOrNull()
                    ?: throw BusinessException("entidadId inválido para DEGRADAR_ADMIN")
                portalService.degradarAdmin(
                    portalId          = votacion.portal.id!!,
                    usuarioObjetivoId = usuarioId,
                    emailAdmin        = emailProponente,
                )
                // degradarAdmin ya registra la acción internamente.
            }

            TipoVotacion.EXPULSION_MIEMBRO -> {
                val usuarioId = votacion.entidadId?.toLongOrNull()
                    ?: throw BusinessException("entidadId inválido para EXPULSION_MIEMBRO")
                portalService.removerMiembro(
                    portalId          = votacion.portal.id!!,
                    usuarioObjetivoId = usuarioId,
                    emailAdmin        = emailProponente,
                )
                // removerMiembro ya registra la acción internamente.
            }

            TipoVotacion.BLOQUEO_MIEMBRO -> { /* TODO */ }

            TipoVotacion.CAMBIO_TIPO_ACCESO -> {
                val metadatosJson = votacion.metadatos
                    ?: throw BusinessException("metadatos requeridos para CAMBIO_TIPO_ACCESO")
                val nuevoTipoStr = objectMapper.readTree(metadatosJson)
                    .get("nuevoTipoAcceso")?.asText()
                    ?: throw BusinessException("Campo nuevoTipoAcceso ausente en metadatos")
                val nuevoTipo = com.unsam.scholarium.model.TipoAcceso.valueOf(nuevoTipoStr)

                // Capturar antes de mutar
                val portalActual = portalRepository.findById(votacion.portal.id!!).getOrNull()
                val tipoAnterior = portalActual?.tipoAcceso?.name ?: "—"

                portalService.cambiarTipoAcceso(portalId = votacion.portal.id!!, nuevoTipo = nuevoTipo)

                val labelAnterior = if (tipoAnterior == "ABIERTO") "Abierto" else "Cerrado"
                val labelNuevo    = if (nuevoTipoStr == "ABIERTO") "Abierto" else "Cerrado"

                accionAdminService.registrar(
                    portal             = votacion.portal,
                    admin              = votacion.proponente,
                    tipo               = TipoAccionAdmin.PORTAL_TIPO_ACCESO_CAMBIADO,
                    entidadDescripcion = "$labelAnterior → $labelNuevo",
                    motivo             = votacion.motivo,
                )
            }

            TipoVotacion.CAMBIO_UNIVERSIDAD -> {
                val metadatosJson = votacion.metadatos
                    ?: throw BusinessException("metadatos requeridos para CAMBIO_UNIVERSIDAD")
                val nuevoValor = objectMapper.readTree(metadatosJson)
                    .get("nuevoValor")?.asText()
                    ?: throw BusinessException("Campo nuevoValor ausente en metadatos")

                val portalActual = portalRepository.findById(votacion.portal.id!!).getOrNull()
                val valorAnterior = portalActual?.universidad ?: "—"

                portalService.cambiarUniversidad(portalId = votacion.portal.id!!, nuevaUniversidad = nuevoValor)

                accionAdminService.registrar(
                    portal             = votacion.portal,
                    admin              = votacion.proponente,
                    tipo               = TipoAccionAdmin.PORTAL_UNIVERSIDAD_CAMBIADA,
                    entidadDescripcion = "\"$valorAnterior\" → \"$nuevoValor\"",
                    motivo             = votacion.motivo,
                )
            }

            TipoVotacion.CAMBIO_CARRERA -> {
                val metadatosJson = votacion.metadatos
                    ?: throw BusinessException("metadatos requeridos para CAMBIO_CARRERA")
                val nuevoValor = objectMapper.readTree(metadatosJson)
                    .get("nuevoValor")?.asText()
                    ?: throw BusinessException("Campo nuevoValor ausente en metadatos")

                val portalActual = portalRepository.findById(votacion.portal.id!!).getOrNull()
                val valorAnterior = portalActual?.carrera ?: "—"

                portalService.cambiarCarrera(portalId = votacion.portal.id!!, nuevaCarrera = nuevoValor)

                accionAdminService.registrar(
                    portal             = votacion.portal,
                    admin              = votacion.proponente,
                    tipo               = TipoAccionAdmin.PORTAL_CARRERA_CAMBIADA,
                    entidadDescripcion = "\"$valorAnterior\" → \"$nuevoValor\"",
                    motivo             = votacion.motivo,
                )
            }

            TipoVotacion.ELIMINAR_MATERIA -> {
                //TODO: Impementar bien un endpoint que haga soft delete de la materia...
               /* val materiaId = votacion.entidadId?.let {
                    runCatching { java.util.UUID.fromString(it) }.getOrNull()
                } ?: throw BusinessException("entidadId inválido para ELIMINAR_MATERIA")
                materiaService.eliminarMateria(materiaId)*/
            }

            TipoVotacion.ELIMINAR_TABLERO -> {
                val tableroId = votacion.entidadId?.let {
                    runCatching { java.util.UUID.fromString(it) }.getOrNull()
                } ?: throw BusinessException("entidadId inválido para ELIMINAR_TABLERO")
                foroService.eliminarTablero(tableroId)

                accionAdminService.registrar(
                    portal    = votacion.portal,
                    admin     = votacion.proponente,
                    tipo      = TipoAccionAdmin.TABLERO_ELIMINADO,
                    entidadId = tableroId.toString(),
                    motivo    = votacion.motivo,
                )
            }

            TipoVotacion.ARCHIVAR_PORTAL -> {
                portalService.archivarPortal(votacion.portal.id!!)

                accionAdminService.registrar(
                    portal = votacion.portal,
                    admin  = votacion.proponente,
                    tipo   = TipoAccionAdmin.PORTAL_ARCHIVADO,
                    motivo = votacion.motivo,
                )
            }

            TipoVotacion.ACTIVAR_PORTAL -> {
                portalService.activarPortal(votacion.portal.id!!)

                accionAdminService.registrar(
                    portal = votacion.portal,
                    admin  = votacion.proponente,
                    tipo   = TipoAccionAdmin.PORTAL_ACTIVADO,
                    motivo = votacion.motivo,
                )
            }
        }
    }

    /** Si está abierta pero venció, la cierra como EXPIRADA. */
    private fun chequearExpiracion(votacion: VotacionAdmin) {
        if (votacion.estaVencida()) {
            votacion.resolver(EstadoVotacion.EXPIRADA)
            votacionRepository.save(votacion)
        }
    }

    /** Cualquier miembro/admin puede leer las votaciones del portal. */
    private fun validarMiembroOAdmin(portalId: Long, email: String) {
        val portal = portalRepository.findById(portalId).getOrNull()
            ?: throw ElementDoesNotExistException("Portal no encontrado")
        val usuario = usuarioRepository.findByEmail(email)
            ?: throw ElementDoesNotExistException("Usuario no encontrado")

        val esMiembro = membresiaRepository
            .existsByUsuarioAndPortalAndRol(usuario, portal, RolMembresia.MIEMBRO)
        val esAdmin = membresiaRepository
            .existsByUsuarioAndPortalAndRol(usuario, portal, RolMembresia.ADMIN)

        if (!esMiembro && !esAdmin) {
            throw UnauthorizedException("No sos miembro de este portal")
        }
    }
}