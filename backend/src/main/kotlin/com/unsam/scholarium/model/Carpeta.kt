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

    @Column(nullable = false, length = 100)
    var nombre: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portal_id")
    var portal: Portal,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carpeta_padre_id")
    var carpetaPadre: Carpeta? = null,

    var orden: Int = 0,

    @CreationTimestamp
    @Column(updatable = false)
    val createdAt: Date? = null,

    @UpdateTimestamp
    var updatedAt: Date? = null
) {
    fun validacion() {
        if (nombre.isBlank()) throw BusinessException("El nombre es obligatorio")
        if (nombre.length > 100) throw BusinessException("El nombre no puede tener más de 100 caracteres")
    }
}
