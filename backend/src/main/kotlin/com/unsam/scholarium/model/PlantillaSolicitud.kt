package com.unsam.scholarium.model

import jakarta.persistence.*

/**
 * Configuración de solicitudes de membresía para un Portal.
 *
 * Se crea automáticamente junto con el Portal (en la misma transacción de createPortal).
 * Estado inicial: abierta = true, requisitos = texto de bienvenida por defecto.
 *
 * Los admins pueden editar los requisitos y abrir/cerrar el ingreso desde el Panel de Administración.
 */
@Entity
@Table(name = "plantillas_solicitud")
class PlantillaSolicitud(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portal_id", nullable = false, unique = true)
    val portal: Portal,

    /**
     * Texto libre que los admins escriben para indicar qué deben incluir
     * los usuarios en su descripción al solicitar el acceso.
     * Se muestra al usuario antes de que complete el formulario de solicitud.
     * Null o vacío = sin requisitos específicos.
     */
    @Column(columnDefinition = "TEXT")
    var requisitos: String? = REQUISITOS_DEFAULT,

    /**
     * Controla si el Portal acepta nuevas solicitudes en este momento.
     * Los admins pueden cerrarlo temporalmente desde el Panel de Administración.
     */
    @Column(nullable = false)
    var abierta: Boolean = true,
) {
    companion object {
        const val REQUISITOS_DEFAULT =
            "Los administradores de este portal todavía están preparando todo. " +
                    "Mientras tanto, podés solicitar unirte: te recomendamos incluir tu nombre completo " +
                    "y un motivo claro por el cual querés participar de esta comunidad."
    }
}