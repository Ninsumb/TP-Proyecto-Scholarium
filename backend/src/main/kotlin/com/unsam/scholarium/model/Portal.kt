package com.unsam.scholarium.model

import com.unsam.scholarium.exception.BusinessException
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(
    name = "portales",
    uniqueConstraints = [
        UniqueConstraint(columnNames = ["universidad", "carrera"])
    ]
)
class Portal(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null, //TODO: ¿No estaría mejor que fuese un UUID en lugar de un ID?

    @Column(nullable = false)
    var universidad: String,

    @Column(nullable = false)
    var carrera: String,

    @Column(length = 1000)
    var descripcion: String? = null,

    @Column
    var logoUrl: String? = null,

    @OneToMany(mappedBy = "portal")
    val carpetas: List<Carpeta> = mutableListOf(),

    @OneToMany(
        mappedBy = "portal",
        cascade = [CascadeType.ALL],
        orphanRemoval = true
    )
    val membresias: MutableList<Membresia> = mutableListOf(),

    @Column(name = "fecha_registro", nullable = false)
    val fechaRegistro: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = false)
    val activo: Boolean = true,
) {
    init {
        validar()
    }

    private fun validar() {
        if (universidad.isBlank()) throw BusinessException("La universidad es obligatoria")
        if (carrera.isBlank()) throw BusinessException("La carrera es obligatoria")
        if ((descripcion?.length ?: 0) > 1000) throw BusinessException("La descripción no puede tener más de 1000 caracteres")
    }

    fun addMembresia(membresia: Membresia) {
        membresias.add(membresia)
        membresia.portal = this
    }

    fun removeMembresia(membresia: Membresia) {
        membresias.remove(membresia)
        membresia.portal = null
    }
}