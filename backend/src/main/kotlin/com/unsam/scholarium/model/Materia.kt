package com.unsam.scholarium.model

import com.unsam.scholarium.exception.BusinessException
import jakarta.persistence.*
import java.util.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp

@Entity
class Materia(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @Column(nullable = false, length = 150)
    var nombre: String,

    //TODO: LA DESC DEBERIA TENER ALGUN LIMITE, ESO LO VEMOS DSP

    @Column(nullable = true, columnDefinition = "TEXT")
    var descripcion: String? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carpeta_id", nullable = false)
    var carpeta: Carpeta,

    @Column(nullable = false)
    var orden: Int = 0,

    @CreationTimestamp
    @Column(updatable = false)
    val createdAt: Date? = null,

    @UpdateTimestamp
    val updatedAt: Date? = null
) {
    init {
        validar()
    }

    private fun validar() {
        if (nombre.isBlank()) throw BusinessException("El nombre de la materia es obligatorio")
        if (nombre.length > 150) throw BusinessException("El nombre no puede tener más de 150 caracteres")
    }
}