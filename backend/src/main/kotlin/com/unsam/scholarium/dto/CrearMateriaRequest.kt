package com.unsam.scholarium.dto

data class CrearMateriaRequest(
    val nombre: String,
    val etiqueta: String
    //TODO: No olvidemos que acá también debería ir UNA DESCRICPIÓN Y DEMÁS COSAS.
)

//TODO: Validaciones del front:
//
//Campo etiqueta limitado a 30 caracteres
//Debe ser alfanumérico (sin espacios, sin caracteres raros)
//Sugerencia en mayúsculas

