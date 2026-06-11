package com.unsam.scholarium.model

import jakarta.persistence.*
import java.time.LocalDateTime
import java.util.*

@Entity
@Table(name = "notificaciones")
class Notificacion(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    val usuario: Usuario,

    @Column(nullable = false)
    val tipo: String, // "material", "foro", "solicitud", "sistema"

    @Column(nullable = false)
    val titulo: String,

    @Column(nullable = false, length = 500)
    val descripcion: String,

    @Column(name = "portal_nombre")
    val portalNombre: String? = null,

    @Column(name = "leida", nullable = false)
    var leida: Boolean = false,

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    val fechaCreacion: LocalDateTime = LocalDateTime.now(),

    @Column(name = "entidad_id")
    val entidadId: UUID? = null, // ID de la entidad relacionada (material, post, solicitud, etc.)
)