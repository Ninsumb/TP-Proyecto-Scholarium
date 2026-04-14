package com.unsam.scholarium.dto

data class CreatePortalRequest(
    var universidad: String,
    var carrera: String,
    var descripcion: String?,
)