package com.unsam.scholarium.service

import com.unsam.scholarium.dto.PlantillaSolicitudResponse
import com.unsam.scholarium.dto.RechazarSolicitudRequest
import com.unsam.scholarium.dto.SolicitudRequest
import com.unsam.scholarium.dto.SolicitudResponse
import com.unsam.scholarium.dto.UsuarioResumenDTO
import com.unsam.scholarium.exception.BusinessException
import com.unsam.scholarium.exception.ElementDoesNotExistException
import com.unsam.scholarium.exception.NotAdminException
import com.unsam.scholarium.model.Estado
import com.unsam.scholarium.model.Membresia
import com.unsam.scholarium.model.PlantillaSolicitud
import com.unsam.scholarium.model.RolMembresia
import com.unsam.scholarium.model.Solicitud
import com.unsam.scholarium.model.TipoAccionAdmin
import com.unsam.scholarium.repository.MembresiaRepository
import com.unsam.scholarium.repository.PlantillaSolicitudRepository
import com.unsam.scholarium.repository.PortalBloqueoRepository
import com.unsam.scholarium.repository.PortalRepository
import com.unsam.scholarium.repository.SolicitudRepository
import com.unsam.scholarium.repository.UsuarioRepository
import com.unsam.scholarium.dto.ActualizarPlantillaRequest
import com.unsam.scholarium.dto.PuedeSolicitarResponse
import com.unsam.scholarium.dto.SolicitudAprobadaEvent
import com.unsam.scholarium.dto.SolicitudRechazadaEvent
import jakarta.transaction.Transactional
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import kotlin.jvm.optionals.getOrNull

@Service
class SolicitudService(
    val solicitudRepository: SolicitudRepository,
    val membresiaRepository: MembresiaRepository,
    val usuarioRepository: UsuarioRepository,
    val portalRepository: PortalRepository,
    val plantillaSolicitudRepository: PlantillaSolicitudRepository,
    val portalBloqueoRepository: PortalBloqueoRepository,
    val applicationEventPublisher: ApplicationEventPublisher,
    private val accionAdminService: AccionAdminService,
) {

    // ── Helpers privados ───────────────────────────────────────────────────

    private fun validarSolicitud(solicitudId: Long): Solicitud =
        solicitudRepository.findById(solicitudId)
            .orElseThrow { ElementDoesNotExistException("La solicitud no existe") }

    private fun validarAdmin(solicitud: Solicitud, emailAdmin: String) {
        val admin = usuarioRepository.findByEmail(emailAdmin)
            ?: throw ElementDoesNotExistException("El usuario no existe")

        val esAdmin = membresiaRepository.existsByUsuarioIdAndPortalIdAndRol(
            admin.id!!,
            solicitud.portal.id!!,
            RolMembresia.ADMIN
        )

        if (!esAdmin) throw NotAdminException("No tenés permisos para gestionar esta solicitud")
    }

    // ── Crear solicitud ────────────────────────────────────────────────────

    /**
     * Crea una nueva Solicitud de membresía.
     *
     * Validaciones:
     * 1. El portal existe.
     * 2. El usuario existe.
     * 3. El portal acepta solicitudes (PlantillaSolicitud.abierta = true).
     * 4. El usuario no es ya miembro activo del portal.
     * 5. El usuario no tiene una solicitud PENDIENTE para ese portal.
     * 6. El usuario no está bloqueado en ese portal.
     *
     * Migrado desde PortalService para consolidar toda la lógica de Solicitud acá.
     */
    @Transactional
    fun createSolicitud(idPortal: Long, email: String, request: SolicitudRequest) {
        val portal = portalRepository.findById(idPortal).getOrNull()
            ?: throw ElementDoesNotExistException("Portal no encontrado")

        val usuario = usuarioRepository.findByEmail(email)
            ?: throw ElementDoesNotExistException("Usuario no encontrado")

        // Verificar que el portal acepta solicitudes
        val plantilla = plantillaSolicitudRepository.findByPortalId(idPortal)
        if (plantilla != null && !plantilla.abierta) {
            throw BusinessException("Este portal no está aceptando solicitudes en este momento")
        }

        // Verificar que no sea ya miembro
        val esMiembro = membresiaRepository.existsByUsuarioIdAndPortalId(usuario.id!!, idPortal)
        if (esMiembro) throw BusinessException("Ya sos miembro del portal")

        // Verificar solicitud pendiente existente
        val tienePendiente = solicitudRepository.existsByUsuarioAndPortalAndEstado(usuario, portal, Estado.PENDIENTE)
        if (tienePendiente) throw BusinessException("Ya tenés una solicitud pendiente para este portal")

        // Verificar bloqueo
        val estaBloqueado = portalBloqueoRepository.existsByPortalAndUsuario(portal, usuario)
        if (estaBloqueado) throw BusinessException("No podés enviar solicitudes a este portal")

        val solicitud = Solicitud(
            usuario = usuario,
            portal = portal,
            nombreCompleto = request.nombreCompleto?.trim()?.takeIf { it.isNotBlank() },
            descripcion = request.descripcion,
        )

        solicitudRepository.save(solicitud)
    }

    // ── Aprobar solicitud ──────────────────────────────────────────────────

    @Transactional
    fun aprobarSolicitud(solicitudId: Long, emailAdmin: String) {
        val solicitud = validarSolicitud(solicitudId)
        val admin = usuarioRepository.findByEmail(emailAdmin)
            ?: throw ElementDoesNotExistException("El usuario no existe")

        val esAdmin = membresiaRepository.existsByUsuarioIdAndPortalIdAndRol(
            admin.id!!, solicitud.portal.id!!, RolMembresia.ADMIN
        )
        if (!esAdmin) throw NotAdminException("No tenés permisos para gestionar esta solicitud")

        if (solicitud.estado != Estado.PENDIENTE) {
            throw BusinessException("Solo se pueden aprobar solicitudes en estado PENDIENTE")
        }

        solicitud.estado = Estado.ACEPTADA

        val yaEsMiembro = membresiaRepository.existsByUsuarioIdAndPortalId(
            solicitud.usuario.id!!,
            solicitud.portal.id!!
        )

        if (!yaEsMiembro) {
            val nuevaMembresia = Membresia(
                usuario = solicitud.usuario,
                portal = solicitud.portal,
                rol = RolMembresia.MIEMBRO
            )
            membresiaRepository.save(nuevaMembresia)
        }

        solicitudRepository.save(solicitud)

        applicationEventPublisher.publishEvent(
          SolicitudAprobadaEvent(solicitud = solicitud, portal = solicitud.portal)
        )
        
        accionAdminService.registrar(
            portal              = solicitud.portal,
            admin               = admin,
            tipo                = TipoAccionAdmin.SOLICITUD_APROBADA,
            entidadId           = solicitudId.toString(),
            entidadDescripcion  = solicitud.usuario.nombre,
        )
    }

    // ── Rechazar solicitud ─────────────────────────────────────────────────

    /**
     * Rechaza una solicitud con motivo obligatorio.
     * El motivo queda guardado en la solicitud y es visible para el usuario solicitante.
     */
    @Transactional
    fun rechazarSolicitud(solicitudId: Long, emailAdmin: String, request: RechazarSolicitudRequest) {
        if (request.motivoRechazo.isBlank()) {
            throw BusinessException("El motivo del rechazo es obligatorio")
        }

        val solicitud = validarSolicitud(solicitudId)
        val admin = usuarioRepository.findByEmail(emailAdmin)
            ?: throw ElementDoesNotExistException("El usuario no existe")

        val esAdmin = membresiaRepository.existsByUsuarioIdAndPortalIdAndRol(
            admin.id!!, solicitud.portal.id!!, RolMembresia.ADMIN
        )
        if (!esAdmin) throw NotAdminException("No tenés permisos para gestionar esta solicitud")

        if (solicitud.estado != Estado.PENDIENTE) {
            throw BusinessException("Solo se pueden rechazar solicitudes en estado PENDIENTE")
        }

        solicitud.estado = Estado.RECHAZADA
        solicitud.motivoRechazo = request.motivoRechazo.trim()

        solicitudRepository.save(solicitud)

        applicationEventPublisher.publishEvent(
            SolicitudRechazadaEvent(
                solicitud = solicitud,
                portal = solicitud.portal,
                motivo = solicitud.motivoRechazo!!
            )
        )
        
        accionAdminService.registrar(
            portal              = solicitud.portal,
            admin               = admin,
            tipo                = TipoAccionAdmin.SOLICITUD_RECHAZADA,
            entidadId           = solicitudId.toString(),
            entidadDescripcion  = solicitud.usuario.nombre,
            motivo              = solicitud.motivoRechazo,
        )
    }

    // ── Consultas ──────────────────────────────────────────────────────────

    /**
     * Devuelve las solicitudes PENDIENTES de un portal (para el Panel de Administración).
     * Solo accesible por admins del portal.
     */
    fun getSolicitudesPendientes(idPortal: Long, email: String): List<SolicitudResponse> {
        portalRepository.findById(idPortal).getOrNull()
            ?: throw ElementDoesNotExistException("Portal $idPortal no encontrado")

        val usuario = usuarioRepository.findByEmail(email)
            ?: throw ElementDoesNotExistException("Usuario no encontrado")

        val membresia = membresiaRepository.findByUsuarioIdAndPortalId(usuario.id!!, idPortal)
            ?: throw NotAdminException("No sos miembro del portal")

        if (membresia.rol != RolMembresia.ADMIN) throw NotAdminException("No sos ADMIN del portal")

        return solicitudRepository.findAllByEstadoAndPortalId(Estado.PENDIENTE, idPortal)
            .map { it.toResponse() }
    }

    /**
     * Devuelve el historial completo de solicitudes de un portal (todas, sin filtrar por estado).
     * Solo accesible por admins. Útil para el Panel de Administración → historial.
     */
    fun getHistorialSolicitudes(idPortal: Long, email: String): List<SolicitudResponse> {
        portalRepository.findById(idPortal).getOrNull()
            ?: throw ElementDoesNotExistException("Portal $idPortal no encontrado")

        val usuario = usuarioRepository.findByEmail(email)
            ?: throw ElementDoesNotExistException("Usuario no encontrado")

        val membresia = membresiaRepository.findByUsuarioIdAndPortalId(usuario.id!!, idPortal)
            ?: throw NotAdminException("No sos miembro del portal")

        if (membresia.rol != RolMembresia.ADMIN) throw NotAdminException("No sos ADMIN del portal")

        return solicitudRepository.findByPortalId(idPortal)
            .sortedByDescending { it.fechaSolicitud }
            .map { it.toResponse() }
    }

    /**
     * Devuelve la solicitud más reciente de un usuario para un portal.
     * Usado por el front para mostrar la página de estado de la solicitud.
     * El usuario solo puede ver su propia solicitud.
     */
    fun getMiSolicitud(idPortal: Long, email: String): SolicitudResponse? {
        val usuario = usuarioRepository.findByEmail(email)
            ?: throw ElementDoesNotExistException("Usuario no encontrado")

        portalRepository.findById(idPortal).getOrNull()
            ?: throw ElementDoesNotExistException("Portal no encontrado")

        return solicitudRepository.findByUsuarioId(usuario.id!!)
            .filter { it.portal.id == idPortal }
            .maxByOrNull { it.fechaSolicitud }
            ?.toResponse()
    }

    /**
     * Devuelve la PlantillaSolicitud de un portal.
     * Accesible por cualquier usuario (incluso no miembro), ya que se muestra
     * ANTES de que el usuario complete el formulario de solicitud.
     *
     * Si el portal no tiene plantilla configurada, o tiene plantilla con requisitos vacíos,
     * devuelve el texto por defecto para que el usuario siempre vea algo orientativo.
     */
    fun getPlantilla(idPortal: Long): PlantillaSolicitudResponse {
        portalRepository.findById(idPortal).getOrNull()
            ?: throw ElementDoesNotExistException("Portal no encontrado")

        val plantilla = plantillaSolicitudRepository.findByPortalId(idPortal)
            ?: return PlantillaSolicitudResponse(
                requisitos = PlantillaSolicitud.REQUISITOS_DEFAULT,
                abierta = true
            )

        return PlantillaSolicitudResponse(
            requisitos = plantilla.requisitos?.takeIf { it.isNotBlank() }
                ?: PlantillaSolicitud.REQUISITOS_DEFAULT,
            abierta = plantilla.abierta,
        )
    }

    /**
     * Actualiza la PlantillaSolicitud del portal.
     * Solo admins pueden cambiar los requisitos o abrir/cerrar el portal a solicitudes.
     *
     * Patch parcial: los campos null en el request no se tocan.
     */
    @Transactional
    fun actualizarPlantilla(idPortal: Long, email: String, request: ActualizarPlantillaRequest): PlantillaSolicitudResponse {
        val portal = portalRepository.findById(idPortal).getOrNull()
            ?: throw ElementDoesNotExistException("Portal no encontrado")

        val usuario = usuarioRepository.findByEmail(email)
            ?: throw ElementDoesNotExistException("Usuario no encontrado")

        val membresia = membresiaRepository.findByUsuarioIdAndPortalId(usuario.id!!, idPortal)
            ?: throw NotAdminException("No sos miembro del portal")

        if (membresia.rol != RolMembresia.ADMIN)
            throw NotAdminException("Solo los administradores pueden actualizar la plantilla")

        val plantilla = plantillaSolicitudRepository.findByPortalId(idPortal)
            ?: throw ElementDoesNotExistException("Plantilla no encontrada para este portal")

        request.requisitos?.let { plantilla.requisitos = it.trim() }
        request.abierta?.let    { plantilla.abierta    = it }

        plantillaSolicitudRepository.save(plantilla)

        accionAdminService.registrar(
            portal             = portal,
            admin              = usuario,
            tipo               = TipoAccionAdmin.PLANTILLA_SOLICITUD_ACTUALIZADA,
            entidadDescripcion = if (plantilla.abierta) "Abierta" else "Cerrada",
        )

        return PlantillaSolicitudResponse(
            requisitos = plantilla.requisitos?.takeIf { it.isNotBlank() } ?: PlantillaSolicitud.REQUISITOS_DEFAULT,
            abierta    = plantilla.abierta,
        )
    }

    /**
     * Verifica si el usuario autenticado puede enviar una solicitud al portal.
     * No lanza excepciones — siempre retorna una respuesta estructurada.
     *
     * Motivos posibles:
     * - "YA_MIEMBRO"  → el usuario ya tiene membresía activa en este portal
     * - "BLOQUEADO"   → el usuario tiene un bloqueo activo en este portal
     * - "PENDIENTE"   → el usuario ya tiene una solicitud pendiente
     * - null          → puede solicitar sin restricciones
     */
    fun puedeSolicitar(idPortal: Long, email: String): PuedeSolicitarResponse {
        val portal = portalRepository.findById(idPortal).getOrNull()
            ?: return PuedeSolicitarResponse(puede = false, motivo = "PORTAL_NO_ENCONTRADO")

        val usuario = usuarioRepository.findByEmail(email)
            ?: return PuedeSolicitarResponse(puede = false, motivo = "USUARIO_NO_ENCONTRADO")

        if (membresiaRepository.existsByUsuarioIdAndPortalId(usuario.id!!, idPortal))
            return PuedeSolicitarResponse(puede = false, motivo = "YA_MIEMBRO")

        if (portalBloqueoRepository.existsByPortalAndUsuario(portal, usuario))
            return PuedeSolicitarResponse(puede = false, motivo = "BLOQUEADO")

        if (solicitudRepository.existsByUsuarioAndPortalAndEstado(usuario, portal, Estado.PENDIENTE))
            return PuedeSolicitarResponse(puede = false, motivo = "PENDIENTE")

        return PuedeSolicitarResponse(puede = true, motivo = null)
    }

    // ── Mapper privado ─────────────────────────────────────────────────────

    private fun Solicitud.toResponse() = SolicitudResponse(
        id = id!!,
        usuario = UsuarioResumenDTO(
            id = usuario.id!!,
            nombre = usuario.nombre,
            email = usuario.email,
        ),
        nombreCompleto = nombreCompleto,
        descripcion = descripcion,
        estado = estado.name,
        fechaSolicitud = fechaSolicitud.toString(),
        motivoRechazo = motivoRechazo,
    )
}