package com.unsam.scholarium.service
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile

interface StorageService {
    fun subirArchivo(archivo: MultipartFile): ArchivoSubido
}

data class ArchivoSubido(
    val url: String,
    val tamanio: Long,
    val tipoArchivo: String
)

// IMPLEMENTACIÓN TEMPORAL - BORRAR CUANDO EXISTA LA REAL
@Service
class StorageServiceMock : StorageService {
    override fun subirArchivo(archivo: MultipartFile): ArchivoSubido {

        return ArchivoSubido(
            url = "https://fake-storage.com/archivos/${archivo.originalFilename}",
            tamanio = archivo.size,
            tipoArchivo = archivo.contentType ?: "application/octet-stream"
        )
    }
}