package com.unsam.scholarium.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(
    name = "votos_admin",
    uniqueConstraints = [
        UniqueConstraint(columnNames = ["votacion_id", "admin_id"])
    ]
)
class VotoAdmin(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "votacion_id", nullable = false)
    val votacion: VotacionAdmin,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    val admin: Usuario,

    @Column(nullable = false)
    val aprueba: Boolean,

    @Column(name = "votado_en", nullable = false)
    val votadoEn: LocalDateTime = LocalDateTime.now(),
)