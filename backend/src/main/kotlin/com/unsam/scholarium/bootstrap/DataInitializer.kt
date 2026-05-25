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
        carpetaRepo: CarpetaRepository,
        materiaRepo: MateriaRepository,
        materialRepo: MaterialRepository,
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
                    universidad = "Universidad Nacional de San Martín",
                    carrera = "Tecnicatura en Programación Informática",
                    descripcion = "Portal de la carrera de Programacion, Full Stack, C y lenguajes raros."
                )
            )

            portalRepo.save(Portal(universidad = "Universidad Nacional de San Martín", carrera = "Tecnicatura en Redes Informáticas", descripcion = "Maria Claudia"))
            portalRepo.save(Portal(universidad = "Universidad Nacional de San Martín", carrera = "Licenciatura en Ciencias de Datos", descripcion = "ven datos"))
            portalRepo.save(Portal(universidad = "Universidad Nacional de San Martín", carrera = "Ingenieria Espacial", descripcion = "Tampoco es que es ciencia de cohetes lol"))
            portalRepo.save(Portal(universidad = "Universidad Nacional de San Martín", carrera = "Ingenieria en Alimentos", descripcion = "Estudian el diseño y la construccion de los alimentos"))
            portalRepo.save(Portal(universidad = "Universidad Nacional de San Martín", carrera = "Licenciatura en OnlyFans", descripcion = "La profesion millonaria del futuro."))
            portalRepo.save(Portal(universidad = "UTN", carrera = "Ingenieria Electronica", descripcion = "Ley del culon"))
            portalRepo.save(Portal(universidad = "UTN", carrera = "Ingenieria Informatica", descripcion = "Dijkstra"))
            portalRepo.save(Portal(universidad = "UADE", carrera = "Cualquier Carrera", descripcion = "Te vendemos el titulo por $3241234214"))


            val carpeta = carpetaRepo.save(
                Carpeta(
                    nombre = "carpeta test",
                    portal = portal,
                )
            )

            val materia = materiaRepo.save(
                Materia(
                    nombre = "Mate 1",
                    carpeta = carpeta,
                )
            )

            val material = materialRepo.save(
                Material(
                    nombre = "Primer parcial 2025",
                    descripcion = "parcial del primer cuatrimestre de 2025",
                    tipo = TipoMaterial.PARCIAL,
                    url = "https://test.com",
                    publicId = "test/test.pdf",
                    tamanio = 8,
                    tipoArchivo = "pdf",
                    materia = materia,
                    usuario = noAdmin,
                )
            )

            membresiaRepo.save(
                Membresia(
                    usuario = admin,
                    portal = portal,
                    rol = RolMembresia.ADMIN
                )
            )

            membresiaRepo.save(
                Membresia(
                    usuario = noAdmin,
                    portal = portal,
                    rol = RolMembresia.MIEMBRO
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