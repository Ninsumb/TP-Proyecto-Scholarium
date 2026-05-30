package com.unsam.scholarium.dto

import java.util.UUID

data class PortalEstructuraDTO(
    val portalId: Long,
    val carpetas: List<CarpetaArbolDTO>
)

data class CarpetaArbolDTO(
    val id: UUID,
    val nombre: String,
    val carpetaPadreId: UUID?,
    val orden: Int,
    val subcarpetas: MutableList<CarpetaArbolDTO> = mutableListOf(),
    val materias: List<MateriaArbolDTO> = emptyList()
)

data class MateriaArbolDTO(
    val id: UUID,
    val nombre: String,
    val foroId: UUID?,
    val orden: Int
)