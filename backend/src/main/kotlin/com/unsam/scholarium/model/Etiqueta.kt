package com.unsam.scholarium.model

import com.unsam.scholarium.exception.BusinessException
import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import java.util.*

//TODO: Endpoints futuros (bonus)
//Con este modelo, después podemos agregar:
//GET /api/portales/{portalId}/etiquetas
//Listar todas las etiquetas disponibles en un portal.
//POST /api/portales/{portalId}/foros
//Crear un nuevo foro eligiendo entre las etiquetas existentes.
//GET /api/portales/{portalId}/foros?etiqueta=PHM
//Filtrar foros por etiqueta.


@Entity
@Table(
    name = "etiquetas",
    uniqueConstraints = [UniqueConstraint(columnNames = ["nombre", "portal_id"])]
)
class Etiqueta(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @Column(nullable = false, length = 30)
    var nombre: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portal_id", nullable = false)
    var portal: Portal,

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    val createdAt: Date? = null
) {
    init {
        validar()
    }

    private fun validar() {
        if (nombre.isBlank()) throw BusinessException("El nombre de la etiqueta es obligatorio")
        if (nombre.length > 30) throw BusinessException("La etiqueta no puede tener más de 30 caracteres")
    }
}