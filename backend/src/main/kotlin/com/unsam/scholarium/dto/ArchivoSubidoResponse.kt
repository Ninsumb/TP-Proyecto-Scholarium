package com.unsam.scholarium.dto

data class ArchivoSubidoResponse(
    val url: String,
    val publicId: String,
    val tamanio: Long,
    val tipoArchivo: String
)