package com.unsam.scholarium.service

import com.unsam.scholarium.exception.BusinessException
import com.unsam.scholarium.exception.ElementDoesNotExistException
import com.unsam.scholarium.exception.NotAdminException
import com.unsam.scholarium.exception.UnauthorizedException
import com.unsam.scholarium.model.EstadoVotacion
import com.unsam.scholarium.model.RolMembresia
import com.unsam.scholarium.model.TipoVotacion
import com.unsam.scholarium.model.VotacionAdmin
import com.unsam.scholarium.model.VotoAdmin
import com.unsam.scholarium.repository.MembresiaRepository
import com.unsam.scholarium.repository.PortalRepository
import com.unsam.scholarium.repository.UsuarioRepository
import com.unsam.scholarium.repository.VotacionAdminRepository
import com.unsam.scholarium.repository.VotoAdminRepository
import jakarta.transaction.Transactional
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import kotlin.jvm.optionals.getOrNull
import org.springframework.context.annotation.Lazy

@Service
class VotacionAdminService(
    private val votacionRepository: VotacionAdminRepository,
    private val votoRepository: VotoAdminRepository,
    private val portalRepository: PortalRepository,
    private val usuarioRepository: UsuarioRepository,
    private val membresiaRepository: MembresiaRepository,
    @Lazy private val portalService: PortalService,
    private val objectMapper: com.fasterxml.jackson.databind.ObjectMapper,  // ← agregar
) {

    companion object {
        private const val DURACION_HORAS = 72L
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
    fun toResponse(votacion: VotacionAdmin): com.unsam.scholarium.dto.VotacionResponse {
        val aFavor = votoRepository.countByVotacionAndAprueba(votacion, true)
        val enContra = votoRepository.countByVotacionAndAprueba(votacion, false)
        val totalAdmins = membresiaRepository.countByPortalAndRol(votacion.portal, RolMembresia.ADMIN)
        return com.unsam.scholarium.dto.VotacionResponse.fromEntity(votacion, aFavor, enContra, totalAdmins)
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

        when {
            aFavor > umbral -> {
                votacion.resolver(EstadoVotacion.APROBADA)
                votacionRepository.save(votacion)
                ejecutarAccion(votacion)
            }
            enContra > umbral -> {
                votacion.resolver(EstadoVotacion.RECHAZADA)
                votacionRepository.save(votacion)
            }
            // Sin mayoría todavía → queda ABIERTA.
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
                    portalId = votacion.portal.id!!,
                    usuarioObjetivoId = usuarioId,
                    emailAdmin = emailProponente,
                )
            }

            // TODO: cuando exista membresiaService.expulsar(usuarioId, portalId)
            TipoVotacion.EXPULSION_MIEMBRO -> { /* TODO */ }

            // TODO: cuando exista portalBloqueoService.bloquear(portal, usuarioId, motivo)
            TipoVotacion.BLOQUEO_MIEMBRO -> { /* TODO */ }

            // TODO: portalService.cambiarTipoAcceso(portal, nuevoTipo desde metadatos)
            TipoVotacion.CAMBIO_TIPO_ACCESO -> {  val metadatosJson = votacion.metadatos
                ?: throw BusinessException("metadatos requeridos para CAMBIO_TIPO_ACCESO")
                val nuevoTipoStr = objectMapper.readTree(metadatosJson)
                    .get("nuevoTipoAcceso")?.asText()
                    ?: throw BusinessException("Campo nuevoTipoAcceso ausente en metadatos")
                val nuevoTipo = com.unsam.scholarium.model.TipoAcceso.valueOf(nuevoTipoStr)
                portalService.cambiarTipoAcceso(
                    portalId = votacion.portal.id!!,
                    nuevoTipo = nuevoTipo,
                ) }

            // TODO: portalService.cambiarInfo(portal, nuevaInfo desde metadatos)
            TipoVotacion.CAMBIO_INFO_PORTAL -> { /* TODO */ }

            // TODO: materiaService.eliminar(UUID desde entidadId)
            TipoVotacion.ELIMINAR_MATERIA -> { /* TODO */ }

            // TODO: tableroService.eliminar(tableroId desde entidadId)
            TipoVotacion.ELIMINAR_TABLERO -> { /* TODO */ }

            // TODO: portalService.archivar(portal)
            TipoVotacion.ARCHIVAR_PORTAL -> { /* TODO */ }
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