package com.unsam.scholarium.model

import jakarta.persistence.*
import java.time.LocalDateTime

/**
 * Registro de bloqueo de un usuario en un Portal.
 *
 * Un usuario bloqueado:
 * - No tiene membresía activa en el Portal.
 * - No puede enviar nuevas solicitudes de ingreso al Portal.
 * - Puede ser desbloqueado por los admins en cualquier momento (hard delete de este registro).
 *
 * El bloqueo es independiente de la Membresia: existe aunque el usuario no tenga membresía,
 * y persiste si la membresía se elimina al expulsar.
 *
 * Diferencia con "Expulsar":
 * - Expulsar: pierde la membresía, PUEDE volver a solicitar el ingreso.
 * - Bloquear: pierde la membresía, NO PUEDE volver a solicitar el ingreso (hasta que se desbloquee).
 */
@Entity
@Table(
    name = "portal_bloqueos",
    uniqueConstraints = [
        UniqueConstraint(columnNames = ["portal_id", "usuario_id"])
    ]
)
class PortalBloqueo(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portal_id", nullable = false)
    val portal: Portal,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    val usuario: Usuario,

    @Column(name = "fecha_bloqueo", nullable = false)
    val fechaBloqueo: LocalDateTime = LocalDateTime.now(),

    /** Motivo del bloqueo, visible en el Panel de Administración. */
    @Column(columnDefinition = "TEXT")
    val motivo: String? = null,
)