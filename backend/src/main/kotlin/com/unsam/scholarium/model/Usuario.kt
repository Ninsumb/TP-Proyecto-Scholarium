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
    var email: String,  // era val

    @Column(nullable = true)
    var password: String? = null,

    @Column(unique = true, nullable = true)
    val googleId: String? = null,

    @OneToMany(mappedBy = "usuario", cascade = [CascadeType.ALL], orphanRemoval = true)
    val membresias: MutableList<Membresia> = mutableListOf(),

    @Column(name = "fecha_registro", nullable = false)
    val fechaRegistro: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = false)
    var activo: Boolean = true,

    @Column(nullable = true, name = "foto_perfil", length = 512)
    var fotoPerfil: String? = null
) {
    fun addMembresia(membresia: Membresia) {
        membresias.add(membresia)
    }

    fun removeMembresia(membresia: Membresia) {
        membresias.remove(membresia)
    }
}