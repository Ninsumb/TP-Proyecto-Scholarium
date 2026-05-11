package com.unsam.scholarium.model

import jakarta.persistence.*
import java.time.LocalDateTime

enum class RolMembresia {
    MIEMBRO,
    ADMIN
}

@Entity
@Table(
    name = "membresias",
    uniqueConstraints = [
        UniqueConstraint(columnNames = ["usuario_id", "portal_id"])
    ]
)
class Membresia(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    val usuario: Usuario,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portal_id", nullable = false)
    var portal: Portal? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val rol: RolMembresia = RolMembresia.MIEMBRO,

    @Column(name = "fecha_registro", nullable = false)
    val fechaRegistro: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = false)
    val activo: Boolean = true,
) {
    //fun getRol() = rol
}