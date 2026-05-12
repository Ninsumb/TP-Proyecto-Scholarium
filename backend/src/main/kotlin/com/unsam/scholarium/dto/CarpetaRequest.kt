package com.unsam.scholarium.dto

import java.util.UUID

data class CarpetaRequest(
    val nombre: String,
    val carpetaPadreId: UUID? = null
)