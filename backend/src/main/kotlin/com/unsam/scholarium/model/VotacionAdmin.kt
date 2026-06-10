package com.unsam.scholarium.model

import com.unsam.scholarium.exception.BusinessException
import jakarta.persistence.*
import java.time.LocalDateTime

enum class TipoVotacion {
    EXPULSION_MIEMBRO,
    BLOQUEO_MIEMBRO,
    DEGRADAR_ADMIN,
    CAMBIO_TIPO_ACCESO,
    CAMBIO_INFO_PORTAL,
    ELIMINAR_MATERIA,
    ELIMINAR_TABLERO,
    ARCHIVAR_PORTAL,
}

enum class EstadoVotacion {
    ABIERTA,
    APROBADA,
    RECHAZADA,
    EXPIRADA,
}

@Entity
@Table(name = "votaciones_admin")
class VotacionAdmin(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portal_id", nullable = false)
    val portal: Portal,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    val tipo: TipoVotacion,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proponente_id", nullable = false)
    val proponente: Usuario,

    @Column(nullable = false, columnDefinition = "TEXT")
    val motivo: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var estado: EstadoVotacion = EstadoVotacion.ABIERTA,

    @Column(name = "entidad_id")
    val entidadId: String? = null,

    @Column(columnDefinition = "TEXT")
    val metadatos: String? = null,

    @Column(name = "creada_en", nullable = false)
    val creadaEn: LocalDateTime = LocalDateTime.now(),

    @Column(name = "resuelta_en")
    var resueltaEn: LocalDateTime? = null,

    @Column(name = "expira_en", nullable = false)
    val expiraEn: LocalDateTime,
) {
    init {
        validar()
    }

    private fun validar() {
        if (motivo.isBlank()) {
            throw BusinessException("El motivo de la votación es obligatorio.")
        }
        if (motivo.length > 2000) {
            throw BusinessException("El motivo no puede tener más de 2000 caracteres.")
        }
        if (!expiraEn.isAfter(creadaEn)) {
            throw BusinessException("La fecha de expiración debe ser posterior a la fecha de creación.")
        }
    }

    fun resolver(nuevoEstado: EstadoVotacion) {
        require(nuevoEstado != EstadoVotacion.ABIERTA) {
            "No se puede resolver dejando el estado en ABIERTA."
        }
        check(estado == EstadoVotacion.ABIERTA) {
            "La votación ya está resuelta."
        }
        estado = nuevoEstado
        resueltaEn = LocalDateTime.now()
    }

    fun estaVencida(ahora: LocalDateTime = LocalDateTime.now()): Boolean =
        estado == EstadoVotacion.ABIERTA && !ahora.isBefore(expiraEn)
}