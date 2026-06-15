// src/main/kotlin/com/unsam/scholarium/model/AccionAdmin.kt
package com.unsam.scholarium.model

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import java.time.Instant

enum class TipoAccionAdmin {
    // Solicitudes
    SOLICITUD_APROBADA,
    SOLICITUD_RECHAZADA,

    // Material
    MATERIAL_APROBADO,
    MATERIAL_RECHAZADO,
    MATERIAL_ELIMINADO,

    // Miembros
    MIEMBRO_ASCENDIDO,
    MIEMBRO_DEGRADADO,
    MIEMBRO_EXPULSADO,
    MIEMBRO_BLOQUEADO,
    BLOQUEO_LEVANTADO,

    // Portal — configuración
    PORTAL_ACTUALIZADO,
    PORTAL_TIPO_ACCESO_CAMBIADO,
    PORTAL_UNIVERSIDAD_CAMBIADA,
    PORTAL_CARRERA_CAMBIADA,
    PORTAL_ARCHIVADO,
    PLANTILLA_SOLICITUD_ACTUALIZADA,

    // Estructura
    CARPETA_CREADA,
    CARPETA_RENOMBRADA,
    MATERIA_CREADA,
    MATERIA_ACTUALIZADA,
    MATERIA_MOVIDA,
    MATERIA_ELIMINADA,
    TABLERO_CREADO,
    TABLERO_ELIMINADO,

    // Foro
    POST_ELIMINADO,

    // Votaciones
    VOTACION_CREADA,
    VOTACION_APROBADA,
    VOTACION_RECHAZADA,

    // Home
    HOME_ACTUALIZADA,
}

@Entity
@Table(
    name = "accion_admin",
    indexes = [
        Index(name = "idx_accion_portal_id",    columnList = "portal_id"),
        Index(name = "idx_accion_admin_id",     columnList = "admin_id"),
        Index(name = "idx_accion_created_at",   columnList = "created_at"),
    ]
)
class AccionAdmin(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    /** Portal al que pertenece esta acción. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portal_id", nullable = false)
    val portal: Portal,

    /** Admin que ejecutó la acción. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    val admin: Usuario,

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 60)
    val tipo: TipoAccionAdmin,

    /**
     * ID de la entidad afectada (UUID o Long serializado como String).
     * Null para acciones que afectan al portal en sí y no a una sub-entidad.
     */
    @Column(name = "entidad_id", length = 100)
    val entidadId: String? = null,

    /**
     * Nombre/descripción legible de la entidad afectada
     * (p.ej. nombre del miembro, nombre del material, etc.).
     * Se persiste para que el historial sea legible aunque la entidad se elimine.
     */
    @Column(name = "entidad_descripcion", length = 255)
    val entidadDescripcion: String? = null,

    /** Motivo o detalle adicional libre (ej. motivo de rechazo, motivo de votación). */
    @Column(name = "motivo", columnDefinition = "TEXT")
    val motivo: String? = null,

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant? = null,
)