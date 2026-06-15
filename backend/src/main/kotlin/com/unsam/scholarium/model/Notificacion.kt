package com.unsam.scholarium.model

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import java.time.LocalDateTime
import java.util.*

enum class TipoNotificacion {
    COMENTARIO_POST,
    SOLICITUD_APROBADA,
    SOLICITUD_RECHAZADA,
    MEMBRESIA_APROBADA,
    MEMBRESIA_RECHAZADA,
    EXPULSION,
    VOTACION_ABIERTA,
    VOTACION_APROBADA,
    POST_OCULTADO
}

@Entity
@Table(name = "notificaciones")
class Notificacion(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    val usuario: Usuario,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val tipo: TipoNotificacion,

    @Column(nullable = false)
    val titulo: String,

    @Column(nullable = false, length = 500)
    val descripcion: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portal_id")
    val portal: Portal? = null, //Solo tenemos archivamiento del portal, pero si en un momento cambia, hay que manejar el nulleable

    @Column(name = "motivo", length = 500)
    val motivo: String? = null,

    @Column(name = "leida", nullable = false)
    var leida: Boolean = false,

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    @CreationTimestamp
    val fechaCreacion: LocalDateTime = LocalDateTime.now(),

    @Column(name = "entidad_id")
    val entidadId: Long? = null, // ID de la entidad relacionada (material, post, solicitud, etc.)

    @Column(name = "entidad_tipo")
    val entidadTipo: String? = null, // "POST", "SOLICITUD", "MEMBRESIA", "VOTACION"
)