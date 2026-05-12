package com.unsam.scholarium.model

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.util.*

enum class TipoMaterial {
    APUNTE,
    PARCIAL,
    FINAL,
    GUIA_EJERCICIOS,
    OTRO,
}


enum class EstadoMaterial {
    PENDIENTE,
    PUBLICADO,
    RECHAZADO
}

@Entity
class Material(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @Column(nullable = false)
    var nombre: String,

    @Column(nullable = false, length = 255)
    var descripcion: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var tipo: TipoMaterial,

    @Column(nullable = false)
    var url: String,

    @Column(nullable = false)
    var tamanio: Long,

    @Column(nullable = false)
    var tipoArchivo: String,

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    var estado: EstadoMaterial = EstadoMaterial.PENDIENTE,

    @Column(nullable = true)
    var motivoRechazo: String? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "materia_id", nullable = false)
    var materia: Materia,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploadedById", nullable = false)
    var usuario: Usuario,

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    var createdAt: Date = Date(),

    @UpdateTimestamp
    @Column(name = "updated_at")
    var updatedAt: Date? = null,
) {

}