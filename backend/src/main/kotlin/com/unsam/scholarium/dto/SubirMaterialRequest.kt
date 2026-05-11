package com.unsam.scholarium.dto
import com.unsam.scholarium.model.Material
import org.springframework.web.multipart.MultipartFile

enum class TipoMaterial {
    APUNTE, PARCIAL, FINAL, GUIA_EJERCICIOS, OTRO
}



data class SubirMaterialRequest(
    val archivo : MultipartFile,
    val nombre : String,
    val descripcion : String?,
    val tipo: TipoMaterial,
   
) 

