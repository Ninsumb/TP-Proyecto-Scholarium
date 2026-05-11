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
    val nombre: String = "",

    @Column(unique = true, nullable = false, length = 255)
    val email: String = "",

    @Column(nullable = false)
    var password: String = "", // Debe estar hasheada (BCrypt) dsp

    @OneToMany(mappedBy = "usuario", cascade = [CascadeType.ALL], orphanRemoval = true)
    val membresias: MutableList<Membresia> = mutableListOf(),

    @Column(name = "fecha_registro", nullable = false)
    val fechaRegistro: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = false)
    val activo: Boolean = true,
) {
    fun addMembresia(membresia: Membresia) {
        membresias.add(membresia)
    }

    fun removeMembresia(membresia: Membresia) {
        membresias.remove(membresia)
    }
}