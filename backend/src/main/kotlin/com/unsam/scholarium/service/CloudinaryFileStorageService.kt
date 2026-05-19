package com.unsam.scholarium.service

import com.cloudinary.Cloudinary
import com.cloudinary.utils.ObjectUtils
import com.unsam.scholarium.dto.ArchivoSubidoResponse
import com.unsam.scholarium.exception.BusinessException
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile

interface FileStorageService {

    fun upload(file: MultipartFile): ArchivoSubidoResponse

    fun delete(publicId: String): Boolean
}

@Service
class CloudinaryFileStorageService(
    private val cloudinary: Cloudinary
) : FileStorageService {
    override fun upload(file: MultipartFile): ArchivoSubidoResponse {
        validar(file)

        return try {
            val result = cloudinary.uploader().upload(
                file.bytes,
                ObjectUtils.emptyMap()
            )

            ArchivoSubidoResponse(
                url = result["secure_url"].toString(),
                publicId = result["public_id"].toString(),
                tamanio = (result["bytes"] as Number).toLong(),
                tipoArchivo = file.contentType ?: "application/octet-stream"
            )

        } catch (e: Exception) {
            throw BusinessException(
                "Error al subir archivo: ${e.message}"
            )
        }
    }

    override fun delete(publicId: String): Boolean {
        return try {
            val result = cloudinary.uploader().destroy(
                publicId,
                ObjectUtils.emptyMap()
            )

            result["result"] == "ok"

        } catch (e: Exception) {
            throw BusinessException("Error al eliminar archivo: ${e.message}")
        }
    }
}

private fun validar(file: MultipartFile) {
    val allowedTypes = setOf(
        "application/pdf",
        "application/zip",
        "application/x-zip-compressed",

        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp"
    )

    val allowedExtensions = setOf(
        "pdf",
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
        "zip"
    )

    val extension = file.originalFilename
        ?.substringAfterLast(".", "")
        ?.lowercase()

    if (file.isEmpty) throw BusinessException("El archivo está vacío")
    if (file.contentType !in allowedTypes) throw BusinessException("Tipo de archivo no permitido. Solo se aceptan PDF, imágenes (JPG, PNG, GIF, WEBP) y archivos ZIP")
    if (extension.isNullOrBlank() || extension !in allowedExtensions) throw BusinessException("Extensión de archivo no permitida. Solo se aceptan PDF, imágenes y archivos ZIP.")
}
