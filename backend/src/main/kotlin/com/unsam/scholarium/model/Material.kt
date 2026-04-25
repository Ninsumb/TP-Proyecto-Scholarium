package com.unsam.scholarium.model

import jakarta.persistence.*
import java.util.*


enum class tipoMaterial {
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
    var tipo: tipoMaterial,

    @column(nullable = false)
    var url: String,

    @column(nullable = false)
    tamanio: Long,

    @column(nullable = false)
    tipoArchivo: String,

    @column(nullable = false)
    var motivoRechazo: String? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "materia_id", nullable = false)
    var materia: Materia,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploadedById", nullable = false)
    var usuario: Usuario,

    @CreationTimestamp
    @Column(nullable = false)
    createdAt: Date = Date(),

    @UpdateTimestamp
    val updatedAt: Date? = null,

) {

}