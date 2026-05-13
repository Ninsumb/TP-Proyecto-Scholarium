package com.unsam.scholarium.service

import com.cloudinary.Cloudinary
import com.cloudinary.utils.ObjectUtils
import com.unsam.scholarium.exception.BusinessException
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile

interface FileStorageService {

    fun upload(file: MultipartFile): String

    fun delete(fileUrl: String): Boolean
}

@Service
class CloudinaryFileStorageService(
    private val cloudinary: Cloudinary
) : FileStorageService {

    private val allowedTypes = listOf(
        "image/png",
        "image/jpeg",
        "application/pdf"
    )

    override fun upload(file: MultipartFile): String {
        if (file.isEmpty) throw BusinessException("El archivo está vacío")
        if (file.contentType !in allowedTypes) throw BusinessException("Tipo de archivo no permitido")

        return try {

            val result = cloudinary.uploader().upload(
                file.bytes,
                ObjectUtils.emptyMap()
            )

            result["secure_url"].toString()

        } catch (e: Exception) {

            throw BusinessException(
                "Error al subir archivo: ${e.message}"
            )
        }
    }

    override fun delete(fileUrl: String): Boolean {
        return try {

            val publicId = extractPublicId(fileUrl)

            val result = cloudinary.uploader().destroy(
                publicId,
                ObjectUtils.emptyMap()
            )

            result["result"] == "ok"

        } catch (e: Exception) {
            throw BusinessException("Error al eliminar archivo: ${e.message}")
        }
    }

    private fun extractPublicId(url: String): String {

        val fileName = url.substringAfterLast("/")

        return fileName.substringBeforeLast(".")
    }
}

