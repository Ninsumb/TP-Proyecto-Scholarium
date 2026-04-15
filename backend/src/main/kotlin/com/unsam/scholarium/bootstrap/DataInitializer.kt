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
        passwordEncoder: PasswordEncoder
    ) = CommandLineRunner {

        if (usuarioRepo.count() == 0L) {
            val usuario = usuarioRepo.save(
                Usuario(
                    nombre = "Valentino",
                    email = "test@test.com",
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
                    usuario = usuario,
                    portal = portal,
                    rol = RolMembresia.ADMIN
                )
            )
            println("Datos cargados correctamente.")
        } else {
            println("La base de datos ya tiene datos, omitiendo inicialización...")
        }
    }
}
