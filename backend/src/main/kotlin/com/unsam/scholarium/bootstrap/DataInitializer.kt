package com.unsam.scholarium.bootstrap

import com.unsam.scholarium.model.*
import com.unsam.scholarium.repository.*
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.boot.CommandLineRunner
import org.springframework.security.crypto.password.PasswordEncoder

@Configuration
class DataInitializer {

    @Bean
    fun init(
        usuarioRepo: UsuarioRepository,
        portalRepo: PortalRepository,
        membresiaRepo: MembresiaRepository,
        solicitudRepo: SolicitudRepository,
        passwordEncoder: PasswordEncoder
    ) = CommandLineRunner {

        if (usuarioRepo.count() == 0L) {
            val admin = usuarioRepo.save(
                Usuario(
                    nombre = "Valentino",
                    email = "test@test.com",
                    password = passwordEncoder.encode("1234")
                )
            )

            val solicitante = usuarioRepo.save(
                Usuario(
                    nombre = "Juan",
                    email = "juan@test.com",
                    password = passwordEncoder.encode("1234")
                )
            )

            val noAdmin = usuarioRepo.save(
                Usuario(
                    nombre = "Pedro",
                    email = "pedro@test.com",
                    password = passwordEncoder.encode("1234")
                )
            )

            val portal = portalRepo.save(
                Portal(
                    universidad = "UNSAM",
                    carrera = "Programación"
                )
            )

            membresiaRepo.save(
                Membresia(
                    usuario = admin,
                    portal = portal,
                    rol = RolMembresia.ADMIN
                )
            )

            solicitudRepo.save(
                Solicitud(
                    usuario = solicitante,
                    portal = portal,
                    titulo = "Solicitud de ingreso",
                    estado = Estado.PENDIENTE,
                    descripcion = "Quiero unirme al portal de Programación"
                )
            )

            println("Datos cargados correctamente.")
        } else {
            println("La base de datos ya tiene datos, omitiendo inicialización...")
        }
    }
}