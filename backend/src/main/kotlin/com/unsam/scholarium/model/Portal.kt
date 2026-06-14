package com.unsam.scholarium.model

import com.unsam.scholarium.exception.BusinessException
import jakarta.persistence.*
import java.text.Normalizer
import java.time.LocalDateTime

enum class TipoAcceso {
    ABIERTO,
    CERRADO
}

@Entity
@Table(name = "portales")
class Portal(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(nullable = false)
    var universidad: String,

    @Column(nullable = false)
    var carrera: String,

    // Columnas de normalización: se calculan automáticamente al construir/modificar
    // y se usan exclusivamente para la validación de unicidad.
    // El usuario nunca las ve; no se exponen en ningún DTO.
    @Column(name = "universidad_normalizada", nullable = false)
    var universidadNormalizada: String = "",

    @Column(name = "carrera_normalizada", nullable = false)
    var carreraNormalizada: String = "",

    @Column(nullable = true, length = 200)
    var unidadAcademica: String? = null,

    @Column(length = 300)
    var descripcion: String? = null,

    @Column
    var logoUrl: String? = null,

    @Column(length = 100)
    var iconoPortal: String? = null,

    @Column(length = 7)
    var colorPortal: String? = null,

    /**
     * ABIERTO  → usuarios no-miembros pueden ver materias, foro y posts (solo lectura).
     * CERRADO  → comportamiento actual: solo ven la home y la solicitud de adhesión.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_acceso", nullable = false)
    var tipoAcceso: TipoAcceso = TipoAcceso.CERRADO,

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
    var activo: Boolean = true,
) {
    init {
        // Calcular normalizadas al momento de construcción
        universidadNormalizada = normalizarParaUnicidad(universidad)
        carreraNormalizada = normalizarParaUnicidad(carrera)
        validar()
    }

    private fun validar() {
        if (universidad.isBlank()) throw BusinessException("La universidad es obligatoria")
        if (carrera.isBlank()) throw BusinessException("La carrera es obligatoria")
        if ((descripcion?.length ?: 0) > 300) throw BusinessException("La descripción no puede tener más de 300 caracteres")
        if ((unidadAcademica?.length ?: 0) > 200) throw BusinessException("La unidad académica no puede tener más de 200 caracteres")
        colorPortal?.let {
            if (!it.matches(Regex("^#[0-9A-Fa-f]{6}$")))
                throw BusinessException("El color del portal debe ser un valor hexadecimal válido (ej: #3B82F6)")
        }
    }

    fun addMembresia(membresia: Membresia) {
        membresias.add(membresia)
        membresia.portal = this
    }

    fun removeMembresia(membresia: Membresia) {
        membresias.remove(membresia)
        membresia.portal = null
    }

    companion object {
        /**
         * Normaliza un string para comparación de unicidad:
         * trim + colapso de espacios múltiples + strip de diacríticos + lowercase.
         * Se aplica a universidad y carrera antes de persistir y antes de validar duplicados.
         */
        fun normalizarParaUnicidad(valor: String): String {
            val trimmed = valor.trim().replace(Regex("\\s+"), " ")
            val sinDiacriticos = Normalizer.normalize(trimmed, Normalizer.Form.NFD)
                .replace(Regex("\\p{InCombiningDiacriticalMarks}+"), "")
            return sinDiacriticos.lowercase()
        }
    }
}