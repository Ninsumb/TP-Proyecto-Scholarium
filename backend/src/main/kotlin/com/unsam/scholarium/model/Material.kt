package com.unsam.scholarium.model

import jakarta.persistence.*
import java.time.LocalDateTime
import java.util.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import com.unsam.scholarium.model.Materia
import com.unsam.scholarium.dto.TipoMaterial




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
    var nombre: String = "",

    @Column(nullable = false, length = 255)
    var descripcion: String = "",

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var tipo: TipoMaterial,

    @Enumerated(EnumType.STRING)
    var estado: EstadoMaterial = EstadoMaterial.PENDIENTE,

    @Column(nullable = false)
    var url: String = "",

    @Column(nullable = false)
    var tamanio: Long = 0,

    @Column(nullable = false)
    var tipoArchivo: String = "",

    @Column(nullable = false)
    var motivoRechazo: String? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "materia_id", nullable = false)
    var materia: Materia? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploadedById", nullable = false)
    var usuario: Usuario? = null,

    @CreationTimestamp
    @Column(nullable = false)
    val createdAt: LocalDateTime? = null,

    @UpdateTimestamp
    val updatedAt: LocalDateTime? = null,

) {

}