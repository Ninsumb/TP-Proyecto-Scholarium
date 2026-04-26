package com.unsam.scholarium.model

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
    val updatedAt: Date? = null
) {

}
