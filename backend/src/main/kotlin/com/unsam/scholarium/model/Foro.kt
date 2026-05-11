package com.unsam.scholarium.model

import com.unsam.scholarium.exception.BusinessException
import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.util.*

@Entity
@Table(name = "foros")
class Foro(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @Column(nullable = false, length = 150)
    var nombre: String,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "etiqueta_id", nullable = false)
    var etiqueta: Etiqueta,  

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portal_id", nullable = false)
    var portal: Portal,

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    val createdAt: Date? = null,

    @UpdateTimestamp
    val updatedAt: Date? = null
) {
    init {
        validar()
    }

    private fun validar() {
        if (nombre.isBlank()) throw BusinessException("El nombre del foro es obligatorio")
        if (nombre.length > 150) throw BusinessException("El nombre no puede tener más de 150 caracteres")
    }
}