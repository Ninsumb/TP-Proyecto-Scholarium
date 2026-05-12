package com.unsam.scholarium.service

import com.unsam.scholarium.dto.UsuarioPortalResponse
import com.unsam.scholarium.exception.ElementDoesNotExistException
import com.unsam.scholarium.repository.CarpetaRepository
import com.unsam.scholarium.repository.MateriaRepository
import com.unsam.scholarium.repository.MembresiaRepository
import com.unsam.scholarium.repository.UsuarioRepository
import org.springframework.stereotype.Service

@Service
class UsuarioService(
    private val usuarioRepository: UsuarioRepository,
    private val membresiaRepository: MembresiaRepository,
    private val carpetaRepository: CarpetaRepository,
    private val materiaRepository: MateriaRepository
) {

    fun getMisPortales(email: String): List<UsuarioPortalResponse> {

        val usuario = usuarioRepository.findByEmail(email)
            ?: throw ElementDoesNotExistException("Usuario no encontrado")

        val membresias = membresiaRepository
            .findByUsuarioOrderByFechaRegistroDesc(usuario)

        return membresias.map { membresia ->

            val portal = membresia.portal
                ?: throw IllegalStateException("La membresía no tiene portal")

            val cantidadMiembros = membresiaRepository.countByPortal(portal)

            val cantidadMaterias = materiaRepository.countByPortal(portal)

            UsuarioPortalResponse(
                id = portal.id!!,
                universidad = portal.universidad,
                carrera = portal.carrera,
                descripcion = portal.descripcion,
                logoUrl = portal.logoUrl,
                rol = membresia.rol,
                cantidadMiembros = cantidadMiembros,
                cantidadMaterias = cantidadMaterias
            )
        }
    }
}