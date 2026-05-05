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

    @Column
    var motivoRechazo: String? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "materia_id", nullable = false)
    var materia: Materia,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploadedById", nullable = false)
    var usuario: Usuario,

    @CreationTimestamp
    @Column(nullable = false)
    var reatedAt: Date = Date(),

    @UpdateTimestamp
    var updatedAt: Date? = null,
) {

}