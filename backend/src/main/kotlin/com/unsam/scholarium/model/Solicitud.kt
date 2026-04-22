package com.unsam.scholarium.model


import jakarta.persistence.*
import java.time.LocalDateTime

enum class Estado{
    PENDIENTE,
    ACEPTADA,
    RECHAZADA
}

@Entity
@Table(name = "solicitudes")
class Solicitud(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    val usuario: Usuario,

    @ManyToOne(fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    val portal: Portal,

    @Column(nullable = false, length = 255)
    val titulo: String,

    @Enumerated(EnumType.STRING)
    var estado: Estado,

    @Column(columnDefinition = "TEXT")
    val descripcion: String,

    @Column(nullable = false)
    val fechaSolicitud: LocalDateTime = LocalDateTime.now()
){

}