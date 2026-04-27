package com.unsam.scholarium.model


import com.unsam.scholarium.exception.BusinessException
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

    @ManyToOne(fetch = FetchType.LAZY)
    val usuario: Usuario,

    @ManyToOne(fetch = FetchType.LAZY)
    val portal: Portal,

    @Column(nullable = false, length = 255)
    val titulo: String,

    @Enumerated(EnumType.STRING)
    var estado: Estado,

    @Column(columnDefinition = "TEXT", length = 1000)
    val descripcion: String,

    @Column(nullable = false)
    val fechaSolicitud: LocalDateTime = LocalDateTime.now()
){
    fun validar() {
        if (titulo.isBlank()) throw BusinessException("El título es obligatorio")
        if (descripcion.length > 1000) throw BusinessException("La descripción no puede tener más de 1000 caracteres")
    }
}