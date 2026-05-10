package com.unsam.scholarium.dto
import com.unsam.scholarium.model.Material

enum class TipoMaterial {
    APUNTE, PARCIAL, FINAL, GUIA_EJERCICIOS, OTRO
}



data class MultipartFile(
    val archivo : File,
    val nombre : String,
    val descripcion : String?,
    val tipo: TipoMaterial,
   
) 

