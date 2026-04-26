package com.unsam.scholarium.model

import jakarta.persistence.*
import java.util.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp

@Entity
class Materia(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @Column(nullable = false)
    var nombre: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carpeta_id", nullable = false)
    var carpeta: Carpeta,

    @OneToOne(fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    @JoinColumn(name = "foro_id", referencedColumnName = "id")
    var foro: Foro? = null,

    @Column(nullable = false)
    var orden: Int = 0,

    @CreationTimestamp
    @Column(updatable = false)
    val createdAt: Date? = null,

    @UpdateTimestamp
    val updatedAt: Date? = null
)