package com.unsam.scholarium.model

import com.unsam.scholarium.exception.BusinessException
import jakarta.persistence.*
import java.util.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp

@Entity
@Table(name = "carpetas")
class Carpeta(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @Column(nullable = false, length = 255)
    var nombre: String = "",

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portal_id")
    var portal: Portal? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carpeta_padre_id")
    var carpetaPadre: Carpeta? = null,

    var orden: Int = 0,

    @CreationTimestamp
    @Column(updatable = false)
    val createdAt: LocalDateTime? = null,

    @UpdateTimestamp
    val updatedAt: LocalDateTime? = null

) {
    init {
        validar()
    }

    private fun validar() {
        if (nombre.isBlank()) throw BusinessException("El nombre es obligatorio")
        if (nombre.length > 100) throw BusinessException("El nombre no puede tener más de 100 caracteres")
    }
}
