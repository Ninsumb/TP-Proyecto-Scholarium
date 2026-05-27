package com.unsam.scholarium.model

import com.unsam.scholarium.exception.BusinessException
import jakarta.persistence.*
import java.time.LocalDateTime

enum class Estado {
    PENDIENTE,
    ACEPTADA,
    RECHAZADA
}

/**
 * Solicitud de membresía de un Usuario a un Portal.
 *
 * Cambios respecto a la versión anterior:
 * - Se eliminó `titulo`: una solicitud de membresía no es un post, no necesita título.
 * - Se agregó `nombreCompleto`: campo opcional que el usuario puede completar con su nombre real.
 *   Útil para portales que quieren saber quién se está uniendo más allá del nombre de usuario.
 * - Se agregó `motivoRechazo`: los admins lo completan al rechazar. Queda visible para el
 *   usuario solicitante y almacenado en el historial del Panel de Administración.
 *
 * Las solicitudes NUNCA se eliminan (no hay hard delete ni soft delete).
 * Se guardan permanentemente como historial en el Panel de Administración.
 *
 * Una solicitud PENDIENTE no puede ser editada ni cancelada por el usuario una vez enviada.
 */
@Entity
@Table(name = "solicitudes")
class Solicitud(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    val usuario: Usuario,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portal_id", nullable = false)
    val portal: Portal,

    /**
     * Nombre completo real del solicitante (opcional).
     * Los admins pueden pedirlo en los requisitos de la PlantillaSolicitud.
     * El nombre de usuario de la plataforma puede ser cualquier cosa; este campo
     * permite identificar a la persona real si el portal lo requiere.
     */
    @Column(name = "nombre_completo", length = 200)
    val nombreCompleto: String? = null,

    /**
     * Texto libre donde el usuario responde a los requisitos del portal.
     * El usuario ve las instrucciones de PlantillaSolicitud.requisitos antes de completar este campo.
     */
    @Column(columnDefinition = "TEXT", length = 1000)
    val descripcion: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var estado: Estado = Estado.PENDIENTE,

    @Column(name = "fecha_solicitud", nullable = false)
    val fechaSolicitud: LocalDateTime = LocalDateTime.now(),

    /**
     * Motivo del rechazo, completado por el admin al rechazar.
     * Visible para el usuario solicitante y en el historial del Panel de Administración.
     */
    @Column(name = "motivo_rechazo", columnDefinition = "TEXT")
    var motivoRechazo: String? = null,
) {
    init {
        validar()
    }

    private fun validar() {
        if (descripcion.isBlank()) throw BusinessException("La descripción es obligatoria")
        if (descripcion.length > 1000) throw BusinessException("La descripción no puede tener más de 1000 caracteres")
        if ((nombreCompleto?.length ?: 0) > 200) throw BusinessException("El nombre completo no puede tener más de 200 caracteres")
    }
}