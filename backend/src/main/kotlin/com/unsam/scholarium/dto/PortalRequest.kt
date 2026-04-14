package com.unsam.scholarium.dto

data class PortalRequest(
    var universidad: String,
    var carrera: String,
    var descripcion: String?,
)