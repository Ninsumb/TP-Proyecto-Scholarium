package com.unsam.scholarium.service

import com.cloudinary.Cloudinary
import com.cloudinary.utils.ObjectUtils
import com.unsam.scholarium.dto.ArchivoSubidoResponse
import com.unsam.scholarium.exception.BusinessException
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import com.cloudinary.Transformation

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
            val extension = file.originalFilename
                ?.substringAfterLast(".")
                ?.lowercase()

            val resourceType =
                when {
                    file.contentType?.startsWith("image/") == true -> "image"
                    extension == "pdf" -> "image"
                    else -> "raw"
                }

            val nombreArchivo =
                file.originalFilename
                    ?.substringBeforeLast(".")
                    ?.replace(" ", "-")

            val result = cloudinary.uploader().upload(
                file.bytes,
                ObjectUtils.asMap(
                    "resource_type", resourceType,
                    "type", "upload",
                    "access_mode", "public",
                    "access_control", listOf(
                        mapOf("access_type" to "anonymous")
                    ),
                    "public_id", "$nombreArchivo.$extension",
                    "use_filename", true,
                    "overwrite", false
                )
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

    fun uploadFotoPerfil(file: MultipartFile, usuarioId: Long): String {
        validar(file)

        return try {
            val result = cloudinary.uploader().upload(
                file.bytes,
                ObjectUtils.asMap(
                    "folder",        "scholarium/fotos-perfil",
                    "public_id",     "usuario-$usuarioId",
                    "overwrite",     true,
                    "resource_type", "image"
                )
            )
            result["secure_url"].toString()
        } catch (e: Exception) {
            throw BusinessException("Error al subir foto de perfil: ${e.message}")
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

    fun uploadImagenPortal(file: MultipartFile, portalId: Long): String {
        validarImagen(file)

        return try {
            val result = cloudinary.uploader().upload(
                file.bytes,
                ObjectUtils.asMap(
                    "folder",        "scholarium/imagenes-portal",
                    "public_id",     "portal-$portalId",
                    "overwrite",     true,
                    "resource_type", "image"
                )
            )
            result["secure_url"].toString()
        } catch (e: Exception) {
            throw BusinessException("Error al subir imagen del portal: ${e.message}")
        }
    }
}



private fun validar(file: MultipartFile) {
    val allowedTypes = setOf(
        "application/pdf",
        "application/docx",

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
        "docx"
    )

    val extension = file.originalFilename
        ?.substringAfterLast(".", "")
        ?.lowercase()

    if (file.isEmpty) throw BusinessException("El archivo está vacío")
    if (file.contentType !in allowedTypes) throw BusinessException("Tipo de archivo no permitido. Solo se aceptan PDF, imágenes (JPG, PNG, GIF, WEBP) y archivos ZIP")
    if (extension.isNullOrBlank() || extension !in allowedExtensions) throw BusinessException("Extensión de archivo no permitida. Solo se aceptan PDF, imágenes y archivos ZIP.")
}

private fun validarImagen(file: MultipartFile) {
    val allowedTypes = setOf("image/jpeg", "image/png", "image/webp")
    val allowedExtensions = setOf("jpg", "jpeg", "png", "webp")

    val extension = file.originalFilename
        ?.substringAfterLast(".", "")
        ?.lowercase()

    if (file.isEmpty) throw BusinessException("El archivo está vacío")
    if (file.contentType !in allowedTypes) throw BusinessException("Solo se aceptan imágenes (JPG, PNG, WEBP)")
    if (extension.isNullOrBlank() || extension !in allowedExtensions) throw BusinessException("Extensión no permitida. Solo JPG, PNG, WEBP")
}
