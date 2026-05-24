package com.unsam.scholarium.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "usuarios")
class Usuario(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(nullable = false, length = 100)
    var nombre: String,

    @Column(unique = true, nullable = false, length = 255)
    val email: String,

    @Column(nullable = true)  // ← Ahora puede ser NULL si es login de Google
    var password: String? = null,

    @Column(unique = true, nullable = true)  // ← NUEVO: para identificar usuarios de Google
    val googleId: String? = null,

    @OneToMany(mappedBy = "usuario", cascade = [CascadeType.ALL], orphanRemoval = true)
    val membresias: MutableList<Membresia> = mutableListOf(),

    @Column(name = "fecha_registro", nullable = false)
    val fechaRegistro: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = false)
    val activo: Boolean = true,

    @Column(nullable=true, length = 300)
    var bio: String? = null,

    @Column(nullable = true)
    var fotoPerfil: String? = null,
) {
    fun addMembresia(membresia: Membresia) {
        membresias.add(membresia)
    }

    fun removeMembresia(membresia: Membresia) {
        membresias.remove(membresia)
    }
}